import {
  addDays,
  compareDates,
  daysBetween,
  differenceInYmd,
  isSupportedDate,
  parseIsoDate,
} from "@/lib/tools/dates/calendar";
import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const DAYS_PER_WEEK = 7;

export type DifferenceDirection = "later" | "earlier" | "same";

export interface DateDifferenceSuccess {
  ok: true;
  /** Whether the second date is later than, earlier than, or the same as the first. */
  direction: DifferenceDirection;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  weeks: number;
  remainingDays: number;
  includesEndDate: boolean;
}

export type DateDifferenceResult = DateDifferenceSuccess | CalculationFailure;

/**
 * Calculates the gap between two dates as years, months, and days, and as a total number of
 * days. The order does not matter: the result reports which date comes first. With
 * "includeEndDate" the last day is counted too, so the same date twice is one day.
 */
export function calculateDateDifference(
  fromDate: string,
  toDate: string,
  includeEndDate = false,
): DateDifferenceResult {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);

  if (!from) {
    return failure("Enter a valid start date.");
  }

  if (!to) {
    return failure("Enter a valid end date.");
  }

  const order = compareDates(to, from);
  const direction: DifferenceDirection = order > 0 ? "later" : order < 0 ? "earlier" : "same";
  const start = order >= 0 ? from : to;
  const rawEnd = order >= 0 ? to : from;
  const end = includeEndDate ? addDays(rawEnd, 1) : rawEnd;

  if (!isSupportedDate(end)) {
    return failure("The end date is outside the supported range (years 1 to 9999).");
  }

  const { years, months, days } = differenceInYmd(start, end);
  const totalDays = daysBetween(start, end);

  return {
    days,
    direction,
    includesEndDate: includeEndDate,
    months,
    ok: true,
    remainingDays: totalDays % DAYS_PER_WEEK,
    totalDays,
    weeks: Math.floor(totalDays / DAYS_PER_WEEK),
    years,
  };
}
