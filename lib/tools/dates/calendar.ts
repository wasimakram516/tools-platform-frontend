export interface CalendarDate {
  year: number;
  /** 1 to 12 */
  month: number;
  /** 1 to 31 */
  day: number;
}

export interface YmdDifference {
  years: number;
  months: number;
  days: number;
}

export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;

const MS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
/** 1 January 1970 was a Thursday. */
const EPOCH_WEEKDAY = 4;

/**
 * Reports whether a year has 366 days in the Gregorian calendar.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a month of a given year.
 */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Reports whether a date falls inside the supported range of years 1 to 9999.
 */
export function isSupportedDate(date: CalendarDate): boolean {
  return date.year >= MIN_YEAR && date.year <= MAX_YEAR;
}

/**
 * Parses a strict YYYY-MM-DD string. Returns null unless it names a real calendar date.
 */
export function parseIsoDate(value: string): CalendarDate | null {
  const match = ISO_DATE_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < MIN_YEAR || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }

  return { day, month, year };
}

/**
 * Formats a date as YYYY-MM-DD.
 */
export function formatIsoDate(date: CalendarDate): string {
  const pad = (value: number, length: number): string => String(value).padStart(length, "0");

  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/**
 * Converts a date to a whole number of days since 1970-01-01, using UTC so time zones and
 * daylight saving never shift the result. Years below 100 are handled explicitly because the
 * Date constructor would otherwise map them into the 1900s.
 */
export function toEpochDay(date: CalendarDate): number {
  const instant = new Date(0);
  instant.setUTCFullYear(date.year, date.month - 1, date.day);
  instant.setUTCHours(0, 0, 0, 0);

  return Math.round(instant.getTime() / MS_PER_DAY);
}

/**
 * Converts days since 1970-01-01 back to a calendar date.
 */
export function fromEpochDay(epochDay: number): CalendarDate {
  const instant = new Date(epochDay * MS_PER_DAY);

  return {
    day: instant.getUTCDate(),
    month: instant.getUTCMonth() + 1,
    year: instant.getUTCFullYear(),
  };
}

/**
 * Compares two dates: negative when a is earlier, zero when equal, positive when later.
 */
export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return toEpochDay(a) - toEpochDay(b);
}

/**
 * Whole days from one date to another (positive when "to" is later).
 */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return toEpochDay(to) - toEpochDay(from);
}

/**
 * Adds (or, when negative, subtracts) a number of days.
 */
export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromEpochDay(toEpochDay(date) + days);
}

/**
 * Adds (or subtracts) whole months, clamping to the last day of the target month, so
 * 31 January plus one month is the last day of February.
 */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const totalMonths = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths - year * 12 + 1;

  return { day: Math.min(date.day, daysInMonth(year, month)), month, year };
}

/**
 * Returns the English weekday name of a date.
 */
export function weekdayName(date: CalendarDate): string {
  const index = (((toEpochDay(date) + EPOCH_WEEKDAY) % 7) + 7) % 7;

  return WEEKDAYS[index] ?? "";
}

/**
 * Formats a date for people, for example "Friday, 9 October 2026".
 */
export function formatLongDate(date: CalendarDate): string {
  return `${weekdayName(date)}, ${date.day} ${MONTHS[date.month - 1] ?? ""} ${date.year}`;
}

/**
 * Splits the span between two dates (from on or before to) into whole years, months, and days.
 * Months are counted with month-end clamping, so the answer agrees with addMonths: from
 * 31 January to 1 March is 1 month and 1 day.
 */
export function differenceInYmd(from: CalendarDate, to: CalendarDate): YmdDifference {
  let totalMonths = (to.year - from.year) * 12 + (to.month - from.month);

  if (compareDates(addMonths(from, totalMonths), to) > 0) {
    totalMonths -= 1;
  }

  return {
    days: daysBetween(addMonths(from, totalMonths), to),
    months: totalMonths % 12,
    years: Math.floor(totalMonths / 12),
  };
}
