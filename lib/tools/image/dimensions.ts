import { type CalculationFailure, failure } from "@/lib/tools/dates/result";

export interface Size {
  height: number;
  width: number;
}

export interface Rect extends Size {
  x: number;
  y: number;
}

export type Rotation = 0 | 90 | 180 | 270;

export interface Orientation {
  flipHorizontal: boolean;
  flipVertical: boolean;
  /** Clockwise, in degrees. */
  rotation: Rotation;
}

export type ResizeFit = "contain" | "cover" | "stretch";

export type CropAnchor =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type ResizeSpec =
  | { mode: "keep" }
  | { mode: "percent"; percent: number }
  | {
      anchor: CropAnchor;
      fit: ResizeFit;
      /** Whole pixels, or null to work it out from the other side. */
      height: number | null;
      mode: "pixels";
      width: number | null;
    };

export interface ResizePlan {
  /** The size of the finished image. */
  output: Size;
  /** The part of the (already rotated and flipped) source that fills the output. */
  source: Rect;
}

/** The largest side a browser canvas reliably handles. */
export const MAX_OUTPUT_DIMENSION = 16_384;
/** The most pixels in one image, to stay inside typical browser canvas limits. */
export const MAX_OUTPUT_PIXELS = 100_000_000;
export const MIN_PERCENT = 1;
export const MAX_PERCENT = 1000;

export const NO_ROTATION: Orientation = { flipHorizontal: false, flipVertical: false, rotation: 0 };

/**
 * Returns the size of an image once it has been rotated, which swaps the sides for a quarter turn.
 */
export function orientedSize(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270 ? { height: size.width, width: size.height } : size;
}

/**
 * Turns the image a quarter turn clockwise or counter-clockwise.
 */
export function rotateBy(rotation: Rotation, direction: "clockwise" | "counterclockwise"): Rotation {
  const step = direction === "clockwise" ? 90 : 270;

  return ((rotation + step) % 360) as Rotation;
}

/**
 * Where, from 0 (start) to 1 (end), an anchor sits along each axis.
 */
function anchorFractions(anchor: CropAnchor): { x: number; y: number } {
  const x = anchor.endsWith("left") || anchor === "left" ? 0 : anchor.endsWith("right") || anchor === "right" ? 1 : 0.5;
  const y = anchor.startsWith("top") ? 0 : anchor.startsWith("bottom") ? 1 : 0.5;

  return { x, y };
}

/**
 * Checks a finished size against the limits and returns it, or a message saying what is wrong.
 */
function checkOutput(output: Size): Size | CalculationFailure {
  if (output.width > MAX_OUTPUT_DIMENSION || output.height > MAX_OUTPUT_DIMENSION) {
    return failure(`Images can be at most ${MAX_OUTPUT_DIMENSION.toLocaleString("en-US")} pixels on a side.`);
  }

  if (output.width * output.height > MAX_OUTPUT_PIXELS) {
    return failure("That size is too large for a browser to create. Choose a smaller size.");
  }

  return output;
}

/**
 * Reads a whole-pixel size from a field, or returns a message when it is not a whole number.
 */
function wholePixels(value: number | null): number | null | CalculationFailure {
  if (value === null) {
    return null;
  }

  return Number.isInteger(value) && value >= 1 ? value : failure("Sizes must be whole numbers of 1 pixel or more.");
}

/**
 * Cuts the largest area with the box's shape out of the source, placed by the anchor.
 */
function coverCrop(source: Size, box: Size, anchor: CropAnchor): Rect {
  const boxIsWider = box.width / box.height > source.width / source.height;
  const width = boxIsWider ? source.width : Math.round((source.height * box.width) / box.height);
  const height = boxIsWider ? Math.round((source.width * box.height) / box.width) : source.height;
  const fractions = anchorFractions(anchor);

  return {
    height,
    width,
    x: Math.round((source.width - width) * fractions.x),
    y: Math.round((source.height - height) * fractions.y),
  };
}

/**
 * Works out the finished size and which part of the source to use, for a requested size in
 * pixels or percent, with fit, fill-and-crop, or stretch.
 */
export function planResize(source: Size, spec: ResizeSpec): ResizePlan | CalculationFailure {
  const whole: Rect = { ...source, x: 0, y: 0 };
  let output: Size;
  let area = whole;

  if (spec.mode === "keep") {
    output = source;
  } else if (spec.mode === "percent") {
    if (!Number.isFinite(spec.percent) || spec.percent < MIN_PERCENT || spec.percent > MAX_PERCENT) {
      return failure(`Enter a percentage from ${MIN_PERCENT} to ${MAX_PERCENT}.`);
    }

    output = {
      height: Math.max(1, Math.round((source.height * spec.percent) / 100)),
      width: Math.max(1, Math.round((source.width * spec.percent) / 100)),
    };
  } else {
    const width = wholePixels(spec.width);
    const height = wholePixels(spec.height);

    if (typeof width === "object" && width !== null) {
      return width;
    }

    if (typeof height === "object" && height !== null) {
      return height;
    }

    if (width === null && height === null) {
      return failure("Enter a width, a height, or both.");
    }

    if (width === null || height === null) {
      const scale = width === null ? (height ?? 1) / source.height : width / source.width;

      output = {
        height: height ?? Math.max(1, Math.round(source.height * scale)),
        width: width ?? Math.max(1, Math.round(source.width * scale)),
      };
    } else if (spec.fit === "stretch") {
      output = { height, width };
    } else if (spec.fit === "cover") {
      output = { height, width };
      area = coverCrop(source, output, spec.anchor);
    } else {
      const scale = Math.min(width / source.width, height / source.height);

      output = {
        height: Math.max(1, Math.round(source.height * scale)),
        width: Math.max(1, Math.round(source.width * scale)),
      };
    }
  }

  const checked = checkOutput(output);

  return "ok" in checked ? checked : { output: checked, source: area };
}

/**
 * Lists the sizes to draw through when shrinking a lot. Halving at each step and finishing at
 * the target gives a much smoother result than one big jump, which tends to look jagged.
 */
export function downscaleSteps(from: Size, to: Size): Size[] {
  const steps: Size[] = [];
  let current = from;

  while (current.width / 2 >= to.width && current.height / 2 >= to.height) {
    current = { height: Math.round(current.height / 2), width: Math.round(current.width / 2) };
    steps.push(current);
  }

  const last = steps[steps.length - 1];

  if (!last || last.width !== to.width || last.height !== to.height) {
    steps.push(to);
  }

  return steps;
}

/**
 * Works out the height that keeps an image's shape for a given width, in whole pixels.
 */
export function heightForWidth(size: Size, width: number): number {
  return Math.max(1, Math.round((size.height * width) / size.width));
}

/**
 * Works out the width that keeps an image's shape for a given height, in whole pixels.
 */
export function widthForHeight(size: Size, height: number): number {
  return Math.max(1, Math.round((size.width * height) / size.height));
}
