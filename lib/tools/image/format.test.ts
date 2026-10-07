// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  formatById,
  formatBytes,
  formatForMime,
  outputFileName,
  percentSaved,
  uniqueFileNames,
} from "@/lib/tools/image/format";

describe("formatForMime and formatById", () => {
  it("finds the output format for a file type, or null for ones that cannot be written", () => {
    expect(formatForMime("image/jpeg")?.id).toBe("jpeg");
    expect(formatForMime("image/png")?.extension).toBe("png");
    expect(formatForMime("image/gif")).toBeNull();
    expect(formatById("webp").mime).toBe("image/webp");
  });
});

describe("outputFileName", () => {
  it("swaps the extension and adds an optional suffix", () => {
    expect(outputFileName("photo.PNG", "webp")).toBe("photo.webp");
    expect(outputFileName("photo.final.jpeg", "jpg", "-small")).toBe("photo.final-small.jpg");
    expect(outputFileName("no-extension", "png")).toBe("no-extension.png");
    expect(outputFileName(".hidden", "png")).toBe(".hidden.png");
    expect(outputFileName("   ", "png")).toBe("image.png");
  });
});

describe("uniqueFileNames", () => {
  it("numbers repeated names without touching the rest", () => {
    expect(uniqueFileNames(["a.png", "b.png", "a.png", "A.png", "a.png"])).toEqual([
      "a.png",
      "b.png",
      "a (2).png",
      "A (3).png",
      "a (4).png",
    ]);
  });
});

describe("formatBytes", () => {
  it("writes sizes for people", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(12 * 1024)).toBe("12 KB");
    expect(formatBytes(1.2 * 1024 * 1024)).toBe("1.2 MB");
    expect(formatBytes(3 * 1024 ** 3)).toBe("3 GB");
  });
});

describe("percentSaved", () => {
  it("is positive when smaller and negative when bigger", () => {
    expect(percentSaved(1000, 250)).toBe(75);
    expect(percentSaved(1000, 1000)).toBe(0);
    expect(percentSaved(1000, 1200)).toBe(-20);
    expect(percentSaved(0, 10)).toBe(0);
  });
});
