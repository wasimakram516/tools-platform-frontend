// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  findQualityForTarget,
  MIN_TARGET_QUALITY,
  resizeForMaxWidth,
  resolveFormat,
  shouldKeepOriginal,
} from "@/lib/tools/image/compress-plan";

describe("resolveFormat", () => {
  it("keeps the file's own format when it can be written", () => {
    expect(resolveFormat("image/jpeg", "keep")).toEqual({ format: "jpeg", usedFallback: false });
    expect(resolveFormat("image/webp", "keep")).toEqual({ format: "webp", usedFallback: false });
  });

  it("uses PNG for types the browser cannot write, and says so", () => {
    for (const type of ["image/gif", "image/bmp", "image/avif", "image/svg+xml"]) {
      expect(resolveFormat(type, "keep")).toEqual({ format: "png", usedFallback: true });
    }
  });

  it("uses the chosen format whatever the file is", () => {
    expect(resolveFormat("image/png", "webp")).toEqual({ format: "webp", usedFallback: false });
    expect(resolveFormat("image/gif", "jpeg")).toEqual({ format: "jpeg", usedFallback: false });
  });
});

describe("resizeForMaxWidth", () => {
  const source = { height: 1500, width: 2000 };

  it("keeps the size when there is no limit or the image is already narrower", () => {
    expect(resizeForMaxWidth(source, null)).toEqual({ mode: "keep" });
    expect(resizeForMaxWidth(source, 2000)).toEqual({ mode: "keep" });
    expect(resizeForMaxWidth(source, 5000)).toEqual({ mode: "keep" });
  });

  it("limits the width and works out the height", () => {
    expect(resizeForMaxWidth(source, 800)).toEqual({
      anchor: "center",
      fit: "contain",
      height: null,
      mode: "pixels",
      width: 800,
    });
  });
});

describe("shouldKeepOriginal", () => {
  const base = { keepSmaller: true, newBytes: 900, originalBytes: 1000, sameFormat: true };

  it("keeps the original only when re-saving did not make a same-format file smaller", () => {
    expect(shouldKeepOriginal(base)).toBe(false);
    expect(shouldKeepOriginal({ ...base, newBytes: 1000 })).toBe(true);
    expect(shouldKeepOriginal({ ...base, newBytes: 1200 })).toBe(true);
  });

  it("never overrides a chosen format change or a turned-off option", () => {
    expect(shouldKeepOriginal({ ...base, newBytes: 1200, sameFormat: false })).toBe(false);
    expect(shouldKeepOriginal({ ...base, keepSmaller: false, newBytes: 1200 })).toBe(false);
  });
});

describe("findQualityForTarget", () => {
  const sizeAt = (quality: number) => Promise.resolve({ bytes: Math.round(1_000_000 * quality), result: quality });

  it("uses full quality when the file already fits", async () => {
    const measure = vi.fn(sizeAt);
    const found = await findQualityForTarget(measure, 2_000_000);

    expect(found).toMatchObject({ quality: 1, reached: true });
    expect(measure).toHaveBeenCalledTimes(1);
  });

  it("finds the highest quality that still fits, close to the target", async () => {
    const found = await findQualityForTarget(sizeAt, 500_000);

    expect(found.reached).toBe(true);
    expect(found.bytes).toBeLessThanOrEqual(500_000);
    expect(found.bytes).toBeGreaterThan(470_000);
    expect(found.result).toBe(found.quality);
  });

  it("returns the smallest result and says so when the target cannot be reached", async () => {
    const found = await findQualityForTarget(sizeAt, 10_000);

    expect(found.reached).toBe(false);
    expect(found.quality).toBe(MIN_TARGET_QUALITY);
    expect(found.bytes).toBe(50_000);
  });
});
