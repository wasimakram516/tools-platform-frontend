// @vitest-environment node
import { describe, expect, it } from "vitest";
import { todayIsoDate } from "@/lib/tools/dates/today";

describe("todayIsoDate", () => {
  it("formats the local calendar date with zero padding", () => {
    expect(todayIsoDate(new Date(2026, 9, 7, 23, 59))).toBe("2026-10-07");
    expect(todayIsoDate(new Date(2026, 0, 3, 0, 1))).toBe("2026-01-03");
  });
});
