/** How long the temporary address stays valid, so slow browsers can finish starting the download. */
const REVOKE_DELAY_MS = 10_000;

/**
 * Saves a file to the person's device. The file stays in memory and never touches a server.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/**
 * Saves raw bytes, such as a zip or an icon file, under a name and a type.
 */
export function downloadBytes(bytes: Uint8Array<ArrayBuffer>, fileName: string, mime: string): void {
  downloadBlob(new Blob([bytes], { type: mime }), fileName);
}
