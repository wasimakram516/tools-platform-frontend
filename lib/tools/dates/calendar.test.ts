// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  compareDates,
  daysBetween,
  daysInMonth,
  differenceInYmd,
  formatIsoDate,
  formatLongDate,
  fromEpochDay,
  isLeapYear,
  parseIsoDate,
  toEpochDay,
  weekdayName,
} from "@/lib/tools/dates/calendar";

/**
 * Parses an ISO date that the test knows is valid.
 */
function date(value: string): NonNullable<ReturnType<typeof parseIsoDate>> {
  const parsed = parseIsoDate(value);

  if (!parsed) {
    throw new Error(`Test date ${value} is not valid`);
  }

  return parsed;
}

describe("leap years and month lengths", () => {
  it("applies the Gregorian leap-year rules", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it("returns the right number of days for every kind of month", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("parsing and formatting", () => {
  it("accepts real dates and rejects impossible ones", () => {
    expect(parseIsoDate("2024-02-29")).toEqual({ day: 29, month: 2, year: 2024 });
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("2026-04-31")).toBeNull();
    expect(parseIsoDate("2026-4-5")).toBeNull();
    expect(parseIsoDate("not a date")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });

  it("round-trips through the ISO format, including years below 100", () => {
    expect(formatIsoDate(date("2026-10-07"))).toBe("2026-10-07");
    expect(formatIsoDate(date("0044-03-15"))).toBe("0044-03-15");
  });

  it("formats a long, human date", () => {
    expect(formatLongDate(date("2026-10-09"))).toBe("Friday, 9 October 2026");
  });
});

describe("epoch days and weekdays", () => {
  it("maps 1970-01-01 to day zero and back", () => {
    expect(toEpochDay(date("1970-01-01"))).toBe(0);
    expect(toEpochDay(date("1970-01-02"))).toBe(1);
    expect(fromEpochDay(0)).toEqual({ day: 1, month: 1, year: 1970 });
  });

  it("handles dates before 1970 and years below 100 without shifting", () => {
    expect(toEpochDay(date("1969-12-31"))).toBe(-1);
    expect(fromEpochDay(toEpochDay(date("0044-03-15")))).toEqual({ day: 15, month: 3, year: 44 });
  });

  it("names weekdays correctly, before and after the epoch", () => {
    expect(weekdayName(date("1970-01-01"))).toBe("Thursday");
    expect(weekdayName(date("2000-01-01"))).toBe("Saturday");
    expect(weekdayName(date("1969-12-31"))).toBe("Wednesday");
    expect(weekdayName(date("2024-02-29"))).toBe("Thursday");
  });
});

describe("day arithmetic", () => {
  it("compares dates and counts whole days", () => {
    expect(compareDates(date("2026-01-01"), date("2026-01-02"))).toBeLessThan(0);
    expect(compareDates(date("2026-01-02"), date("2026-01-02"))).toBe(0);
    expect(daysBetween(date("2024-02-28"), date("2024-03-01"))).toBe(2);
    expect(daysBetween(date("2023-02-28"), date("2023-03-01"))).toBe(1);
    expect(daysBetween(date("2026-03-01"), date("2026-02-01"))).toBe(-28);
  });

  it("is unaffected by daylight-saving changes", () => {
    expect(daysBetween(date("2026-03-28"), date("2026-03-30"))).toBe(2);
    expect(daysBetween(date("2026-10-24"), date("2026-10-26"))).toBe(2);
  });

  it("adds and subtracts days across month and year ends", () => {
    expect(formatIsoDate(addDays(date("2026-12-31"), 1))).toBe("2027-01-01");
    expect(formatIsoDate(addDays(date("2026-03-01"), -1))).toBe("2026-02-28");
    expect(formatIsoDate(addDays(date("2024-03-01"), -1))).toBe("2024-02-29");
  });
});

describe("month arithmetic", () => {
  it("clamps to the last day of shorter months", () => {
    expect(formatIsoDate(addMonths(date("2026-01-31"), 1))).toBe("2026-02-28");
    expect(formatIsoDate(addMonths(date("2024-01-31"), 1))).toBe("2024-02-29");
    expect(formatIsoDate(addMonths(date("2026-03-31"), -1))).toBe("2026-02-28");
  });

  it("moves across years in both directions", () => {
    expect(formatIsoDate(addMonths(date("2026-11-15"), 3))).toBe("2027-02-15");
    expect(formatIsoDate(addMonths(date("2026-02-15"), -3))).toBe("2025-11-15");
    expect(formatIsoDate(addMonths(date("2026-06-10"), 12))).toBe("2027-06-10");
  });

  it("keeps a leap day on 29 February in leap years and clamps otherwise", () => {
    expect(formatIsoDate(addMonths(date("2024-02-29"), 12))).toBe("2025-02-28");
    expect(formatIsoDate(addMonths(date("2024-02-29"), 48))).toBe("2028-02-29");
  });
});

describe("differences in years, months, and days", () => {
  it("returns zero for the same date", () => {
    expect(differenceInYmd(date("2026-05-05"), date("2026-05-05"))).toEqual({
      days: 0,
      months: 0,
      years: 0,
    });
  });

  it("counts whole years, months, and days", () => {
    expect(differenceInYmd(date("1990-05-15"), date("2026-10-07"))).toEqual({
      days: 22,
      months: 4,
      years: 36,
    });
  });

  it("borrows from the previous month correctly at month ends", () => {
    expect(differenceInYmd(date("2026-01-31"), date("2026-03-01"))).toEqual({
      days: 1,
      months: 1,
      years: 0,
    });
    expect(differenceInYmd(date("2024-01-31"), date("2024-03-01"))).toEqual({
      days: 1,
      months: 1,
      years: 0,
    });
  });

  it("handles an exact anniversary and the day before it", () => {
    expect(differenceInYmd(date("2000-03-10"), date("2026-03-10"))).toEqual({
      days: 0,
      months: 0,
      years: 26,
    });
    expect(differenceInYmd(date("2000-03-10"), date("2026-03-09"))).toEqual({
      days: 27,
      months: 11,
      years: 25,
    });
  });

  it("handles a leap-day birth date", () => {
    expect(differenceInYmd(date("2000-02-29"), date("2001-02-28"))).toEqual({
      days: 0,
      months: 0,
      years: 1,
    });
    expect(differenceInYmd(date("2000-02-29"), date("2024-02-29"))).toEqual({
      days: 0,
      months: 0,
      years: 24,
    });
  });
});
