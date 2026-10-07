export interface ZipEntry {
  data: Uint8Array;
  name: string;
}

/** A zip without the 64-bit extension holds at most 4 GiB; stay well under it. */
export const MAX_ZIP_BYTES = 2 * 1024 ** 3;

const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const END_RECORD_SIGNATURE = 0x06054b50;
/** Version 2.0 is the oldest that supports everything used here. */
const ZIP_VERSION = 20;
/** Bit 11: file names are UTF-8. */
const UTF8_FLAG = 0x0800;
const STORED = 0;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

/**
 * Computes the CRC-32 checksum a zip file stores for each entry.
 */
export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Packs a date into the two 16-bit fields a zip entry uses. Zip stores local time, to the
 * nearest two seconds, from 1980.
 */
function toDosDateTime(date: Date): { date: number; time: number } {
  const year = Math.max(date.getFullYear(), 1980);

  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

/**
 * Builds a zip file holding the entries as they are, with no compression. Images are already
 * compressed, so storing them keeps the code small and the result opens everywhere.
 * Returns null when the files together are too large for a plain zip.
 */
export function createZip(entries: readonly ZipEntry[], modified: Date = new Date()): Uint8Array | null {
  const encoder = new TextEncoder();
  const stamp = toDosDateTime(modified);
  const names = entries.map((entry) => encoder.encode(entry.name));
  const total = entries.reduce((sum, entry, index) => sum + entry.data.length + 2 * (names[index]?.length ?? 0), 0);

  if (total > MAX_ZIP_BYTES) {
    return null;
  }

  const localSize = entries.reduce((sum, entry, index) => sum + 30 + (names[index]?.length ?? 0) + entry.data.length, 0);
  const centralSize = names.reduce((sum, name) => sum + 46 + name.length, 0);
  const output = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(output.buffer);
  const offsets: number[] = [];
  let position = 0;

  entries.forEach((entry, index) => {
    const name = names[index] ?? new Uint8Array();

    offsets.push(position);
    view.setUint32(position, LOCAL_HEADER_SIGNATURE, true);
    view.setUint16(position + 4, ZIP_VERSION, true);
    view.setUint16(position + 6, UTF8_FLAG, true);
    view.setUint16(position + 8, STORED, true);
    view.setUint16(position + 10, stamp.time, true);
    view.setUint16(position + 12, stamp.date, true);
    view.setUint32(position + 14, crc32(entry.data), true);
    view.setUint32(position + 18, entry.data.length, true);
    view.setUint32(position + 22, entry.data.length, true);
    view.setUint16(position + 26, name.length, true);
    view.setUint16(position + 28, 0, true);
    output.set(name, position + 30);
    output.set(entry.data, position + 30 + name.length);
    position += 30 + name.length + entry.data.length;
  });

  const centralStart = position;

  entries.forEach((entry, index) => {
    const name = names[index] ?? new Uint8Array();

    view.setUint32(position, CENTRAL_HEADER_SIGNATURE, true);
    view.setUint16(position + 4, ZIP_VERSION, true);
    view.setUint16(position + 6, ZIP_VERSION, true);
    view.setUint16(position + 8, UTF8_FLAG, true);
    view.setUint16(position + 10, STORED, true);
    view.setUint16(position + 12, stamp.time, true);
    view.setUint16(position + 14, stamp.date, true);
    view.setUint32(position + 16, crc32(entry.data), true);
    view.setUint32(position + 20, entry.data.length, true);
    view.setUint32(position + 24, entry.data.length, true);
    view.setUint16(position + 28, name.length, true);
    view.setUint32(position + 42, offsets[index] ?? 0, true);
    output.set(name, position + 46);
    position += 46 + name.length;
  });

  view.setUint32(position, END_RECORD_SIGNATURE, true);
  view.setUint16(position + 8, entries.length, true);
  view.setUint16(position + 10, entries.length, true);
  view.setUint32(position + 12, centralSize, true);
  view.setUint32(position + 16, centralStart, true);

  return output;
}
