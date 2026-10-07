import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export interface HoursWorkedSuccess {
  ok: true;
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  /** For example "7h 30m". */
  netLabel: string;
  /** Net hours as a decimal rounded to two places, for example 7.5. */
  decimalHours: number;
  crossesMidnight: boolean;
}

export type HoursWorkedResult = HoursWorkedSuccess | CalculationFailure;

/**
 * Parses HH:MM (24-hour) into minutes since midnight, or null when it is not a valid time.
 */
function parseTime(value: string): number | null {
  const match = TIME_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours <= 23 && minutes <= 59 ? hours * MINUTES_PER_HOUR + minutes : null;
}

/**
 * Formats minutes as hours and minutes, for example 450 becomes "7h 30m".
 */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * Calculates the time worked in one shift. An end time earlier than the start time means the
 * shift ran past midnight. The break is subtracted from the total.
 */
export function calculateHoursWorked(
  startTime: string,
  endTime: string,
  breakMinutes: number,
): HoursWorkedResult {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (start === null) {
    return failure("Enter a valid start time.");
  }

  if (end === null) {
    return failure("Enter a valid end time.");
  }

  if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > MINUTES_PER_DAY) {
    return failure("The break must be a whole number of minutes, from 0 to 1,440.");
  }

  if (start === end) {
    return failure("The start and end times are the same. Change one of them.");
  }

  const crossesMidnight = end < start;
  const grossMinutes = crossesMidnight ? end + MINUTES_PER_DAY - start : end - start;
  const netMinutes = grossMinutes - breakMinutes;

  if (netMinutes < 0) {
    return failure("The break is longer than the shift.");
  }

  return {
    breakMinutes,
    crossesMidnight,
    decimalHours: Math.round((netMinutes / MINUTES_PER_HOUR) * 100) / 100,
    grossMinutes,
    netLabel: formatDuration(netMinutes),
    netMinutes,
    ok: true,
  };
}
