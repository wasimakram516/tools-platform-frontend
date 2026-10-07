// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateHoursWorked } from "@/lib/tools/dates/hours-worked";

describe("calculateHoursWorked", () => {
  it("subtracts the break from a normal shift", () => {
    expect(calculateHoursWorked("09:00", "17:30", 30)).toEqual({
      breakMinutes: 30,
      crossesMidnight: false,
      decimalHours: 8,
      grossMinutes: 510,
      netLabel: "8h 00m",
      netMinutes: 480,
      ok: true,
    });
  });

  it("handles a shift that runs past midnight", () => {
    expect(calculateHoursWorked("22:00", "06:00", 0)).toMatchObject({
      crossesMidnight: true,
      decimalHours: 8,
      netLabel: "8h 00m",
      netMinutes: 480,
      ok: true,
    });
  });

  it("reports partial hours as minutes and as a rounded decimal", () => {
    expect(calculateHoursWorked("08:15", "16:00", 0)).toMatchObject({
      decimalHours: 7.75,
      netLabel: "7h 45m",
    });
    expect(calculateHoursWorked("08:00", "08:20", 0)).toMatchObject({
      decimalHours: 0.33,
      netLabel: "0h 20m",
    });
  });

  it("allows a break that takes up the whole shift", () => {
    expect(calculateHoursWorked("09:00", "10:00", 60)).toMatchObject({
      decimalHours: 0,
      netLabel: "0h 00m",
      ok: true,
    });
  });

  it("rejects invalid times, equal times, and breaks that are too long", () => {
    expect(calculateHoursWorked("25:00", "17:00", 0)).toEqual({
      message: "Enter a valid start time.",
      ok: false,
    });
    expect(calculateHoursWorked("09:00", "9:5", 0)).toEqual({
      message: "Enter a valid end time.",
      ok: false,
    });
    expect(calculateHoursWorked("09:00", "09:00", 0)).toEqual({
      message: "The start and end times are the same. Change one of them.",
      ok: false,
    });
    expect(calculateHoursWorked("09:00", "10:00", 61)).toEqual({
      message: "The break is longer than the shift.",
      ok: false,
    });
    expect(calculateHoursWorked("09:00", "17:00", -5).ok).toBe(false);
    expect(calculateHoursWorked("09:00", "17:00", 2.5).ok).toBe(false);
    expect(calculateHoursWorked("09:00", "17:00", 2000).ok).toBe(false);
  });
});
