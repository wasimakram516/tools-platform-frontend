import { pngLayout, type QrCode } from "@/lib/tools/generators/qr";

export interface PngOptions {
  background: string;
  foreground: string;
  quietZone: number;
  /** The size asked for. The real size is the nearest whole multiple of the module count below it. */
  requestedPixels: number;
}

/**
 * Draws a QR code on a canvas, one crisp square at a time, and saves it as a PNG. Returns null
 * when the browser cannot make the picture.
 */
export function renderQrPng(code: QrCode, options: PngOptions): Promise<Blob | null> {
  const { pixels, scale } = pngLayout(code, options.quietZone, options.requestedPixels);
  const canvas = document.createElement("canvas");

  canvas.width = pixels;
  canvas.height = pixels;

  const context = canvas.getContext("2d");

  if (!context) {
    return Promise.resolve(null);
  }

  context.fillStyle = options.background;
  context.fillRect(0, 0, pixels, pixels);
  context.fillStyle = options.foreground;

  code.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        context.fillRect((x + options.quietZone) * scale, (y + options.quietZone) * scale, scale, scale);
      }
    });
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        canvas.width = 0;
        canvas.height = 0;
        resolve(blob);
      },
      "image/png",
    );
  });
}
