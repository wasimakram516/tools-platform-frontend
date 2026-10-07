import type { ResizeSpec, Size } from "@/lib/tools/image/dimensions";
import { formatForMime, type ImageFormatId } from "@/lib/tools/image/format";

export type FormatSetting = "keep" | ImageFormatId;

export interface ResolvedFormat {
  format: ImageFormatId;
  /** True when the file's own type cannot be written, so PNG was chosen for it. */
  usedFallback: boolean;
}

/**
 * Chooses the output format for a file. "Keep" uses the file's own type, or PNG for types the
 * browser cannot write (GIF, BMP, AVIF, SVG), which is lossless and keeps transparency.
 */
export function resolveFormat(fileType: string, setting: FormatSetting): ResolvedFormat {
  if (setting !== "keep") {
    return { format: setting, usedFallback: false };
  }

  const own = formatForMime(fileType);

  return own ? { format: own.id, usedFallback: false } : { format: "png", usedFallback: true };
}

/**
 * Builds the resize request for an optional maximum width. An image already narrower than the
 * limit is left alone, because enlarging it only makes the file bigger.
 */
export function resizeForMaxWidth(source: Size, maxWidth: number | null): ResizeSpec {
  if (maxWidth === null || maxWidth >= source.width) {
    return { mode: "keep" };
  }

  return { anchor: "center", fit: "contain", height: null, mode: "pixels", width: maxWidth };
}

interface KeepOriginalInput {
  keepSmaller: boolean;
  newBytes: number;
  originalBytes: number;
  /** True when the output is the same file type as the original. */
  sameFormat: boolean;
}

/**
 * Decides whether to hand back the original file because re-saving made it no smaller. This
 * only applies when the format is unchanged; changing format is a choice the person made.
 */
export function shouldKeepOriginal({ keepSmaller, newBytes, originalBytes, sameFormat }: KeepOriginalInput): boolean {
  return keepSmaller && sameFormat && newBytes >= originalBytes;
}
