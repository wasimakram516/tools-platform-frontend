// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  applyCrop,
  ASPECT_OPTIONS,
  clampCrop,
  cropToRatio,
  dragCrop,
  fullCrop,
  MIN_CROP_SIZE,
  ratioFor,
} from "@/lib/tools/image/crop";

const BOUNDS = { height: 600, width: 800 };
const BOX = { height: 200, width: 300, x: 100, y: 100 };

describe("fullCrop, clampCrop, and ratioFor", () => {
  it("starts with the whole image", () => {
    expect(fullCrop(BOUNDS)).toEqual({ height: 600, width: 800, x: 0, y: 0 });
  });

  it("keeps a crop inside the image, at whole pixels, and at least the minimum size", () => {
    expect(clampCrop({ height: 100.4, width: 50.6, x: 10.5, y: 20.2 }, BOUNDS)).toEqual({ height: 100, width: 51, x: 11, y: 20 });
    expect(clampCrop({ height: 900, width: 900, x: -50, y: -50 }, BOUNDS)).toEqual({ height: 600, width: 800, x: 0, y: 0 });
    expect(clampCrop({ height: 100, width: 100, x: 790, y: 590 }, BOUNDS)).toEqual({ height: 100, width: 100, x: 700, y: 500 });
    expect(clampCrop({ height: 1, width: 1, x: 0, y: 0 }, BOUNDS)).toMatchObject({ height: MIN_CROP_SIZE, width: MIN_CROP_SIZE });
  });

  it("lets a tiny image be cropped to its own size", () => {
    expect(clampCrop({ height: 2, width: 2, x: 0, y: 0 }, { height: 4, width: 4 })).toMatchObject({ height: 4, width: 4 });
  });

  it("reads the ratio of each shape, using the image's own shape for 'same as the image'", () => {
    const ratio = (id: string) => ratioFor(ASPECT_OPTIONS.find((option) => option.id === id) ?? ASPECT_OPTIONS[0]!, BOUNDS);

    expect(ratio("free")).toBeNull();
    expect(ratio("original")).toBeCloseTo(800 / 600);
    expect(ratio("1:1")).toBe(1);
    expect(ratio("16:9")).toBeCloseTo(16 / 9);
  });
});

describe("cropToRatio", () => {
  it("leaves a free crop alone", () => {
    expect(cropToRatio(BOX, null, BOUNDS)).toEqual(BOX);
  });

  it("shrinks to the shape around the centre without growing", () => {
    // 300 by 200 as a square keeps the height of 200 and the same centre (250, 200).
    expect(cropToRatio(BOX, 1, BOUNDS)).toEqual({ height: 200, width: 200, x: 150, y: 100 });
    // 16:9 keeps the full 300 width and takes 168.75 pixels of height, centred on y = 200, so the
    // top is 200 - 84.375 = 115.625, which rounds to 116.
    expect(cropToRatio(BOX, 16 / 9, BOUNDS)).toEqual({ height: 169, width: 300, x: 100, y: 116 });
  });
});

describe("dragCrop", () => {
  it("moves the box, and stops at the edges of the image", () => {
    expect(dragCrop(BOX, "move", 50, -30, BOUNDS, null)).toEqual({ height: 200, width: 300, x: 150, y: 70 });
    expect(dragCrop(BOX, "move", 9999, 9999, BOUNDS, null)).toEqual({ height: 200, width: 300, x: 500, y: 400 });
    expect(dragCrop(BOX, "move", -9999, -9999, BOUNDS, null)).toEqual({ height: 200, width: 300, x: 0, y: 0 });
  });

  it("pulls one edge", () => {
    expect(dragCrop(BOX, "e", 40, 999, BOUNDS, null)).toEqual({ height: 200, width: 340, x: 100, y: 100 });
    expect(dragCrop(BOX, "w", -40, 0, BOUNDS, null)).toEqual({ height: 200, width: 340, x: 60, y: 100 });
    expect(dragCrop(BOX, "n", 0, 30, BOUNDS, null)).toEqual({ height: 170, width: 300, x: 100, y: 130 });
    expect(dragCrop(BOX, "s", 0, 30, BOUNDS, null)).toEqual({ height: 230, width: 300, x: 100, y: 100 });
  });

  it("pulls a corner, and stops at the image edge and at the minimum size", () => {
    expect(dragCrop(BOX, "se", 20, 10, BOUNDS, null)).toEqual({ height: 210, width: 320, x: 100, y: 100 });
    expect(dragCrop(BOX, "nw", -50, -50, BOUNDS, null)).toEqual({ height: 250, width: 350, x: 50, y: 50 });
    expect(dragCrop(BOX, "se", 9999, 9999, BOUNDS, null)).toEqual({ height: 500, width: 700, x: 100, y: 100 });
    expect(dragCrop(BOX, "nw", 9999, 9999, BOUNDS, null)).toEqual({
      height: MIN_CROP_SIZE,
      width: MIN_CROP_SIZE,
      x: 392,
      y: 292,
    });
  });

  it("cannot be dragged inside out", () => {
    const result = dragCrop(BOX, "w", 9999, 0, BOUNDS, null);

    expect(result.width).toBe(MIN_CROP_SIZE);
    expect(result.x + result.width).toBe(400);
  });

  it("keeps the shape when a corner is dragged with a ratio", () => {
    const square = { height: 200, width: 200, x: 100, y: 100 };

    expect(dragCrop(square, "se", 50, 0, BOUNDS, 1)).toEqual({ height: 250, width: 250, x: 100, y: 100 });
    expect(dragCrop(square, "nw", -40, 0, BOUNDS, 1)).toEqual({ height: 240, width: 240, x: 60, y: 60 });

    const wide = { height: 90, width: 160, x: 0, y: 0 };

    expect(dragCrop(wide, "se", 160, 0, BOUNDS, 16 / 9)).toEqual({ height: 180, width: 320, x: 0, y: 0 });
  });

  it("does not grow past the image when keeping the shape", () => {
    const result = dragCrop({ height: 200, width: 200, x: 500, y: 300 }, "se", 9999, 9999, BOUNDS, 1);

    expect(result.x + result.width).toBeLessThanOrEqual(BOUNDS.width);
    expect(result.y + result.height).toBeLessThanOrEqual(BOUNDS.height);
    expect(result.width).toBe(result.height);
  });

  it("ignores edge handles while a ratio is locked", () => {
    expect(dragCrop(BOX, "e", 40, 0, BOUNDS, 1.5)).toEqual(BOX);
  });
});

describe("applyCrop", () => {
  it("moves the plan's source area to the crop's place in the whole image", () => {
    expect(
      applyCrop({ output: { height: 50, width: 100 }, source: { height: 200, width: 400, x: 10, y: 20 } }, { height: 300, width: 500, x: 100, y: 200 }),
    ).toEqual({ output: { height: 50, width: 100 }, source: { height: 200, width: 400, x: 110, y: 220 } });
  });
});
