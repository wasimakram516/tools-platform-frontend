import qrcode from "qrcode-generator";
import { type CalculationFailure, failure } from "@/lib/tools/dates/result";

// Scanners expect UTF-8 text, so accented and non-Latin characters survive. The library's own
// default writes one byte per character.
qrcode.stringToBytes = (text: string): number[] => Array.from(new TextEncoder().encode(text));

export type ErrorCorrection = "L" | "M" | "Q" | "H";

export const ERROR_CORRECTION_LEVELS: readonly { description: string; label: string; value: ErrorCorrection }[] = [
  { description: "Recovers about 7% of damage. Smallest code.", label: "L", value: "L" },
  { description: "Recovers about 15% of damage. A good everyday choice.", label: "M", value: "M" },
  { description: "Recovers about 25% of damage.", label: "Q", value: "Q" },
  { description: "Recovers about 30% of damage. Biggest code.", label: "H", value: "H" },
];

/** A code needs this many blank modules around it so scanners can find its edges. */
export const RECOMMENDED_QUIET_ZONE = 4;
export const MAX_QUIET_ZONE = 10;
export const MAX_PAYLOAD_CHARACTERS = 2000;
/** A scanner needs strong contrast. Below this ratio the code may not scan. */
export const MIN_CONTRAST_RATIO = 3;

export interface QrCode {
  /** Rows of modules, true where the module is dark. */
  modules: boolean[][];
  /** Modules along one side, not counting the quiet zone. */
  size: number;
  /** The QR version, 1 to 40. A bigger version holds more. */
  version: number;
}

export type QrResult = { code: QrCode; ok: true } | CalculationFailure;

/**
 * Builds the pattern of dark and light modules for some text. Returns a message when the text is
 * empty or too long for one QR code at that error correction level.
 */
export function createQrCode(text: string, level: ErrorCorrection): QrResult {
  if (text === "") {
    return failure("Enter something to put in the code.");
  }

  if (text.length > MAX_PAYLOAD_CHARACTERS) {
    return failure(`That is longer than ${MAX_PAYLOAD_CHARACTERS.toLocaleString("en-US")} characters, which is more than a QR code is meant to hold.`);
  }

  try {
    const code = qrcode(0, level);

    code.addData(text);
    code.make();

    const size = code.getModuleCount();

    return {
      code: {
        modules: Array.from({ length: size }, (_row, row) =>
          Array.from({ length: size }, (_column, column) => code.isDark(row, column)),
        ),
        size,
        version: (size - 17) / 4,
      },
      ok: true,
    };
  } catch {
    return failure("That is too long for a QR code at this error correction level. Shorten it, or choose a lower level.");
  }
}

export interface SvgOptions {
  background: string;
  foreground: string;
  /** Blank modules around the code. */
  quietZone: number;
}

/**
 * Writes a QR code as a compact SVG: one path of squares on a background, drawn with crisp
 * edges so it stays sharp at any size.
 */
export function qrToSvg(code: QrCode, { background, foreground, quietZone }: SvgOptions): string {
  const total = code.size + 2 * quietZone;
  const squares: string[] = [];

  code.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        squares.push(`M${x + quietZone} ${y + quietZone}h1v1h-1z`);
      }
    });
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code">`,
    `<rect width="${total}" height="${total}" fill="${background}"/>`,
    `<path d="${squares.join("")}" fill="${foreground}"/>`,
    "</svg>",
  ].join("");
}

/**
 * Turns a hex colour such as #1b7f4b into red, green, and blue from 0 to 255, or null.
 */
function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(color.trim());

  if (!match) {
    return null;
  }

  const value = parseInt(match[1] ?? "", 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * How bright a colour looks to the eye, from 0 (black) to 1 (white), following the WCAG formula.
 */
function luminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The contrast between two hex colours, from 1 (identical) to 21 (black on white), or null when a
 * colour is not a six-digit hex value.
 */
export function contrastRatio(first: string, second: string): number | null {
  const a = parseHex(first);
  const b = parseHex(second);

  if (!a || !b) {
    return null;
  }

  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];

  return (light + 0.05) / (dark + 0.05);
}

export interface ColorAdvice {
  /** Why the colours may cause trouble, or null when they are fine. */
  warning: string | null;
}

/**
 * Checks whether a foreground and background are likely to scan: enough contrast, and a dark
 * code on a light background, because some scanners cannot read inverted codes.
 */
export function adviseOnColors(foreground: string, background: string): ColorAdvice {
  const ratio = contrastRatio(foreground, background);
  const fg = parseHex(foreground);
  const bg = parseHex(background);

  if (ratio === null || !fg || !bg) {
    return { warning: "Use colours written like #1b7f4b." };
  }

  if (ratio < MIN_CONTRAST_RATIO) {
    return { warning: "These colours are too close together. The code may not scan. Make the code darker or the background lighter." };
  }

  if (luminance(fg) > luminance(bg)) {
    return { warning: "The code is lighter than its background. Some scanners cannot read that. A dark code on a light background is safest." };
  }

  return { warning: null };
}

export interface PngLayout {
  /** The width and height of the finished picture, in pixels. */
  pixels: number;
  /** Pixels along one side of each module. */
  scale: number;
  /** Modules along one side including the quiet zone. */
  totalModules: number;
}

/**
 * Works out the picture size for a requested size. Every module must be a whole number of
 * pixels or its edges blur, so the picture is the largest whole multiple at or under the request
 * (and never smaller than one pixel a module).
 */
export function pngLayout(code: QrCode, quietZone: number, requestedPixels: number): PngLayout {
  const totalModules = code.size + 2 * quietZone;
  const scale = Math.max(1, Math.floor(requestedPixels / totalModules));

  return { pixels: scale * totalModules, scale, totalModules };
}
