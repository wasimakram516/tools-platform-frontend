import {
  type CalendarDate,
  compareDates,
  formatIsoDate,
  formatLongDate,
  formatShortDate,
  fromEpochDay,
  parseIsoDate,
  toEpochDay,
} from "@/lib/tools/dates/calendar";
import { formatNumber } from "@/lib/tools/dates/format";
import { type CalculationFailure, failure } from "@/lib/tools/dates/result";

export type ExcelDateSystem = "1900" | "1904";

const MINUTES_PER_DAY = 1440;
const SECONDS_PER_DAY = 86_400;
const MAX_FRACTION_DIGITS = 10;
const SERIAL_PATTERN = /^\d{1,7}(?:\.\d+)?$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

const DAY_ZERO_1900 = toEpochDay({ year: 1899, month: 12, day: 30 });
const DAY_ZERO_1904 = toEpochDay({ year: 1904, month: 1, day: 1 });
const FIRST_DATE_1900: CalendarDate = { year: 1900, month: 1, day: 1 };
const FIRST_DATE_1904: CalendarDate = { year: 1904, month: 1, day: 1 };
const LAST_DATE: CalendarDate = { year: 9999, month: 12, day: 31 };
/** Excel's 1900 system counts a 29 February 1900 that never existed, as serial 60. */
const PHANTOM_LEAP_SERIAL = 60;
const FIRST_REAL_MARCH_1900: CalendarDate = { year: 1900, month: 3, day: 1 };

export interface ExcelSerialSuccess {
  ok: true;
  /** The serial number as Excel stores it, with the time as a fraction of a day. */
  serial: string;
  wholeDays: number;
  /** Set only when a time was given. */
  timeFraction?: string;
}

export interface ExcelDateSuccess {
  ok: true;
  /** YYYY-MM-DD, or null when the serial is Excel's imaginary 29 February 1900. */
  isoDate: string | null;
  /** For example 07 Oct 2026, or null for the imaginary 29 February 1900. */
  shortDate: string | null;
  longDate: string;
  /** HH:MM:SS, or null when the serial has no fractional part. */
  time: string | null;
  note?: string;
}

export type ExcelSerialResult = ExcelSerialSuccess | CalculationFailure;
export type ExcelDateResult = ExcelDateSuccess | CalculationFailure;

/**
 * Rounds a fraction of a day to a short decimal with no trailing zeros.
 */
function trimFraction(fraction: number): string {
  return fraction.toFixed(MAX_FRACTION_DIGITS).replace(/0+$/, "").replace(/^0\./, ".");
}

/**
 * Turns a date, and optionally a time, into the serial number Excel would store.
 * The date is YYYY-MM-DD and the time HH:MM.
 */
export function dateToExcelSerial(
  dateValue: string,
  timeValue: string,
  system: ExcelDateSystem,
): ExcelSerialResult {
  const date = parseIsoDate(dateValue);

  if (!date) {
    return failure("Pick a date to convert.");
  }

  const earliest = system === "1900" ? FIRST_DATE_1900 : FIRST_DATE_1904;

  if (compareDates(date, earliest) < 0 || compareDates(date, LAST_DATE) > 0) {
    return failure(
      system === "1900"
        ? "The 1900 date system covers 1 Jan 1900 to 31 Dec 9999."
        : "The 1904 date system covers 1 Jan 1904 to 31 Dec 9999.",
    );
  }

  let wholeDays: number;

  if (system === "1904") {
    wholeDays = toEpochDay(date) - DAY_ZERO_1904;
  } else {
    const days = toEpochDay(date) - DAY_ZERO_1900;

    // Excel invented a 29 February 1900, which pushes every earlier serial down by one.
    wholeDays = compareDates(date, FIRST_REAL_MARCH_1900) < 0 ? days - 1 : days;
  }

  let fraction = 0;

  if (timeValue) {
    const match = TIME_PATTERN.exec(timeValue);
    const hours = Number(match?.[1]);
    const minutes = Number(match?.[2]);

    if (!match || hours > 23 || minutes > 59) {
      return failure("That time does not exist.");
    }

    fraction = (hours * 60 + minutes) / MINUTES_PER_DAY;
  }

  const fractionText = timeValue ? trimFraction(fraction) : "";

  return {
    ok: true,
    serial: fraction === 0 ? String(wholeDays) : `${wholeDays}${fractionText}`,
    timeFraction: timeValue ? fractionText || "0" : undefined,
    wholeDays,
  };
}

/**
 * Formats a number of seconds into the day as HH:MM:SS.
 */
function formatClock(secondsIntoDay: number): string {
  const hours = Math.floor(secondsIntoDay / 3600);
  const minutes = Math.floor((secondsIntoDay % 3600) / 60);
  const seconds = secondsIntoDay % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

/**
 * Turns an Excel serial number back into the date, and the time if it has a fraction.
 */
export function excelSerialToDate(input: string, system: ExcelDateSystem): ExcelDateResult {
  const text = input.trim();

  if (!text) {
    return failure("Enter an Excel serial number to convert.");
  }

  if (!SERIAL_PATTERN.test(text)) {
    return failure("Enter a positive number such as 46302 or 46302.5.");
  }

  const value = Number(text);
  let wholeDays = Math.floor(value);
  let secondsIntoDay = Math.round((value - wholeDays) * SECONDS_PER_DAY);

  if (secondsIntoDay === SECONDS_PER_DAY) {
    wholeDays += 1;
    secondsIntoDay = 0;
  }

  const time = text.includes(".") ? formatClock(secondsIntoDay) : null;

  if (system === "1900" && wholeDays === PHANTOM_LEAP_SERIAL) {
    return {
      isoDate: null,
      shortDate: null,
      longDate: "29 February 1900",
      note: "This date never existed. Excel counts 1900 as a leap year by mistake and keeps it for compatibility with older software.",
      ok: true,
      time,
    };
  }

  if (wholeDays < (system === "1900" ? 1 : 0)) {
    return failure(
      system === "1900"
        ? "Serial numbers in the 1900 system start at 1, which is 1 Jan 1900."
        : "Serial numbers in the 1904 system start at 0, which is 1 Jan 1904.",
    );
  }

  const epochDay =
    system === "1904"
      ? DAY_ZERO_1904 + wholeDays
      : DAY_ZERO_1900 + wholeDays + (wholeDays < PHANTOM_LEAP_SERIAL ? 1 : 0);
  const date = fromEpochDay(epochDay);

  if (compareDates(date, LAST_DATE) > 0) {
    return failure(`That serial number is past 31 Dec 9999 (${formatNumber(wholeDays)}).`);
  }

  return {
    isoDate: formatIsoDate(date),
    longDate: formatLongDate(date),
    ok: true,
    shortDate: formatShortDate(date),
    time,
  };
}
