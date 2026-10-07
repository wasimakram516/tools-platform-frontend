import type { YmdDifference } from "@/lib/tools/dates/calendar";

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

/**
 * Formats a number with thousands separators, for example 13294 becomes "13,294".
 */
export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/**
 * Formats a count with its unit, for example "1 day" or "2 days".
 */
export function formatCount(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}${Math.abs(value) === 1 ? "" : "s"}`;
}

/**
 * Formats years, months, and days for people. Parts that are zero are left out, and a span of
 * nothing reads "0 days".
 */
export function formatYmd({ years, months, days }: YmdDifference): string {
  const parts = [
    years > 0 ? formatCount(years, "year") : "",
    months > 0 ? formatCount(months, "month") : "",
    days > 0 ? formatCount(days, "day") : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "0 days";
}
