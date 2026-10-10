/**
 * Writes a date given as YYYY-MM-DD in words, such as "9 October 2026". The date is read as a
 * calendar date, not a moment in a time zone, so it is the same everywhere.
 */
export function formatIsoDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    return isoDate;
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}
