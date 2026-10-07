// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  adviseOnColors,
  contrastRatio,
  createQrCode,
  MAX_PAYLOAD_CHARACTERS,
  pngLayout,
  qrToSvg,
  type QrCode,
} from "@/lib/tools/generators/qr";

/**
 * Returns the code of a successful result, or fails the test.
 */
function codeOf(result: ReturnType<typeof createQrCode>): QrCode {
  if (!result.ok) {
    throw new Error(`Expected success but got: ${result.message}`);
  }

  return result.code;
}

describe("createQrCode", () => {
  it("makes a square code whose size follows its version", () => {
    // Version 1 is 21 modules a side, and each version adds 4. "hello" fits in version 1 at level L.
    const code = codeOf(createQrCode("hello", "L"));

    expect(code.version).toBe(1);
    expect(code.size).toBe(21);
    expect(code.modules).toHaveLength(21);
    expect(code.modules.every((row) => row.length === 21)).toBe(true);
  });

  it("has the three finder squares every QR code has in its corners", () => {
    const { modules, size } = codeOf(createQrCode("hello", "M"));

    for (const [row, column] of [[0, 0], [0, size - 7], [size - 7, 0]] as const) {
      // The outer ring of a finder square is solid, and its centre is solid.
      expect(modules[row]?.slice(column, column + 7).every(Boolean)).toBe(true);
      expect(modules[row + 3]?.[column + 3]).toBe(true);
      expect(modules[row + 1]?.[column + 1]).toBe(false);
    }
  });

  it("grows with the text and with the error correction level", () => {
    const small = codeOf(createQrCode("hello", "L"));
    const long = codeOf(createQrCode("x".repeat(300), "L"));
    const strong = codeOf(createQrCode("x".repeat(100), "H"));
    const weak = codeOf(createQrCode("x".repeat(100), "L"));

    expect(long.version).toBeGreaterThan(small.version);
    expect(strong.version).toBeGreaterThan(weak.version);
  });

  it("explains empty, over-long, and too-large-for-the-level text", () => {
    expect(createQrCode("", "M")).toEqual({ message: "Enter something to put in the code.", ok: false });
    expect(createQrCode("x".repeat(MAX_PAYLOAD_CHARACTERS + 1), "L")).toMatchObject({ ok: false });
    // 2,000 bytes fit at level L (the limit is 2,953) but not at level H (the limit is 1,273).
    expect(createQrCode("x".repeat(2000), "L")).toMatchObject({ ok: true });
    expect(createQrCode("x".repeat(2000), "H")).toMatchObject({
      message: expect.stringContaining("too long"),
      ok: false,
    });
  });

  it("counts accented and non-Latin text by its UTF-8 bytes", () => {
    // Each of these letters takes two bytes, so 20 of them need more room than 20 plain letters.
    expect(codeOf(createQrCode("é".repeat(20), "L")).version).toBeGreaterThan(codeOf(createQrCode("e".repeat(20), "L")).version);
  });
});

describe("qrToSvg", () => {
  /**
   * Reads the dark squares back out of an SVG's path, so the test checks what is drawn.
   */
  function readModules(svg: string, size: number, quietZone: number): boolean[][] {
    const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    const path = /<path d="([^"]*)"/.exec(svg)?.[1] ?? "";

    for (const match of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      grid[Number(match[2]) - quietZone]![Number(match[1]) - quietZone] = true;
    }

    return grid;
  }

  it("draws exactly the dark modules, with the quiet zone and colours", () => {
    const code = codeOf(createQrCode("https://example.com", "M"));
    const svg = qrToSvg(code, { background: "#ffffff", foreground: "#1b7f4b", quietZone: 4 });
    const total = code.size + 8;

    expect(readModules(svg, code.size, 4)).toEqual(code.modules);
    expect(svg).toContain(`viewBox="0 0 ${total} ${total}"`);
    expect(svg).toContain('<rect width="' + total + '" height="' + total + '" fill="#ffffff"/>');
    expect(svg).toContain('fill="#1b7f4b"');
    expect(svg).toContain("crispEdges");
  });

  it("changes the size of the quiet zone", () => {
    const code = codeOf(createQrCode("hi", "L"));

    expect(qrToSvg(code, { background: "#fff", foreground: "#000", quietZone: 0 })).toContain(`viewBox="0 0 ${code.size} ${code.size}"`);
  });
});

describe("contrastRatio and adviseOnColors", () => {
  it("matches the WCAG contrast ratio", () => {
    // Values were computed independently with Python from the WCAG formula.
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 3);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 3);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.4781, 3);
    expect(contrastRatio("#1b7f4b", "#ffffff")).toBeCloseTo(5.0192, 3);
    expect(contrastRatio("#cccccc", "#ffffff")).toBeCloseTo(1.6059, 3);
    expect(contrastRatio("green", "#ffffff")).toBeNull();
  });

  it("warns about low contrast, inverted codes, and bad colours, and stays quiet otherwise", () => {
    expect(adviseOnColors("#000000", "#ffffff").warning).toBeNull();
    expect(adviseOnColors("#1b7f4b", "#ffffff").warning).toBeNull();
    expect(adviseOnColors("#cccccc", "#ffffff").warning).toContain("too close");
    expect(adviseOnColors("#ffffff", "#000000").warning).toContain("lighter than its background");
    expect(adviseOnColors("blue", "#ffffff").warning).toContain("#1b7f4b");
  });
});

describe("pngLayout", () => {
  it("uses whole pixels a module, never going over the requested size", () => {
    const code = codeOf(createQrCode("hello", "L"));

    // 21 modules plus a quiet zone of 4 on each side is 29 modules. 512 / 29 is 17.6, so each
    // module is 17 pixels and the picture is 29 * 17 = 493.
    expect(pngLayout(code, 4, 512)).toEqual({ pixels: 493, scale: 17, totalModules: 29 });
    expect(pngLayout(code, 4, 29)).toEqual({ pixels: 29, scale: 1, totalModules: 29 });
    expect(pngLayout(code, 4, 5)).toEqual({ pixels: 29, scale: 1, totalModules: 29 });
    expect(pngLayout(code, 0, 210)).toEqual({ pixels: 210, scale: 10, totalModules: 21 });
  });
});
