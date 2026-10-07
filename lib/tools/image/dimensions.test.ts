// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  downscaleSteps,
  heightForWidth,
  MAX_OUTPUT_DIMENSION,
  orientedSize,
  planResize,
  rotateBy,
  widthForHeight,
  type CropAnchor,
  type ResizeFit,
  type ResizeSpec,
} from "@/lib/tools/image/dimensions";

const WIDE = { height: 400, width: 1000 };
const TALL = { height: 1000, width: 400 };

/**
 * Builds a request for an exact size in pixels.
 */
function pixels(
  width: number | null,
  height: number | null,
  fit: ResizeFit = "contain",
  anchor: CropAnchor = "center",
): ResizeSpec {
  return { anchor, fit, height, mode: "pixels", width };
}

describe("orientedSize and rotateBy", () => {
  it("swaps the sides for a quarter turn", () => {
    expect(orientedSize(WIDE, 0)).toEqual(WIDE);
    expect(orientedSize(WIDE, 90)).toEqual({ height: 1000, width: 400 });
    expect(orientedSize(WIDE, 180)).toEqual(WIDE);
    expect(orientedSize(WIDE, 270)).toEqual({ height: 1000, width: 400 });
  });

  it("turns clockwise and counter-clockwise through all four positions", () => {
    expect(rotateBy(0, "clockwise")).toBe(90);
    expect(rotateBy(270, "clockwise")).toBe(0);
    expect(rotateBy(0, "counterclockwise")).toBe(270);
    expect(rotateBy(90, "counterclockwise")).toBe(0);
  });
});

describe("planResize", () => {
  it("keeps the original size", () => {
    expect(planResize(WIDE, { mode: "keep" })).toEqual({
      output: WIDE,
      source: { height: 400, width: 1000, x: 0, y: 0 },
    });
  });

  it("scales by a percentage, never below 1 pixel", () => {
    expect(planResize(WIDE, { mode: "percent", percent: 50 })).toMatchObject({ output: { height: 200, width: 500 } });
    expect(planResize({ height: 50, width: 100 }, { mode: "percent", percent: 33 })).toMatchObject({
      output: { height: 17, width: 33 },
    });
    expect(planResize({ height: 10, width: 10 }, { mode: "percent", percent: 1 })).toMatchObject({
      output: { height: 1, width: 1 },
    });
  });

  it("rejects a percentage outside the range", () => {
    expect(planResize(WIDE, { mode: "percent", percent: 0 })).toMatchObject({ ok: false });
    expect(planResize(WIDE, { mode: "percent", percent: 1001 })).toMatchObject({ ok: false });
    expect(planResize(WIDE, { mode: "percent", percent: Number.NaN })).toMatchObject({ ok: false });
  });

  it("works out the missing side from the aspect ratio", () => {
    expect(planResize(WIDE, pixels(500, null))).toMatchObject({ output: { height: 200, width: 500 } });
    expect(planResize(WIDE, pixels(null, 200))).toMatchObject({ output: { height: 200, width: 500 } });
  });

  it("fits inside the box without changing the shape", () => {
    expect(planResize(WIDE, pixels(300, 300, "contain"))).toEqual({
      output: { height: 120, width: 300 },
      source: { height: 400, width: 1000, x: 0, y: 0 },
    });
  });

  it("stretches to the exact box", () => {
    expect(planResize(WIDE, pixels(300, 300, "stretch"))).toEqual({
      output: { height: 300, width: 300 },
      source: { height: 400, width: 1000, x: 0, y: 0 },
    });
  });

  it("fills the box and crops the sides of a wide image, placed by the anchor", () => {
    const crop = (anchor: CropAnchor) => planResize(WIDE, pixels(300, 300, "cover", anchor));

    expect(crop("center")).toEqual({ output: { height: 300, width: 300 }, source: { height: 400, width: 400, x: 300, y: 0 } });
    expect(crop("left")).toMatchObject({ source: { height: 400, width: 400, x: 0, y: 0 } });
    expect(crop("right")).toMatchObject({ source: { height: 400, width: 400, x: 600, y: 0 } });
    expect(crop("top-right")).toMatchObject({ source: { x: 600, y: 0 } });
  });

  it("fills the box and crops the top and bottom of a tall image", () => {
    const crop = (anchor: CropAnchor) => planResize(TALL, pixels(800, 200, "cover", anchor));

    expect(crop("center")).toMatchObject({ output: { height: 200, width: 800 }, source: { height: 100, width: 400, x: 0, y: 450 } });
    expect(crop("top")).toMatchObject({ source: { y: 0 } });
    expect(crop("bottom")).toMatchObject({ source: { y: 900 } });
  });

  it("rejects missing, zero, fractional, and oversized sizes", () => {
    expect(planResize(WIDE, pixels(null, null))).toMatchObject({ ok: false });
    expect(planResize(WIDE, pixels(0, 100))).toMatchObject({ ok: false });
    expect(planResize(WIDE, pixels(2.5, 100))).toMatchObject({ ok: false });
    expect(planResize(WIDE, pixels(MAX_OUTPUT_DIMENSION + 1, 100, "stretch"))).toMatchObject({ ok: false });
    expect(planResize(WIDE, pixels(MAX_OUTPUT_DIMENSION + 1, null))).toMatchObject({ ok: false });
  });

  it("limits the finished size, not the box, when fitting inside", () => {
    expect(planResize(WIDE, pixels(MAX_OUTPUT_DIMENSION + 1, 100, "contain"))).toMatchObject({
      output: { height: 100, width: 250 },
    });
  });

  it("allows up to 100 million pixels and no more", () => {
    expect(planResize(WIDE, pixels(10_000, 10_000, "stretch"))).toMatchObject({ output: { height: 10_000, width: 10_000 } });
    expect(planResize(WIDE, pixels(10_001, 10_000, "stretch"))).toMatchObject({ ok: false });
  });
});

describe("downscaleSteps", () => {
  it("halves until one more halving would go below the target", () => {
    expect(downscaleSteps({ height: 3000, width: 4000 }, { height: 375, width: 500 })).toEqual([
      { height: 1500, width: 2000 },
      { height: 750, width: 1000 },
      { height: 375, width: 500 },
    ]);
    expect(downscaleSteps({ height: 1000, width: 1000 }, { height: 300, width: 300 })).toEqual([
      { height: 500, width: 500 },
      { height: 300, width: 300 },
    ]);
  });

  it("goes straight to the target when it is not much smaller, or larger", () => {
    expect(downscaleSteps({ height: 1000, width: 1000 }, { height: 700, width: 700 })).toEqual([{ height: 700, width: 700 }]);
    expect(downscaleSteps({ height: 100, width: 100 }, { height: 400, width: 400 })).toEqual([{ height: 400, width: 400 }]);
  });
});

describe("heightForWidth and widthForHeight", () => {
  it("keep the shape in whole pixels", () => {
    expect(heightForWidth(WIDE, 500)).toBe(200);
    expect(widthForHeight(WIDE, 200)).toBe(500);
    expect(heightForWidth({ height: 3, width: 4 }, 100)).toBe(75);
    expect(heightForWidth({ height: 1, width: 1000 }, 10)).toBe(1);
  });
});
