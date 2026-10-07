import type { ResizePlan, Size } from "@/lib/tools/image/dimensions";

export interface CropRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

export type CropHandle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface AspectOption {
  id: string;
  label: string;
  /** Width divided by height, or null for a free shape. */
  ratio: number | null;
}

/** The smallest crop, in pixels, so the box can never shrink to nothing. */
export const MIN_CROP_SIZE = 8;

export const ASPECT_OPTIONS: readonly AspectOption[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "original", label: "Same as the image", ratio: -1 },
  { id: "1:1", label: "Square (1:1)", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "9:16", label: "Tall (9:16)", ratio: 9 / 16 },
];

/**
 * Keeps a value between a lower and an upper limit.
 */
function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/**
 * The smallest crop allowed for an image, which is tiny images' own size when they are smaller
 * than the usual minimum.
 */
function minimumFor(bounds: Size): { height: number; width: number } {
  return { height: Math.min(MIN_CROP_SIZE, bounds.height), width: Math.min(MIN_CROP_SIZE, bounds.width) };
}

/**
 * A crop that covers the whole image, which means no crop.
 */
export function fullCrop(bounds: Size): CropRect {
  return { height: bounds.height, width: bounds.width, x: 0, y: 0 };
}

/**
 * Turns an aspect option into a width-over-height ratio for an image. "Same as the image" uses
 * the image's own shape; "Free" has no ratio.
 */
export function ratioFor(option: AspectOption, bounds: Size): number | null {
  return option.ratio === -1 ? bounds.width / bounds.height : option.ratio;
}

/**
 * Forces a crop to whole pixels inside the image and at least the minimum size.
 */
export function clampCrop(rect: CropRect, bounds: Size): CropRect {
  const minimum = minimumFor(bounds);
  const width = clamp(Math.round(rect.width), minimum.width, bounds.width);
  const height = clamp(Math.round(rect.height), minimum.height, bounds.height);

  return {
    height,
    width,
    x: clamp(Math.round(rect.x), 0, bounds.width - width),
    y: clamp(Math.round(rect.y), 0, bounds.height - height),
  };
}

/**
 * Reshapes a crop to a ratio. It shrinks the box (never grows it) around its centre, so
 * choosing a shape never selects more of the image than before.
 */
export function cropToRatio(rect: CropRect, ratio: number | null, bounds: Size): CropRect {
  if (ratio === null) {
    return rect;
  }

  const width = Math.min(rect.width, rect.height * ratio);
  const height = width / ratio;
  const centreX = rect.x + rect.width / 2;
  const centreY = rect.y + rect.height / 2;

  return clampCrop({ height, width, x: centreX - width / 2, y: centreY - height / 2 }, bounds);
}

/**
 * Applies a drag to a crop. "move" slides the whole box; the other handles pull an edge or a
 * corner. With a ratio set, corners keep the shape and edges do nothing.
 */
export function dragCrop(
  start: CropRect,
  handle: CropHandle,
  deltaX: number,
  deltaY: number,
  bounds: Size,
  ratio: number | null,
): CropRect {
  if (handle === "move") {
    return {
      ...start,
      x: Math.round(clamp(start.x + deltaX, 0, bounds.width - start.width)),
      y: Math.round(clamp(start.y + deltaY, 0, bounds.height - start.height)),
    };
  }

  const isCorner = handle.length === 2;

  if (ratio !== null && !isCorner) {
    return start;
  }

  const minimum = minimumFor(bounds);
  let left = start.x;
  let right = start.x + start.width;
  let top = start.y;
  let bottom = start.y + start.height;

  if (handle.includes("w")) {
    left = clamp(left + deltaX, 0, right - minimum.width);
  }

  if (handle.includes("e")) {
    right = clamp(right + deltaX, left + minimum.width, bounds.width);
  }

  if (handle.includes("n")) {
    top = clamp(top + deltaY, 0, bottom - minimum.height);
  }

  if (handle.includes("s")) {
    bottom = clamp(bottom + deltaY, top + minimum.height, bounds.height);
  }

  if (ratio !== null) {
    const fromTop = handle.includes("n");
    const fromLeft = handle.includes("w");
    const room = fromTop ? bottom : bounds.height - top;
    let height = Math.min((right - left) / ratio, room);
    let width = height * ratio;

    height = Math.max(height, minimum.height);
    width = Math.max(width, minimum.width);

    if (fromLeft) {
      left = right - width;
    } else {
      right = left + width;
    }

    if (fromTop) {
      top = bottom - height;
    } else {
      bottom = top + height;
    }
  }

  return clampCrop({ height: bottom - top, width: right - left, x: left, y: top }, bounds);
}

/**
 * Moves a plan's source area so it points into the whole image, when the plan was made for just
 * the cropped part. The plan's own source is measured from the crop's top-left corner.
 */
export function applyCrop(plan: ResizePlan, crop: CropRect): ResizePlan {
  return {
    output: plan.output,
    source: {
      height: plan.source.height,
      width: plan.source.width,
      x: crop.x + plan.source.x,
      y: crop.y + plan.source.y,
    },
  };
}
