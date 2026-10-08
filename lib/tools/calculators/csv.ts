/**
 * Quotes a CSV cell when it holds a comma, a quote, or a line break, so it opens correctly in
 * a spreadsheet.
 */
function cell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/**
 * Builds CSV text from a header row and data rows. Lines end with CRLF, which spreadsheets
 * expect.
 */
export function toCsv(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
