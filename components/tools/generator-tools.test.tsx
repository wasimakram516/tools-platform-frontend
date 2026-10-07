import { configure, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { PasswordGeneratorTool } from "@/components/tools/password-generator-tool";
import { QrCodeTool } from "@/components/tools/qr-code-tool";
import { RandomGeneratorTool } from "@/components/tools/random-generator-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

beforeAll(() => {
  // This machine runs the suite slowly, so allow asynchronous checks more time before failing.
  configure({ asyncUtilTimeout: 4000 });
});

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * A source that returns the given numbers in turn, so a test controls every draw.
 */
function sequence(...values: number[]): () => number {
  let index = 0;

  return () => values[index++ % values.length] ?? 0;
}

/**
 * Types into a labelled field.
 */
function fill(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * Reads the text of a generated value row.
 */
function valueText(testId: string): string {
  return screen.getByTestId(testId).textContent ?? "";
}

/**
 * Picks an option from a labelled dropdown.
 */
function choose(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
}

describe("PasswordGeneratorTool", () => {
  it("makes five passwords of 16 characters when it opens, and says how strong they are", async () => {
    renderTool(<PasswordGeneratorTool />);

    await screen.findByTestId("value-password-1");

    for (const number of [1, 2, 3, 4, 5]) {
      expect(valueText(`value-password-${number}`)).toHaveLength(16);
    }

    // 16 characters from 89 (lower, upper, digits, 27 symbols): 16 * log2(89) = 103.6 bits.
    expect(screen.getByText("Very strong · about 103.6 bits")).toBeInTheDocument();
  });

  it("follows the length slider and makes new passwords with each change", async () => {
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    const before = valueText("value-password-1");

    fireEvent.change(screen.getByRole("slider", { name: /Length/ }), { target: { value: "24" } });

    expect(valueText("value-password-1")).toHaveLength(24);
    expect(valueText("value-password-1")).not.toBe(before);
  });

  it("explains when no kind of character is left", async () => {
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    for (const label of ["Lower case letters (a-z)", "Capital letters (A-Z)", "Numbers (0-9)", "Symbols (!@#$…)"]) {
      fireEvent.click(screen.getByLabelText(label));
    }

    expect(screen.getByText("Choose at least one kind of character.")).toBeInTheDocument();
    expect(screen.queryByTestId("value-password-1")).not.toBeInTheDocument();
  });

  it("makes a single value without a Copy all button, and one with it for several", async () => {
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    expect(screen.getByRole("button", { name: "Copy all" })).toBeInTheDocument();

    fill("How many", "1");

    expect(screen.getByTestId("value-password-1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy all" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy Password" })).toBeInTheDocument();
  });

  it("switches to passphrases, PINs, and tokens", async () => {
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    fireEvent.click(screen.getByRole("button", { name: "Passphrase" }));
    expect(valueText("value-passphrase-1").split("-")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "EFF short word list" })).toBeInTheDocument();
    // 5 words of 10.34 bits is 51.7 bits.
    expect(screen.getByText("Fair · about 51.7 bits")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PIN" }));
    expect(valueText("value-pin-1")).toMatch(/^\d{6}$/);

    fireEvent.click(screen.getByRole("button", { name: "Token" }));
    expect(valueText("value-token-1")).toMatch(/^[0-9a-f]{32}$/);
    expect(screen.getByText("Very strong · about 128 bits")).toBeInTheDocument();
  });

  it("copies one value and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    const first = valueText("value-password-1");

    fireEvent.click(screen.getByRole("button", { name: "Copy Password 1" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(first));
    expect(await screen.findByText("Password 1 copied.")).toBeInTheDocument();
  });

  it("makes new values with Generate again", async () => {
    renderTool(<PasswordGeneratorTool />);
    await screen.findByTestId("value-password-1");

    const before = valueText("value-password-1");

    fireEvent.click(screen.getByRole("button", { name: "Generate again" }));

    expect(valueText("value-password-1")).not.toBe(before);
  });
});

describe("QrCodeTool", () => {
  /**
   * Renders the QR tool with downloads and the PNG drawing replaced.
   */
  function renderQr() {
    const download = vi.fn();
    const renderPng = vi.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" }));

    renderTool(<QrCodeTool download={download} renderPng={renderPng} />);

    return { download, renderPng };
  }

  it("asks for details before showing a code", () => {
    renderQr();

    expect(screen.getByText("Enter a web address.")).toBeInTheDocument();
    expect(screen.queryByAltText("Your QR code")).not.toBeInTheDocument();
  });

  it("makes a code for a web address as you type, and shows what it holds and how big it is", () => {
    renderQr();
    fill("Web address", "example.com");

    const image = screen.getByAltText("Your QR code") as HTMLImageElement;

    expect(image.src).toContain("data:image/svg+xml");
    expect(screen.getByText("What this code contains")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    // https://example.com is 19 bytes, which needs version 2 (25 modules) at level M, plus a quiet zone
    // of 4 on each side: 33 modules, and 512 / 33 rounds down to 15 pixels each, which is 495.
    expect(screen.getByText("Version 2 · 25 × 25 modules · PNG 495 × 495 px")).toBeInTheDocument();
  });

  it("makes a Wi-Fi code in the format phones read", () => {
    renderQr();
    choose("Make a code for", "Wi-Fi network");
    fill("Network name (SSID)", "Home");
    fill("Password", "secret123");

    expect(screen.getByText("WIFI:T:WPA;S:Home;P:secret123;;")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Hidden network"));

    expect(screen.getByText("WIFI:T:WPA;S:Home;P:secret123;H:true;;")).toBeInTheDocument();
  });

  it("keeps what you typed when you switch between kinds", () => {
    renderQr();
    fill("Web address", "example.com");
    choose("Make a code for", "Text");
    fill("Text", "Hello");
    choose("Make a code for", "Web address");

    expect(screen.getByLabelText("Web address")).toHaveValue("example.com");
  });

  it("warns when the colours would not scan", () => {
    renderQr();
    fill("Web address", "example.com");

    expect(screen.queryByText(/too close together/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Code colour"), { target: { value: "#cccccc" } });

    expect(screen.getByText(/too close together/)).toBeInTheDocument();
  });

  it("explains text that is too long for the error correction level", () => {
    renderQr();
    choose("Make a code for", "Text");
    fill("Text", "x".repeat(1500));

    expect(screen.getByAltText("Your QR code")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "H" }));

    expect(screen.getByText(/too long for a QR code at this error correction level/)).toBeInTheDocument();
    expect(screen.queryByAltText("Your QR code")).not.toBeInTheDocument();
  });

  it("downloads an SVG and a PNG, and copies the contents", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    const { download, renderPng } = renderQr();

    fill("Web address", "example.com");
    fireEvent.click(screen.getByRole("button", { name: "Download SVG" }));

    expect(download).toHaveBeenCalledWith(expect.any(Blob), "qr-code.svg");
    expect((download.mock.calls[0]?.[0] as Blob).type).toBe("image/svg+xml");

    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));

    await waitFor(() => expect(download).toHaveBeenCalledWith(expect.any(Blob), "qr-code.png"));
    expect(renderPng).toHaveBeenCalledWith(
      expect.objectContaining({ size: 25 }),
      { background: "#ffffff", foreground: "#000000", quietZone: 4, requestedPixels: 512 },
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy contents" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://example.com"));
  });

  it("says so when the PNG cannot be made", async () => {
    const download = vi.fn();

    renderTool(<QrCodeTool download={download} renderPng={vi.fn().mockResolvedValue(null)} />);
    fill("Web address", "example.com");
    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));

    expect(await screen.findByText("This browser could not make the PNG. Download the SVG instead.")).toBeInTheDocument();
    expect(download).not.toHaveBeenCalled();
  });
});

describe("RandomGeneratorTool", () => {
  it("draws numbers from a range, with their sum, and explains a bad range", () => {
    renderTool(<RandomGeneratorTool source={sequence(0, 5, 2)} />);

    fill("Smallest", "1");
    fill("Largest", "6");
    fill("How many", "3");
    fireEvent.click(screen.getByRole("button", { name: "Draw numbers" }));

    // Draws 0, 5, 2 over 1 to 6 are 1, 6, 3.
    expect(screen.getByRole("group", { name: "Numbers drawn" })).toHaveTextContent("1 6 3");
    expect(screen.getByText("Sum", { selector: "dt" }).nextElementSibling).toHaveTextContent("10");

    fill("Smallest", "9");
    fireEvent.click(screen.getByRole("button", { name: "Draw again" }));

    expect(screen.getByText("The smallest number is larger than the largest. Swap them.")).toBeInTheDocument();
  });

  it("refuses more different numbers than the range holds", () => {
    renderTool(<RandomGeneratorTool />);

    fill("Smallest", "1");
    fill("Largest", "10");
    fill("How many", "11");
    fireEvent.click(screen.getByLabelText("No repeats"));
    fireEvent.click(screen.getByRole("button", { name: "Draw numbers" }));

    expect(screen.getByText(/There are only 10 different numbers/)).toBeInTheDocument();
  });

  it("rolls dice and flips coins", () => {
    renderTool(<RandomGeneratorTool source={sequence(0, 5)} />);
    fireEvent.click(screen.getByRole("button", { name: "Dice and coin" }));

    fireEvent.click(screen.getByRole("button", { name: "Roll the dice" }));

    // Two six-sided dice with draws 0 and 5 roll 1 and 6.
    expect(within(screen.getByRole("status", { name: "Dice result" })).getByText("7")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Flip the coin" }));

    expect(within(screen.getByRole("status", { name: "Coin result" })).getByText("Heads")).toBeInTheDocument();
  });

  it("picks a winner from a list, and explains an empty list", () => {
    renderTool(<RandomGeneratorTool source={sequence(0)} />);
    fireEvent.click(screen.getByRole("button", { name: "List picker" }));

    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(screen.getByText("Add at least one item, one per line.")).toBeInTheDocument();

    fill("Your list", "Ann\nBob\nCara\nDan");
    expect(screen.getByText("4 items")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pick" }));

    // Always drawing 0 shuffles the four into Bob, Cara, Dan, Ann, so the first winner is Bob.
    expect(within(screen.getByRole("group", { name: "Result" })).getByText("Bob")).toBeInTheDocument();
  });

  it("splits a list into fair teams", () => {
    renderTool(<RandomGeneratorTool source={sequence(0)} />);
    fireEvent.click(screen.getByRole("button", { name: "List picker" }));
    fill("Your list", "Ann\nBob\nCara\nDan");
    // One "Make teams" button picks the mode and a second, further down, runs it.
    fireEvent.click(within(screen.getByRole("group", { name: "What to do with the list" })).getByRole("button", { name: "Make teams" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Make teams" }).at(-1) as HTMLElement);

    const teams = screen.getByRole("group", { name: "Teams" });

    expect(within(teams).getByText("Team 1 (2)")).toBeInTheDocument();
    expect(within(teams).getByText("Team 2 (2)")).toBeInTheDocument();
  });

  it("keeps a typed list when you switch to another mode and back", () => {
    renderTool(<RandomGeneratorTool />);
    fireEvent.click(screen.getByRole("button", { name: "List picker" }));
    fill("Your list", "Ann\nBob");
    fireEvent.click(screen.getByRole("button", { name: "Numbers" }));
    fireEvent.click(screen.getByRole("button", { name: "List picker" }));

    expect(screen.getByLabelText("Your list")).toHaveValue("Ann\nBob");
  });
});
