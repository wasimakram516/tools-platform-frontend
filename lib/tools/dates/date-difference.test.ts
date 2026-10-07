// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateDateDifference } from "@/lib/tools/dates/date-difference";

describe("calculateDateDifference", () => {
  it("measures a span within one year", () => {
    expect(calculateDateDifference("2026-01-01", "2026-12-31")).toEqual({
      days: 30,
      direction: "later",
      includesEndDate: false,
      months: 11,
      ok: true,
      remainingDays: 0,
      totalDays: 364,
      weeks: 52,
      years: 0,
    });
  });

  it("measures a long span in years, months, and days", () => {
    expect(calculateDateDifference("2000-01-01", "2026-10-07")).toMatchObject({
      days: 6,
      months: 9,
      ok: true,
      totalDays: 9776,
      years: 26,
    });
  });

  it("counts the leap day", () => {
    expect(calculateDateDifference("2024-02-28", "2024-03-01")).toMatchObject({ totalDays: 2 });
    expect(calculateDateDifference("2023-02-28", "2023-03-01")).toMatchObject({ totalDays: 1 });
  });

  it("gives the same size whichever order the dates are in, and says which way", () => {
    const forward = calculateDateDifference("2026-01-01", "2026-03-01");
    const backward = calculateDateDifference("2026-03-01", "2026-01-01");

    expect(forward).toMatchObject({ direction: "later", months: 2, totalDays: 59 });
    expect(backward).toMatchObject({ direction: "earlier", months: 2, totalDays: 59 });
  });

  it("returns zero for the same date, or one day when the end date is included", () => {
    expect(calculateDateDifference("2026-05-05", "2026-05-05")).toMatchObject({
      direction: "same",
      totalDays: 0,
    });
    expect(calculateDateDifference("2026-05-05", "2026-05-05", true)).toMatchObject({
      includesEndDate: true,
      totalDays: 1,
    });
  });

  it("includes the end date when asked", () => {
    expect(calculateDateDifference("2026-01-01", "2026-01-10", true)).toMatchObject({
      days: 10,
      totalDays: 10,
    });
  });

  it("rejects invalid dates and the end of the supported range", () => {
    expect(calculateDateDifference("", "2026-01-01")).toEqual({
      message: "Enter a valid start date.",
      ok: false,
    });
    expect(calculateDateDifference("2026-01-01", "2026-02-30")).toEqual({
      message: "Enter a valid end date.",
      ok: false,
    });
    expect(calculateDateDifference("9999-12-30", "9999-12-31", true)).toEqual({
      message: "The end date is outside the supported range (years 1 to 9999).",
      ok: false,
    });
  });
});
