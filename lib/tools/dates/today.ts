import { formatIsoDate } from "@/lib/tools/dates/calendar";

/**
 * Returns the local calendar date as YYYY-MM-DD. A date can be passed in so tests do not
 * depend on the real clock.
 */
export function todayIsoDate(now: Date = new Date()): string {
  return formatIsoDate({
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
}
