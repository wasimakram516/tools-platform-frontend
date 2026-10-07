import {
  compareDates,
  daysBetween,
  daysInMonth,
  differenceInYmd,
  formatIsoDate,
  formatLongDate,
  parseIsoDate,
  weekdayName,
  type CalendarDate,
} from "@/lib/tools/dates/calendar";
import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const DAYS_PER_WEEK = 7;

export interface AgeSuccess {
  ok: true;
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  birthWeekday: string;
  nextBirthday: {
    /** YYYY-MM-DD */
    date: string;
    /** For example "Saturday, 15 May 2027". */
    longDate: string;
    daysUntil: number;
    turningAge: number;
  };
}

export type AgeResult = AgeSuccess | CalculationFailure;

/**
 * Finds a birthday in a given year. A 29 February birthday falls on 28 February in years
 * without a leap day, which matches how month-end dates are handled elsewhere.
 */
function birthdayInYear(birth: CalendarDate, year: number): CalendarDate {
  return { day: Math.min(birth.day, daysInMonth(year, birth.month)), month: birth.month, year };
}

/**
 * Calculates a person's age on a given date, plus the totals and the next birthday.
 * Both dates are YYYY-MM-DD strings.
 */
export function calculateAge(birthDate: string, asOfDate: string): AgeResult {
  const birth = parseIsoDate(birthDate);
  const asOf = parseIsoDate(asOfDate);

  if (!birth) {
    return failure("Enter a valid date of birth.");
  }

  if (!asOf) {
    return failure("Enter a valid date to calculate the age at.");
  }

  if (compareDates(birth, asOf) > 0) {
    return failure("The date of birth is after the date to calculate the age at.");
  }

  const { years, months, days } = differenceInYmd(birth, asOf);
  const totalDays = daysBetween(birth, asOf);

  let nextBirthday = birthdayInYear(birth, asOf.year);

  if (compareDates(nextBirthday, asOf) < 0) {
    nextBirthday = birthdayInYear(birth, asOf.year + 1);
  }

  return {
    birthWeekday: weekdayName(birth),
    days,
    months,
    nextBirthday: {
      date: formatIsoDate(nextBirthday),
      daysUntil: daysBetween(asOf, nextBirthday),
      longDate: formatLongDate(nextBirthday),
      turningAge: nextBirthday.year - birth.year,
    },
    ok: true,
    totalDays,
    totalMonths: years * 12 + months,
    totalWeeks: Math.floor(totalDays / DAYS_PER_WEEK),
    years,
  };
}
