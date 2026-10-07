// @vitest-environment node
import { describe, expect, it } from "vitest";
import { crc32, createZip } from "@/lib/tools/image/zip";

const MODIFIED = new Date(2026, 9, 7, 23, 30, 10);

/**
 * Reads the stored entries back out of a zip, following the central directory the way an
 * unzip program does, so the test checks the file's structure and not only its length.
 */
function readZip(zip: Uint8Array): { crc: number; data: Uint8Array; name: string }[] {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const endAt = zip.length - 22;
  const count = view.getUint16(endAt + 10, true);
  let position = view.getUint32(endAt + 16, true);
  const entries: { crc: number; data: Uint8Array; name: string }[] = [];

  expect(view.getUint32(endAt, true)).toBe(0x06054b50);

  for (let index = 0; index < count; index += 1) {
    expect(view.getUint32(position, true)).toBe(0x02014b50);

    const crc = view.getUint32(position + 16, true);
    const size = view.getUint32(position + 24, true);
    const nameLength = view.getUint16(position + 28, true);
    const localAt = view.getUint32(position + 42, true);
    const name = new TextDecoder().decode(zip.slice(position + 46, position + 46 + nameLength));
    const localNameLength = view.getUint16(localAt + 26, true);
    const dataAt = localAt + 30 + localNameLength;

    expect(view.getUint32(localAt, true)).toBe(0x04034b50);
    entries.push({ crc, data: zip.slice(dataAt, dataAt + size), name });
    position += 46 + nameLength;
  }

  return entries;
}

describe("crc32", () => {
  it("matches the standard check values", () => {
    // Values come from Python's zlib.crc32, and 0xCBF43926 is the published check value.
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
    expect(crc32(new TextEncoder().encode("hello"))).toBe(0x3610a686);
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
});

describe("createZip", () => {
  it("stores every file so it reads back byte for byte, with names and checksums intact", () => {
    const first = new TextEncoder().encode("hello");
    const second = Uint8Array.from({ length: 300 }, (_, index) => index % 256);
    const zip = createZip(
      [
        { data: first, name: "a.txt" },
        { data: second, name: "icons/café-16.png" },
        { data: new Uint8Array(0), name: "empty.bin" },
      ],
      MODIFIED,
    );
    const entries = readZip(zip ?? new Uint8Array());

    expect(entries.map((entry) => entry.name)).toEqual(["a.txt", "icons/café-16.png", "empty.bin"]);
    expect(Array.from(entries[0]?.data ?? [])).toEqual(Array.from(first));
    expect(Array.from(entries[1]?.data ?? [])).toEqual(Array.from(second));
    expect(entries[2]?.data.length).toBe(0);
    expect(entries.map((entry) => entry.crc)).toEqual([0x3610a686, crc32(second), 0]);
  });

  it("stamps the modified time in the zip's two-second local format", () => {
    const zip = createZip([{ data: new Uint8Array([1]), name: "a" }], MODIFIED) ?? new Uint8Array();
    const view = new DataView(zip.buffer);

    // 23:30:10 is (23 << 11) | (30 << 5) | 5, and 7 Oct 2026 is (46 << 9) | (10 << 5) | 7.
    expect(view.getUint16(10, true)).toBe((23 << 11) | (30 << 5) | 5);
    expect(view.getUint16(12, true)).toBe((46 << 9) | (10 << 5) | 7);
  });

  it("makes a valid empty zip", () => {
    const zip = createZip([], MODIFIED) ?? new Uint8Array();

    expect(zip.length).toBe(22);
    expect(readZip(zip)).toEqual([]);
  });
});
