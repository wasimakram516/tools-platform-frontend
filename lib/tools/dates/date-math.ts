import {
  addDays,
  addMonths,
  daysBetween,
  formatIsoDate,
  formatLongDate,
  formatShortDate,
  isSupportedDate,
  parseIsoDate,
} from "@/lib/tools/dates/calendar";
import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

export const MAX_DATE_MATH_AMOUNT = 1_000_000;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

export type DateOperation = "add" | "subtract";

export interface DateMathInput {
  startDate: string;
  operation: DateOperation;
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface DateMathSuccess {
  ok: true;
  /** The result as YYYY-MM-DD. */
  date: string;
  longDate: string;
  shortDate: string;
  daysFromStart: number;
}

export type DateMathResult = DateMathSuccess | CalculationFailure;

/**
 * Reports whether a value is a whole number inside the allowed range.
 */
function isValidAmount(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= MAX_DATE_MATH_AMOUNT;
}

/**
 * Adds or subtracts years, months, weeks, and days. Years and months are applied first with
 * month-end clamping (31 January plus one month is the last day of February), then the weeks
 * and days. The result must stay within years 1 to 9999.
 */
export function calculateDateMath(input: DateMathInput): DateMathResult {
  const start = parseIsoDate(input.startDate);

  if (!start) {
    return failure("Enter a valid start date.");
  }

  if (![input.years, input.months, input.weeks, input.days].every(isValidAmount)) {
    return failure("Amounts must be whole numbers from 0 to 1,000,000.");
  }

  const sign = input.operation === "add" ? 1 : -1;
  const outOfRange = failure("The result is outside the supported range (years 1 to 9999).");
  const shifted = addMonths(start, sign * (input.years * MONTHS_PER_YEAR + input.months));

  if (!isSupportedDate(shifted)) {
    return outOfRange;
  }

  const result = addDays(shifted, sign * (input.weeks * DAYS_PER_WEEK + input.days));

  if (!isSupportedDate(result)) {
    return outOfRange;
  }

  return {
    date: formatIsoDate(result),
    daysFromStart: daysBetween(start, result),
    longDate: formatLongDate(result),
    ok: true,
    shortDate: formatShortDate(result),
  };
}
