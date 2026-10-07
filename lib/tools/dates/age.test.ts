// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateAge } from "@/lib/tools/dates/age";

describe("calculateAge", () => {
  it("returns years, months, days, totals, and the next birthday", () => {
    // Expected values were computed independently with Python's datetime module.
    expect(calculateAge("1990-05-15", "2026-10-07")).toEqual({
      birthWeekday: "Tuesday",
      days: 22,
      months: 4,
      nextBirthday: {
        date: "2027-05-15",
        daysUntil: 220,
        longDate: "Saturday, 15 May 2027",
        turningAge: 37,
      },
      ok: true,
      totalDays: 13294,
      totalMonths: 436,
      totalWeeks: 1899,
      years: 36,
    });
  });

  it("recognises a birthday that falls on the date itself", () => {
    const result = calculateAge("2000-10-07", "2026-10-07");

    expect(result).toMatchObject({
      days: 0,
      months: 0,
      ok: true,
      totalDays: 9496,
      years: 26,
    });
    expect(result.ok && result.nextBirthday).toEqual({
      date: "2026-10-07",
      daysUntil: 0,
      longDate: "Wednesday, 7 October 2026",
      turningAge: 26,
    });
  });

  it("moves a leap-day birthday to 28 February in years without a leap day", () => {
    const result = calculateAge("2000-02-29", "2026-10-07");

    expect(result).toMatchObject({ ok: true, totalDays: 9717, years: 26 });
    expect(result.ok && result.nextBirthday).toEqual({
      date: "2027-02-28",
      daysUntil: 144,
      longDate: "Sunday, 28 February 2027",
      turningAge: 27,
    });
  });

  it("keeps a leap-day birthday on 29 February when the next year is a leap year", () => {
    const result = calculateAge("2000-02-29", "2027-10-07");

    expect(result.ok && result.nextBirthday.date).toBe("2028-02-29");
  });

  it("returns zero for a person born on the date itself", () => {
    expect(calculateAge("2026-10-07", "2026-10-07")).toMatchObject({
      days: 0,
      months: 0,
      ok: true,
      totalDays: 0,
      years: 0,
    });
  });

  it("explains what is wrong with the input", () => {
    expect(calculateAge("", "2026-10-07")).toEqual({
      message: "Enter a valid date of birth.",
      ok: false,
    });
    expect(calculateAge("1990-05-15", "nope")).toEqual({
      message: "Enter a valid date to calculate the age at.",
      ok: false,
    });
    expect(calculateAge("2030-01-01", "2026-10-07")).toEqual({
      message: "The date of birth is after the date to calculate the age at.",
      ok: false,
    });
    expect(calculateAge("2023-02-29", "2026-10-07").ok).toBe(false);
  });
});
