export const IMAGE_FORMATS = [
  { extension: "jpg", id: "jpeg", label: "JPEG", lossy: true, mime: "image/jpeg" },
  { extension: "png", id: "png", label: "PNG", lossy: false, mime: "image/png" },
  { extension: "webp", id: "webp", label: "WebP", lossy: true, mime: "image/webp" },
] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number];
export type ImageFormatId = ImageFormat["id"];

/** The file types the tools can read. SVG is read as a drawing and turned into pixels. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/avif",
  "image/svg+xml",
] as const;

/** The most images the compressor takes at once. */
export const MAX_BATCH_FILES = 50;
/** Bigger files are refused up front, because decoding them can exhaust a device's memory. */
export const MAX_IMAGE_FILE_BYTES = 50 * 1024 * 1024;
/** Largest source image, in pixels. Larger images can crash a browser tab. */
export const MAX_SOURCE_PIXELS = 100_000_000;

const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * Finds a format by its id.
 */
export function formatById(id: ImageFormatId): ImageFormat {
  return IMAGE_FORMATS.find((format) => format.id === id) ?? IMAGE_FORMATS[1];
}

/**
 * Finds the output format that matches a file's type, or null for types the tools cannot write
 * (such as GIF or BMP).
 */
export function formatForMime(mime: string): ImageFormat | null {
  return IMAGE_FORMATS.find((format) => format.mime === mime) ?? null;
}

/**
 * Names the result of converting a file: the same name with the new extension and an optional
 * suffix, for example "photo.PNG" becomes "photo-small.webp".
 */
export function outputFileName(originalName: string, extension: string, suffix = ""): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim() || "image";

  return `${base}${suffix}.${extension}`;
}

/**
 * Makes names unique by adding (2), (3), and so on, so a zip never holds two files with the
 * same name.
 */
export function uniqueFileNames(names: readonly string[]): string[] {
  const used = new Set<string>();

  return names.map((name) => {
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const extension = dot > 0 ? name.slice(dot) : "";
    let candidate = name;
    let counter = 2;

    while (used.has(candidate.toLowerCase())) {
      candidate = `${base} (${counter})${extension}`;
      counter += 1;
    }

    used.add(candidate.toLowerCase());

    return candidate;
  });
}

/**
 * Writes a size in bytes for people, for example "512 B", "1.5 KB", or "12 MB".
 */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;

  return `${rounded} ${BYTE_UNITS[unit]}`;
}

/**
 * How much smaller the new file is, as a whole percentage. Negative when it is bigger.
 */
export function percentSaved(originalBytes: number, newBytes: number): number {
  return originalBytes === 0 ? 0 : Math.round(((originalBytes - newBytes) / originalBytes) * 100);
}
