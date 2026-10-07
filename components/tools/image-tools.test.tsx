import { configure, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { CropBox } from "@/components/tools/crop-box";
import { FaviconGeneratorTool } from "@/components/tools/favicon-generator-tool";
import { FileDropZone } from "@/components/tools/file-drop-zone";
import { ImageCompressorTool } from "@/components/tools/image-compressor-tool";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import type { ImageProcessor, RenderOptions } from "@/lib/tools/image/image-processing";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

beforeAll(() => {
  // This machine runs the suite slowly, so allow asynchronous checks more time before failing.
  configure({ asyncUtilTimeout: 4000 });

  // jsdom has no object URLs and its Blob cannot be read back, which the tools rely on.
  Object.assign(URL, { createObjectURL: vi.fn(() => "blob:fake"), revokeObjectURL: vi.fn() });

  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob): Promise<ArrayBuffer> {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this);
      });
    };
  }
});

/**
 * Builds a file of a given size and type without any real image data.
 */
function imageFile(name: string, bytes: number, type = "image/png"): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

interface FakeOptions {
  /** How many bytes a rendered image takes. */
  renderedBytes?: number;
}

/**
 * A stand-in for the browser's canvas code: every image is 200 by 100, and rendering returns a
 * file of a known size, so the screens can be tested without a canvas.
 */
function fakeProcessor({ renderedBytes = 500 }: FakeOptions = {}): ImageProcessor {
  return {
    load: vi.fn(async (file: File) => {
      if (file.name.startsWith("broken")) {
        return { message: `${file.name} could not be read. It may be damaged.`, ok: false as const };
      }

      return {
        image: { element: {} as HTMLImageElement, file, height: 100, url: "blob:original", width: 200 },
        ok: true as const,
      };
    }),
    release: vi.fn(),
    render: vi.fn(async (_source, options: RenderOptions) => ({
      image: {
        blob: new Blob([new Uint8Array(renderedBytes)], { type: `image/${options.format}` }),
        fellBack: false,
        format: options.format,
        height: options.plan.output.height,
        width: options.plan.output.width,
      },
      ok: true as const,
    })),
    renderIcon: vi.fn(async (_source, options) => ({
      image: {
        blob: new Blob([new Uint8Array(options.size)], { type: "image/png" }),
        fellBack: false,
        format: "png" as const,
        height: options.size,
        width: options.size,
      },
      ok: true as const,
    })),
  };
}

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * Chooses files through a labelled file input.
 */
function choose(label: string, ...files: File[]): void {
  fireEvent.change(screen.getByLabelText(label), { target: { files } });
}

describe("FileDropZone", () => {
  it("passes on chosen files, and only one when it takes a single file", () => {
    const onFiles = vi.fn();

    render(
      <AppThemeProvider>
        <FileDropZone accept="image/*" hint="Hint" id="f" label="Pick" onFiles={onFiles} />
      </AppThemeProvider>,
    );
    choose("Pick", imageFile("a.png", 1), imageFile("b.png", 1));

    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.png" })]);
  });

  it("accepts files dropped on it", () => {
    const onFiles = vi.fn();

    render(
      <AppThemeProvider>
        <FileDropZone accept="image/*" hint="Hint" id="f" label="Pick" multiple onFiles={onFiles} />
      </AppThemeProvider>,
    );
    fireEvent.drop(screen.getByText(/Drop images here/), {
      dataTransfer: { files: [imageFile("a.png", 1), imageFile("b.png", 1)] },
    });

    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.png" }), expect.objectContaining({ name: "b.png" })]);
  });
});

describe("FileDropZone, the whole area", () => {
  /**
   * Renders a drop zone and returns what it reports.
   */
  function renderZone(): { onFiles: ReturnType<typeof vi.fn> } {
    const onFiles = vi.fn();

    render(
      <AppThemeProvider>
        <FileDropZone accept="image/*" hint="Hint" id="f" label="Pick" onFiles={onFiles} />
      </AppThemeProvider>,
    );

    return { onFiles };
  }

  it("opens the file picker when any part of the area is clicked", () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined);

    renderZone();
    fireEvent.click(screen.getByText("Hint"));

    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("opens the file picker from the keyboard like a button", () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined);

    renderZone();

    const zone = screen.getByRole("button", { name: /Pick/ });

    fireEvent.keyDown(zone, { key: "Enter" });
    fireEvent.keyDown(zone, { key: " " });
    fireEvent.keyDown(zone, { key: "a" });

    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });

  it("takes an image pasted from the clipboard, and ignores pasted text", () => {
    const { onFiles } = renderZone();

    fireEvent.paste(document, { clipboardData: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();

    fireEvent.paste(document, { clipboardData: { files: [imageFile("pasted.png", 1)] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "pasted.png" })]);
  });
});

describe("CropBox", () => {
  const SIZE = { height: 600, width: 800 };
  const START = { height: 200, width: 300, x: 100, y: 100 };

  afterEach(() => vi.restoreAllMocks());

  /**
   * Draws a crop box whose frame is shown at half size, and returns what it reports.
   */
  function renderBox(ratio: number | null = null): { onChange: ReturnType<typeof vi.fn> } {
    const onChange = vi.fn();

    render(
      <AppThemeProvider>
        <CropBox imageUrl="blob:picture" onChange={onChange} ratio={ratio} size={SIZE} value={START} />
      </AppThemeProvider>,
    );

    // jsdom has no layout, so say the 800 by 600 picture is shown at 400 by 300.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 300, height: 300, left: 0, right: 400, top: 0, width: 400, x: 0, y: 0, toJSON: () => ({}),
    });

    return { onChange };
  }

  /**
   * Fires a pointer event, which jsdom builds as a plain mouse event with the same coordinates.
   */
  function pointer(element: Element, type: string, clientX: number, clientY: number): void {
    fireEvent(element, new MouseEvent(type, { bubbles: true, clientX, clientY }));
  }

  it("describes the crop area for screen readers", () => {
    renderBox();

    expect(
      screen.getByRole("group", { name: /Crop area: 300 by 200 pixels, starting 100 across and 100 down/ }),
    ).toBeInTheDocument();
  });

  it("moves with the arrow keys, in bigger steps with Shift", () => {
    const { onChange } = renderBox();
    const box = screen.getByRole("group", { name: /Crop area/ });

    fireEvent.keyDown(box, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith({ ...START, x: 101 });

    fireEvent.keyDown(box, { key: "ArrowUp", shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith({ ...START, y: 90 });

    onChange.mockClear();
    fireEvent.keyDown(box, { key: "a" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves when dragged, turning screen pixels into the picture's pixels", () => {
    const { onChange } = renderBox();
    const box = screen.getByRole("group", { name: /Crop area/ });

    pointer(box, "pointerdown", 100, 100);
    pointer(box, "pointermove", 150, 130);

    // 50 screen pixels across is 100 picture pixels, and 30 down is 60.
    expect(onChange).toHaveBeenLastCalledWith({ ...START, x: 200, y: 160 });

    pointer(box, "pointerup", 150, 130);
    onChange.mockClear();
    pointer(box, "pointermove", 300, 300);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("resizes from a handle", () => {
    const { onChange } = renderBox();
    const handle = screen.getByLabelText("Resize from the bottom right");

    pointer(handle, "pointerdown", 0, 0);
    pointer(handle, "pointermove", 20, 10);

    expect(onChange).toHaveBeenLastCalledWith({ ...START, height: 220, width: 340 });
  });

  it("offers only the corners while a ratio is locked", () => {
    renderBox(1);

    expect(screen.getByLabelText("Resize from the top left")).toBeInTheDocument();
    expect(screen.queryByLabelText("Resize from the top")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Resize from the left")).not.toBeInTheDocument();
  });
});

describe("ImageCompressorTool", () => {
  it("compresses an image and shows the size before and after", async () => {
    const processor = fakeProcessor({ renderedBytes: 500 });

    renderTool(<ImageCompressorTool download={vi.fn()} processor={processor} />);
    choose("Choose images", imageFile("photo.png", 2000));

    expect(await screen.findByText("photo.webp")).toBeInTheDocument();
    // The size appears on the image's card and in the batch summary above the list.
    expect(screen.getAllByText(/2 KB → 500 B/)).toHaveLength(2);
    expect(screen.getByText("75% smaller")).toBeInTheDocument();
    expect(screen.getByText("1 image: 2 KB → 500 B (75% smaller)")).toBeInTheDocument();
  });

  it("shows a loading state on the image while a changed setting is applied", async () => {
    renderTool(<ImageCompressorTool download={vi.fn()} processor={fakeProcessor()} />);
    choose("Choose images", imageFile("photo.png", 2000));
    await screen.findByText("photo.webp");

    expect(screen.queryByRole("progressbar", { name: "Working on photo.png" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "JPEG" }));

    expect(screen.getByRole("progressbar", { name: "Working on photo.png" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Updating images" })).toBeInTheDocument();
    expect(screen.queryByText("75% smaller")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();

    expect(await screen.findByText("photo.jpg")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "Working on photo.png" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeEnabled();
  });

  it("converts to the chosen format and downloads under the new name", async () => {
    const download = vi.fn();
    const processor = fakeProcessor();

    renderTool(<ImageCompressorTool download={download} processor={processor} />);
    choose("Choose images", imageFile("photo.png", 2000));
    await screen.findByText("photo.webp");

    fireEvent.click(screen.getByRole("button", { name: "JPEG" }));

    expect(await screen.findByText("photo.jpg")).toBeInTheDocument();
    expect(processor.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ background: "#ffffff", format: "jpeg" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(download).toHaveBeenCalledWith(expect.any(Blob), "photo.jpg");
  });

  it("keeps the original when re-saving the same format does not make it smaller", async () => {
    const processor = fakeProcessor({ renderedBytes: 900 });

    renderTool(<ImageCompressorTool download={vi.fn()} processor={processor} />);
    choose("Choose images", imageFile("small.jpg", 400, "image/jpeg"));
    await screen.findByText("small.webp");

    fireEvent.click(screen.getByRole("button", { name: "Keep format" }));

    expect(await screen.findByText(/Kept the original/)).toBeInTheDocument();
    expect(screen.getByText("small.jpg")).toBeInTheDocument();
    expect(screen.getByText("Same size")).toBeInTheDocument();
  });

  it("limits the width and never enlarges", async () => {
    const processor = fakeProcessor();

    renderTool(<ImageCompressorTool download={vi.fn()} processor={processor} />);
    choose("Choose images", imageFile("photo.png", 2000));
    await screen.findByText("photo.webp");

    fireEvent.change(screen.getByLabelText("Maximum width (px)"), { target: { value: "100" } });

    await waitFor(() =>
      expect(processor.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ plan: expect.objectContaining({ output: { height: 50, width: 100 } }) }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Maximum width (px)"), { target: { value: "5000" } });

    await waitFor(() =>
      expect(processor.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ plan: expect.objectContaining({ output: { height: 100, width: 200 } }) }),
      ),
    );
  });

  it("downloads several images as one zip, and reports a file that cannot be read", async () => {
    const download = vi.fn();

    renderTool(<ImageCompressorTool download={download} processor={fakeProcessor()} />);
    choose("Choose images", imageFile("a.png", 2000), imageFile("b.png", 2000), imageFile("broken.png", 10));

    expect(await screen.findByText("broken.png could not be read. It may be damaged.")).toBeInTheDocument();
    await screen.findByText("a.webp");
    await screen.findByText("b.webp");
    await waitFor(() => expect(screen.getByText(/2 images: 3.9 KB → 1000 B/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Download all (.zip)" }));

    await waitFor(() => expect(download).toHaveBeenCalledWith(expect.any(Blob), "images.zip"));
    expect((download.mock.calls[0]?.[0] as Blob).type).toBe("application/zip");
  });

  it("removes an image and frees it", async () => {
    const processor = fakeProcessor();

    renderTool(<ImageCompressorTool download={vi.fn()} processor={processor} />);
    choose("Choose images", imageFile("photo.png", 2000));
    await screen.findByText("photo.webp");

    fireEvent.click(screen.getByRole("button", { name: "Remove photo.png" }));

    expect(processor.release).toHaveBeenCalled();
    expect(screen.queryByText("photo.webp")).not.toBeInTheDocument();
  });

  it("explains that PNG quality does not apply", async () => {
    renderTool(<ImageCompressorTool download={vi.fn()} processor={fakeProcessor()} />);

    fireEvent.click(screen.getByRole("button", { name: "PNG" }));

    expect(screen.getByText(/PNG is lossless/)).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /Quality/ })).toBeDisabled();
  });
});

describe("ImageResizerTool", () => {
  /**
   * Opens an image in the resizer and waits for the first preview.
   */
  async function openImage(processor: ImageProcessor, download = vi.fn()): Promise<void> {
    renderTool(<ImageResizerTool download={download} processor={processor} />);
    choose("Choose an image", imageFile("photo.png", 2000));
    await screen.findByAltText("Preview of the resized image", {}, { timeout: 4000 });
  }

  it("starts at the image's own size and shows the original", async () => {
    await openImage(fakeProcessor());

    expect(screen.getByLabelText("Width (px)")).toHaveValue(200);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(100);
    expect(screen.getByText("Original 200 × 100 · 2 KB")).toBeInTheDocument();
  });

  it("keeps the proportions when the width changes", async () => {
    const processor = fakeProcessor();

    await openImage(processor);
    fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "100" } });

    expect(screen.getByLabelText("Height (px)")).toHaveValue(50);
    await waitFor(() =>
      expect(processor.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ plan: expect.objectContaining({ output: { height: 50, width: 100 } }) }),
      ),
    );
    expect(await screen.findByText(/New 100 × 50/)).toBeInTheDocument();
  });

  it("shows a loading state over the preview while a changed setting is applied", async () => {
    await openImage(fakeProcessor());

    expect(screen.queryByRole("progressbar", { name: "Updating the preview" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "100" } });

    expect(screen.getByRole("progressbar", { name: "Updating the preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();

    expect(await screen.findByText(/New 100 × 50/)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "Updating the preview" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeEnabled();
  });

  it("scales by a percentage", async () => {
    const processor = fakeProcessor();

    await openImage(processor);
    fireEvent.click(screen.getByRole("button", { name: "Percent" }));

    expect(await screen.findByText(/New 100 × 50/)).toBeInTheDocument();
  });

  it("swaps the sides when the image is rotated", async () => {
    await openImage(fakeProcessor());

    fireEvent.click(screen.getByRole("button", { name: "Rotate right" }));

    expect(screen.getByLabelText("Width (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(200);
    expect(await screen.findByText(/New 100 × 200/)).toBeInTheDocument();
  });

  it("fills in a common size and offers the crop controls", async () => {
    const processor = fakeProcessor();

    await openImage(processor);
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Common sizes" }));
    fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: /Full HD/ }));

    expect(screen.getByLabelText("Width (px)")).toHaveValue(1920);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(1080);
    // The dropdown shows which size was chosen, and forgets it once the size is edited by hand.
    expect(screen.getByRole("combobox", { name: "Common sizes" })).toHaveTextContent("Full HD (1920 × 1080)");
    expect(screen.getByRole("button", { name: "Fill and crop" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Keep this part of the image" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Top left" }));

    await waitFor(() =>
      expect(processor.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ plan: expect.objectContaining({ output: { height: 1080, width: 1920 } }) }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "1000" } });

    expect(screen.getByRole("combobox", { name: "Common sizes" })).not.toHaveTextContent("Full HD");
  });

  it("crops freely: the box appears, and the size and the drawing follow the crop", async () => {
    const processor = fakeProcessor();

    await openImage(processor);
    expect(screen.queryByRole("group", { name: /Crop area/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Crop the image"));

    expect(await screen.findByRole("group", { name: /Crop area/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Crop width (px)")).toHaveValue(200);

    fireEvent.change(screen.getByLabelText("Crop width (px)"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Left (px)"), { target: { value: "40" } });

    // The output size follows the crop, because no size of its own was chosen.
    expect(screen.getByLabelText("Width (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(100);
    expect(screen.getByText("Crop 100 × 100")).toBeInTheDocument();

    await waitFor(() =>
      expect(processor.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          plan: { output: { height: 100, width: 100 }, source: { height: 100, width: 100, x: 40, y: 0 } },
        }),
      ),
    );
    expect(await screen.findByText(/New 100 × 100/)).toBeInTheDocument();
  });

  it("keeps a chosen output width while the crop changes shape", async () => {
    await openImage(fakeProcessor());

    fireEvent.click(screen.getByLabelText("Crop the image"));
    await screen.findByRole("group", { name: /Crop area/ });
    fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Crop width (px)"), { target: { value: "100" } });

    // A 100 by 100 crop shown 50 wide is 50 tall.
    expect(screen.getByLabelText("Width (px)")).toHaveValue(50);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(50);
  });

  it("reshapes the crop to a chosen shape, and can reset it", async () => {
    await openImage(fakeProcessor());

    fireEvent.click(screen.getByLabelText("Crop the image"));
    await screen.findByRole("group", { name: /Crop area/ });

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Crop shape" }));
    fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Square (1:1)" }));

    expect(screen.getByLabelText("Crop width (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Crop height (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Left (px)")).toHaveValue(50);

    // With the shape locked, changing the width changes the height with it.
    fireEvent.change(screen.getByLabelText("Crop width (px)"), { target: { value: "60" } });
    expect(screen.getByLabelText("Crop height (px)")).toHaveValue(60);

    fireEvent.click(screen.getByRole("button", { name: "Reset the crop" }));

    expect(screen.getByLabelText("Crop width (px)")).toHaveValue(200);
    expect(screen.getByLabelText("Crop height (px)")).toHaveValue(100);
  });

  it("starts the crop again when the image is turned, and when the crop is switched off", async () => {
    await openImage(fakeProcessor());

    fireEvent.click(screen.getByLabelText("Crop the image"));
    await screen.findByRole("group", { name: /Crop area/ });
    fireEvent.change(screen.getByLabelText("Crop width (px)"), { target: { value: "100" } });

    fireEvent.click(screen.getByRole("button", { name: "Rotate right" }));

    expect(screen.getByLabelText("Crop width (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Crop height (px)")).toHaveValue(200);

    fireEvent.click(screen.getByLabelText("Crop the image"));

    expect(screen.queryByRole("group", { name: /Crop area/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Width (px)")).toHaveValue(100);
    expect(screen.getByLabelText("Height (px)")).toHaveValue(200);
  });

  it("explains an invalid size instead of drawing it", async () => {
    await openImage(fakeProcessor());

    fireEvent.click(screen.getByLabelText("Keep proportions"));
    fireEvent.change(screen.getByLabelText("Width (px)"), { target: { value: "0" } });

    expect(await screen.findByText("Sizes must be whole numbers of 1 pixel or more.")).toBeInTheDocument();
  });

  it("downloads the result under a name that includes its size", async () => {
    const download = vi.fn();

    await openImage(fakeProcessor(), download);
    await screen.findByText(/New 200 × 100/);
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(download).toHaveBeenCalledWith(expect.any(Blob), "photo-200x100.jpg");
  });

  it("reports an image that cannot be read", async () => {
    renderTool(<ImageResizerTool download={vi.fn()} processor={fakeProcessor()} />);
    choose("Choose an image", imageFile("broken.png", 10));

    expect(await screen.findByText("broken.png could not be read. It may be damaged.")).toBeInTheDocument();
  });
});

describe("FaviconGeneratorTool", () => {
  /**
   * Opens an image in the favicon generator and waits for the icons.
   */
  async function openImage(processor = fakeProcessor(), download = vi.fn()): Promise<void> {
    renderTool(<FaviconGeneratorTool download={download} processor={processor} />);
    choose("Choose an image", imageFile("logo.png", 2000));
    await screen.findByRole("button", { name: "favicon-16x16.png" }, { timeout: 4000 });
    await waitFor(() => expect(screen.getByRole("button", { name: "favicon-16x16.png" })).toBeEnabled(), { timeout: 4000 });
  }

  it("makes every size and lists the tags to paste", async () => {
    await openImage();

    for (const name of [
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon-48x48.png",
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }

    expect(screen.getByText(/rel="manifest"/)).toBeInTheDocument();
  });

  it("downloads one icon", async () => {
    const download = vi.fn();

    await openImage(fakeProcessor(), download);
    fireEvent.click(screen.getByRole("button", { name: "favicon-32x32.png" }));

    expect(download).toHaveBeenCalledWith(expect.any(Blob), "favicon-32x32.png");
  });

  it("downloads favicon.ico and the whole set as a zip", async () => {
    const download = vi.fn();

    await openImage(fakeProcessor(), download);
    fireEvent.click(screen.getByRole("button", { name: "Download favicon.ico" }));

    await waitFor(() => expect(download).toHaveBeenCalledWith(expect.any(Blob), "favicon.ico"));

    fireEvent.click(screen.getByRole("button", { name: "Download all (.zip)" }));

    await waitFor(() => expect(download).toHaveBeenCalledWith(expect.any(Blob), "favicons.zip"));
  });

  it("disables the downloads while the icons are made again", async () => {
    await openImage();

    fireEvent.click(screen.getByRole("button", { name: "Crop to square" }));

    expect(screen.getByRole("button", { name: "favicon-16x16.png" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download all (.zip)" })).toBeDisabled();

    await waitFor(() => expect(screen.getByRole("button", { name: "favicon-16x16.png" })).toBeEnabled());
  });

  it("makes the icons again when a setting changes", async () => {
    const processor = fakeProcessor();

    await openImage(processor);
    fireEvent.click(screen.getByRole("button", { name: "Crop to square" }));

    await waitFor(() =>
      expect(processor.renderIcon).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ fit: "cover" })),
    );
    expect(screen.getByRole("group", { name: "Keep this part of the image" })).toBeInTheDocument();
  });

  it("copies the tags", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    await openImage();
    fireEvent.click(screen.getByRole("button", { name: "Copy tags" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("apple-touch-icon")));
    expect(await screen.findByText("Tags copied.")).toBeInTheDocument();
  });
});
