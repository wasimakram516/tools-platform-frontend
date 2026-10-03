/**
 * Copies text to the clipboard and reports whether the browser allowed it.
 * Browsers can refuse (permissions, insecure context), so callers must handle `false`.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds the message shown when the browser blocks copying, naming what the user can copy by hand.
 */
export function copyBlockedMessage(subject: string, plural = false): string {
  return `Copy was blocked by the browser. Select the ${subject} and copy ${plural ? "them" : "it"} manually.`;
}
