// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateDateMath, type DateMathInput } from "@/lib/tools/dates/date-math";

/**
 * Builds an input with every amount defaulting to zero.
 */
function input(overrides: Partial<DateMathInput>): DateMathInput {
  return { days: 0, months: 0, operation: "add", startDate: "2026-10-07", weeks: 0, years: 0, ...overrides };
}

describe("calculateDateMath", () => {
  it("adds years, months, weeks, and days together", () => {
    // 2026-10-07 + 1 year 2 months = 2027-12-07, then + 25 days = 2028-01-01 (Saturday)
    expect(calculateDateMath(input({ days: 4, months: 2, weeks: 3, years: 1 }))).toEqual({
      date: "2028-01-01",
      shortDate: "01 Jan 2028",
      daysFromStart: 451,
      longDate: "Saturday, 1 January 2028",
      ok: true,
    });
  });

  it("subtracts, clamping to the end of a shorter month", () => {
    expect(
      calculateDateMath(input({ months: 1, operation: "subtract", startDate: "2026-03-31" })),
    ).toMatchObject({ date: "2026-02-28", longDate: "Saturday, 28 February 2026", ok: true });
  });

  it("adds a month to 31 January in leap and non-leap years", () => {
    expect(calculateDateMath(input({ months: 1, startDate: "2024-01-31" }))).toMatchObject({
      date: "2024-02-29",
    });
    expect(calculateDateMath(input({ months: 1, startDate: "2026-01-31" }))).toMatchObject({
      date: "2026-02-28",
    });
  });

  it("returns the start date when every amount is zero", () => {
    expect(calculateDateMath(input({}))).toMatchObject({
      date: "2026-10-07",
      daysFromStart: 0,
      ok: true,
    });
  });

  it("subtracts days across a year boundary", () => {
    expect(
      calculateDateMath(input({ days: 7, operation: "subtract", startDate: "2026-01-03" })),
    ).toMatchObject({ date: "2025-12-27", daysFromStart: -7 });
  });

  it("rejects an invalid start date and bad amounts", () => {
    expect(calculateDateMath(input({ startDate: "2026-02-30" }))).toEqual({
      message: "Enter a valid start date.",
      ok: false,
    });
    expect(calculateDateMath(input({ days: -1 }))).toEqual({
      message: "Amounts must be whole numbers from 0 to 1,000,000.",
      ok: false,
    });
    expect(calculateDateMath(input({ days: 1.5 })).ok).toBe(false);
    expect(calculateDateMath(input({ years: 2_000_000 })).ok).toBe(false);
  });

  it("refuses results outside years 1 to 9999", () => {
    const message = "The result is outside the supported range (years 1 to 9999).";

    expect(calculateDateMath(input({ startDate: "9999-12-31", days: 1 }))).toEqual({ message, ok: false });
    expect(
      calculateDateMath(input({ operation: "subtract", startDate: "0001-01-01", days: 1 })),
    ).toEqual({ message, ok: false });
    expect(calculateDateMath(input({ years: 9000 }))).toEqual({ message, ok: false });
  });
});
