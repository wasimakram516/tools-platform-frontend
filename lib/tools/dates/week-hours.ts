import { toCsv } from "@/lib/tools/calculators/csv";
import { formatDuration, type HoursWorkedSuccess } from "@/lib/tools/dates/hours-worked";

/** A week of shifts, or a month of them, is the most anyone should need to total at once. */
export const MAX_SHIFTS = 31;

const MINUTES_PER_HOUR = 60;

export interface WeekShift {
  breakMinutes: number;
  endTime: string;
  netMinutes: number;
  startTime: string;
}

export interface WeekTotal {
  decimalHours: number;
  /** For example "40h 00m". */
  label: string;
  minutes: number;
  shifts: number;
}

/**
 * Turns a calculated shift and the times it came from into a row of the week.
 */
export function toWeekShift(startTime: string, endTime: string, result: HoursWorkedSuccess): WeekShift {
  return { breakMinutes: result.breakMinutes, endTime, netMinutes: result.netMinutes, startTime };
}

/**
 * Adds up the time worked across shifts.
 */
export function totalWeek(shifts: readonly WeekShift[]): WeekTotal {
  const minutes = shifts.reduce((sum, shift) => sum + shift.netMinutes, 0);

  return {
    decimalHours: Math.round((minutes / MINUTES_PER_HOUR) * 100) / 100,
    label: formatDuration(minutes),
    minutes,
    shifts: shifts.length,
  };
}

/**
 * Writes the shifts and the total as plain lines, for pasting into a message or a note.
 */
export function weekToText(shifts: readonly WeekShift[]): string {
  const total = totalWeek(shifts);
  const lines = shifts.map(
    (shift, index) =>
      `Shift ${index + 1}: ${shift.startTime} to ${shift.endTime}, break ${shift.breakMinutes} min, ${formatDuration(shift.netMinutes)}`,
  );

  return [...lines, `Total: ${total.label} (${total.decimalHours.toFixed(2)} hours)`].join("\n");
}

/**
 * Writes the shifts and the total as CSV, for a spreadsheet or a timesheet.
 */
export function weekToCsv(shifts: readonly WeekShift[]): string {
  const total = totalWeek(shifts);
  const rows = shifts.map((shift, index) => [
    String(index + 1),
    shift.startTime,
    shift.endTime,
    String(shift.breakMinutes),
    formatDuration(shift.netMinutes),
    (shift.netMinutes / MINUTES_PER_HOUR).toFixed(2),
  ]);

  return toCsv(
    ["Shift", "Start", "End", "Break (min)", "Hours worked", "Decimal hours"],
    [...rows, ["Total", "", "", "", total.label, total.decimalHours.toFixed(2)]],
  );
}
