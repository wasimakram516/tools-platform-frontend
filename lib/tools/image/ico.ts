export interface IconImage {
  /** A finished PNG file. Modern browsers and operating systems read PNG inside an .ico file. */
  png: Uint8Array;
  /** The side of the square image, from 1 to 256. */
  size: number;
}

const HEADER_BYTES = 6;
const ENTRY_BYTES = 16;
const ICON_TYPE = 1;
const BITS_PER_PIXEL = 32;
const MAX_ICON_SIZE = 256;

/**
 * Builds a favicon.ico holding several sizes of the same icon. Each size is stored as a PNG,
 * which is smaller than the older bitmap form and keeps transparency intact.
 * Returns null when a size is outside 1 to 256 pixels or there are no images.
 */
export function createIco(images: readonly IconImage[]): Uint8Array | null {
  if (images.length === 0 || images.some((image) => image.size < 1 || image.size > MAX_ICON_SIZE)) {
    return null;
  }

  const dataStart = HEADER_BYTES + ENTRY_BYTES * images.length;
  const total = images.reduce((sum, image) => sum + image.png.length, dataStart);
  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  let offset = dataStart;

  view.setUint16(2, ICON_TYPE, true);
  view.setUint16(4, images.length, true);

  images.forEach((image, index) => {
    const entry = HEADER_BYTES + ENTRY_BYTES * index;

    // A side of 256 is written as 0, as the format requires.
    output[entry] = image.size === MAX_ICON_SIZE ? 0 : image.size;
    output[entry + 1] = image.size === MAX_ICON_SIZE ? 0 : image.size;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, BITS_PER_PIXEL, true);
    view.setUint32(entry + 8, image.png.length, true);
    view.setUint32(entry + 12, offset, true);
    output.set(image.png, offset);
    offset += image.png.length;
  });

  return output;
}
