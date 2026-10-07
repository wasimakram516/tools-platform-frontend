// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createIco } from "@/lib/tools/image/ico";

const PNG_16 = new Uint8Array(Array.from({ length: 94 }, (_, index) => index));
const PNG_32 = new Uint8Array(Array.from({ length: 109 }, (_, index) => 255 - index));

describe("createIco", () => {
  it("writes the header, one directory entry per size, and the images after them", () => {
    // The layout was also checked by opening a file built this way in Pillow, which read
    // both sizes and their pixels.
    const ico = createIco([
      { png: PNG_16, size: 16 },
      { png: PNG_32, size: 32 },
    ]) ?? new Uint8Array();
    const view = new DataView(ico.buffer);

    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(2);

    expect([ico[6], ico[7]]).toEqual([16, 16]);
    expect(view.getUint16(10, true)).toBe(1);
    expect(view.getUint16(12, true)).toBe(32);
    expect(view.getUint32(14, true)).toBe(94);
    expect(view.getUint32(18, true)).toBe(38);

    expect([ico[22], ico[23]]).toEqual([32, 32]);
    expect(view.getUint32(30, true)).toBe(109);
    expect(view.getUint32(34, true)).toBe(38 + 94);

    expect(Array.from(ico.slice(38, 38 + 94))).toEqual(Array.from(PNG_16));
    expect(Array.from(ico.slice(38 + 94))).toEqual(Array.from(PNG_32));
    expect(ico.length).toBe(38 + 94 + 109);
  });

  it("writes a side of 256 as 0, as the format requires", () => {
    const ico = createIco([{ png: PNG_16, size: 256 }]) ?? new Uint8Array();

    expect([ico[6], ico[7]]).toEqual([0, 0]);
  });

  it("refuses sizes outside 1 to 256, and an empty list", () => {
    expect(createIco([])).toBeNull();
    expect(createIco([{ png: PNG_16, size: 0 }])).toBeNull();
    expect(createIco([{ png: PNG_16, size: 257 }])).toBeNull();
  });
});
