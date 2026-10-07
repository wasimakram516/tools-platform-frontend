import { type CalculationFailure, failure } from "@/lib/tools/dates/result";
import {
  type CropAnchor,
  downscaleSteps,
  NO_ROTATION,
  orientedSize,
  type Orientation,
  planResize,
  type ResizePlan,
  type Size,
} from "@/lib/tools/image/dimensions";
import {
  ACCEPTED_IMAGE_TYPES,
  formatById,
  MAX_IMAGE_FILE_BYTES,
  MAX_SOURCE_PIXELS,
  type ImageFormatId,
} from "@/lib/tools/image/format";

/** Used for an SVG that does not say how big it is. */
const DEFAULT_SVG_SIZE = 512;

export interface LoadedImage {
  element: HTMLImageElement;
  file: File;
  height: number;
  /** A temporary address for showing the original. Release it with releaseImage. */
  url: string;
  width: number;
}

export interface RenderOptions {
  /** A colour to paint behind transparent areas, or null to keep them transparent. */
  background: string | null;
  format: ImageFormatId;
  /** Flips apply after the rotation, as you see the image. */
  orientation: Orientation;
  plan: ResizePlan;
  /** From 0 to 1; used by JPEG and WebP. */
  quality: number;
}

export interface RenderedImage {
  blob: Blob;
  /** True when the browser could not make the requested format and made a PNG instead. */
  fellBack: boolean;
  format: ImageFormatId;
  height: number;
  width: number;
}

export type LoadResult = { image: LoadedImage; ok: true } | CalculationFailure;
export type RenderResult = { image: RenderedImage; ok: true } | CalculationFailure;

/**
 * The functions a screen needs to read and write images. Screens take this as a prop so tests
 * can supply a stand-in, because jsdom has no canvas.
 */
export interface ImageProcessor {
  load: (file: File) => Promise<LoadResult>;
  release: (image: LoadedImage) => void;
  render: (source: LoadedImage, options: RenderOptions) => Promise<RenderResult>;
  renderIcon: (source: LoadedImage, options: IconRenderOptions) => Promise<RenderResult>;
}

/**
 * Reads a file into an image the page can draw, after checking its type and size.
 */
export async function loadImage(file: File): Promise<LoadResult> {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return failure(`${file.name} is not an image type this tool can read. Use PNG, JPEG, WebP, GIF, BMP, AVIF, or SVG.`);
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return failure(`${file.name} is larger than ${MAX_IMAGE_FILE_BYTES / 1024 / 1024} MB.`);
  }

  const url = URL.createObjectURL(file);
  const element = new Image();

  element.src = url;

  try {
    await element.decode();
  } catch {
    URL.revokeObjectURL(url);

    return failure(`${file.name} could not be read. It may be damaged.`);
  }

  const width = element.naturalWidth || DEFAULT_SVG_SIZE;
  const height = element.naturalHeight || DEFAULT_SVG_SIZE;

  if (width * height > MAX_SOURCE_PIXELS) {
    URL.revokeObjectURL(url);

    return failure(`${file.name} has too many pixels for a browser to handle (${width} by ${height}).`);
  }

  return { image: { element, file, height, url, width }, ok: true };
}

/**
 * Frees the temporary address made for an image.
 */
export function releaseImage(image: LoadedImage): void {
  URL.revokeObjectURL(image.url);
}

/**
 * Makes a canvas of a size, or null when the browser refuses (usually from running out of memory).
 */
function createCanvas(size: Size): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } | null {
  const canvas = document.createElement("canvas");

  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  return { canvas, context };
}

/**
 * Releases a canvas's memory straight away instead of waiting for the browser to collect it.
 */
function discard(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Draws the source turned and flipped, and returns it as a canvas of the turned size.
 */
function drawOriented(source: LoadedImage, orientation: Orientation): HTMLCanvasElement | null {
  const size = orientedSize({ height: source.height, width: source.width }, orientation.rotation);
  const made = createCanvas(size);

  if (!made) {
    return null;
  }

  const { context } = made;

  context.translate(size.width / 2, size.height / 2);
  context.scale(orientation.flipHorizontal ? -1 : 1, orientation.flipVertical ? -1 : 1);
  context.rotate((orientation.rotation * Math.PI) / 180);
  context.drawImage(source.element, -source.width / 2, -source.height / 2, source.width, source.height);

  return made.canvas;
}

/**
 * Encodes a canvas as a file of the requested type.
 */
function encode(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

interface Drawn {
  canvas: HTMLCanvasElement;
  /** Frees every canvas used along the way. Call it once the result has been used. */
  release: () => void;
}

/**
 * Draws the part of the source named by the plan, turned and flipped, at the planned size.
 * Large reductions are done in halving steps so the result stays smooth.
 */
function drawScaled(
  source: LoadedImage,
  orientation: Orientation,
  plan: ResizePlan,
  background: string | null,
): Drawn | CalculationFailure {
  const isTurned = orientation.rotation !== 0 || orientation.flipHorizontal || orientation.flipVertical;
  const oriented = isTurned ? drawOriented(source, orientation) : null;

  if (isTurned && !oriented) {
    return failure("The browser ran out of memory preparing this image. Try a smaller one.");
  }

  const steps = downscaleSteps({ height: plan.source.height, width: plan.source.width }, plan.output);
  const canvases: HTMLCanvasElement[] = oriented ? [oriented] : [];
  const release = (): void => canvases.forEach(discard);
  let current: CanvasImageSource = oriented ?? source.element;
  let area = plan.source;

  for (const [index, step] of steps.entries()) {
    const made = createCanvas(step);

    if (!made) {
      release();

      return failure("The browser ran out of memory resizing this image. Try a smaller size.");
    }

    if (index === steps.length - 1 && background) {
      made.context.fillStyle = background;
      made.context.fillRect(0, 0, step.width, step.height);
    }

    made.context.drawImage(current, area.x, area.y, area.width, area.height, 0, 0, step.width, step.height);
    current = made.canvas;
    area = { ...step, x: 0, y: 0 };
    canvases.push(made.canvas);
  }

  return { canvas: current as HTMLCanvasElement, release };
}

/**
 * Encodes a canvas as a file, falling back to PNG in a browser that cannot write the format.
 */
async function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: ImageFormatId,
  quality: number,
  size: Size,
): Promise<RenderResult> {
  const requested = formatById(format);
  const blob = await encode(canvas, requested.mime, quality);

  if (!blob) {
    return failure("The browser could not save this image. Try another format.");
  }

  const fellBack = blob.type !== requested.mime;

  return {
    image: { blob, fellBack, format: fellBack ? "png" : format, height: size.height, width: size.width },
    ok: true,
  };
}

/**
 * Draws the image to the planned size and encodes it. A browser that cannot write the requested
 * format gets a PNG instead.
 */
export async function renderImage(source: LoadedImage, options: RenderOptions): Promise<RenderResult> {
  const drawn = drawScaled(source, options.orientation, options.plan, options.background);

  if ("ok" in drawn) {
    return drawn;
  }

  const result = await encodeCanvas(drawn.canvas, options.format, options.quality, options.plan.output);

  drawn.release();

  return result;
}

export interface IconRenderOptions {
  anchor: CropAnchor;
  /** A colour for the square behind the picture, or null for a transparent icon. */
  background: string | null;
  /** 0 for square corners up to 50 for a circle, as a percentage of the icon's side. */
  cornerRadiusPercent: number;
  /** Fit the whole picture inside the square, or fill the square and crop. */
  fit: "contain" | "cover";
  /** Space around the picture, as a percentage of the icon's side. */
  paddingPercent: number;
  /** The icon's side in pixels. */
  size: number;
}

/**
 * Traces a rectangle with rounded corners as the current clipping shape.
 */
function clipRoundedSquare(context: CanvasRenderingContext2D, side: number, radius: number): void {
  context.beginPath();
  context.moveTo(radius, 0);
  context.arcTo(side, 0, side, side, radius);
  context.arcTo(side, side, 0, side, radius);
  context.arcTo(0, side, 0, 0, radius);
  context.arcTo(0, 0, side, 0, radius);
  context.closePath();
  context.clip();
}

/**
 * Makes one square PNG icon from the image: the picture sized and placed inside optional
 * padding, on an optional background, with optionally rounded corners.
 */
export async function renderIcon(source: LoadedImage, options: IconRenderOptions): Promise<RenderResult> {
  const inner = Math.max(1, Math.round(options.size * (1 - (2 * options.paddingPercent) / 100)));
  const plan = planResize(
    { height: source.height, width: source.width },
    { anchor: options.anchor, fit: options.fit, height: inner, mode: "pixels", width: inner },
  );

  if ("ok" in plan) {
    return plan;
  }

  const drawn = drawScaled(source, NO_ROTATION, plan, null);

  if ("ok" in drawn) {
    return drawn;
  }

  const made = createCanvas({ height: options.size, width: options.size });

  if (!made) {
    drawn.release();

    return failure("The browser ran out of memory making the icon.");
  }

  const radius = (Math.min(options.cornerRadiusPercent, 50) / 100) * options.size;

  made.context.save();
  clipRoundedSquare(made.context, options.size, radius);

  if (options.background) {
    made.context.fillStyle = options.background;
    made.context.fillRect(0, 0, options.size, options.size);
  }

  made.context.drawImage(
    drawn.canvas,
    Math.round((options.size - plan.output.width) / 2),
    Math.round((options.size - plan.output.height) / 2),
  );
  made.context.restore();
  drawn.release();

  const result = await encodeCanvas(made.canvas, "png", 1, { height: options.size, width: options.size });

  discard(made.canvas);

  return result;
}

/**
 * The real browser implementation, used by default.
 */
export const browserImageProcessor: ImageProcessor = {
  load: loadImage,
  release: releaseImage,
  render: renderImage,
  renderIcon,
};
