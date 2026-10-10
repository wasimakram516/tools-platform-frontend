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

/** The lowest quality tried when fitting a file under a size. Below this, images look broken. */
export const MIN_TARGET_QUALITY = 0.05;
/** How many halving steps to take between the lowest and highest quality. */
const TARGET_SEARCH_STEPS = 6;

export interface TargetSample<T> {
  bytes: number;
  /** Whatever was made at this quality, handed back for the one that is chosen. */
  result: T;
}

export interface TargetSearchResult<T> extends TargetSample<T> {
  /** The quality used, from 0 to 1. */
  quality: number;
  /** False when even the lowest quality is still over the target. */
  reached: boolean;
}

/**
 * Finds the highest quality whose file still fits under a target size. It tries full quality
 * first, then the lowest, then halves the gap between them. File size falls as quality falls, so
 * this finds the best fit in about eight tries. When the lowest quality is still too big, that
 * smallest result is returned with reached set to false.
 */
export async function findQualityForTarget<T>(
  measure: (quality: number) => Promise<TargetSample<T>>,
  targetBytes: number,
): Promise<TargetSearchResult<T>> {
  const full = await measure(1);

  if (full.bytes <= targetBytes) {
    return { ...full, quality: 1, reached: true };
  }

  const lowest = await measure(MIN_TARGET_QUALITY);

  if (lowest.bytes > targetBytes) {
    return { ...lowest, quality: MIN_TARGET_QUALITY, reached: false };
  }

  let fits = { ...lowest, quality: MIN_TARGET_QUALITY };
  let tooBig = 1;

  for (let step = 0; step < TARGET_SEARCH_STEPS; step += 1) {
    const quality = (fits.quality + tooBig) / 2;
    const sample = await measure(quality);

    if (sample.bytes <= targetBytes) {
      fits = { ...sample, quality };
    } else {
      tooBig = quality;
    }
  }

  return { ...fits, reached: true };
}
