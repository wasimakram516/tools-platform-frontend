// @vitest-environment node
import { describe, expect, it } from "vitest";
import { totalWeek, weekToCsv, weekToText, type WeekShift } from "@/lib/tools/dates/week-hours";

const SHIFTS: WeekShift[] = [
  { breakMinutes: 30, endTime: "17:30", netMinutes: 480, startTime: "09:00" },
  { breakMinutes: 30, endTime: "06:00", netMinutes: 450, startTime: "22:00" },
  { breakMinutes: 0, endTime: "13:20", netMinutes: 260, startTime: "09:00" },
];

describe("week totals", () => {
  it("adds the shifts, as hours and minutes and as decimal hours", () => {
    expect(totalWeek(SHIFTS)).toEqual({ decimalHours: 19.83, label: "19h 50m", minutes: 1190, shifts: 3 });
  });

  it("totals an empty week as zero", () => {
    expect(totalWeek([])).toEqual({ decimalHours: 0, label: "0h 00m", minutes: 0, shifts: 0 });
  });

  it("writes plain lines with the total at the end", () => {
    expect(weekToText(SHIFTS.slice(0, 2))).toBe(
      [
        "Shift 1: 09:00 to 17:30, break 30 min, 8h 00m",
        "Shift 2: 22:00 to 06:00, break 30 min, 7h 30m",
        "Total: 15h 30m (15.50 hours)",
      ].join("\n"),
    );
  });

  it("writes CSV with a header and a total row", () => {
    expect(weekToCsv(SHIFTS.slice(0, 2))).toBe(
      [
        "Shift,Start,End,Break (min),Hours worked,Decimal hours",
        "1,09:00,17:30,30,8h 00m,8.00",
        "2,22:00,06:00,30,7h 30m,7.50",
        "Total,,,,15h 30m,15.50",
      ].join("\r\n"),
    );
  });
});
