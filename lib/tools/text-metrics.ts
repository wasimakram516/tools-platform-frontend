const CHARACTER_COUNT_FORMATTER = new Intl.NumberFormat("en-US");

/**
 * Formats a character count with stable thousands separators.
 */
export function formatCharacterCount(count: number): string {
  return CHARACTER_COUNT_FORMATTER.format(count);
}
