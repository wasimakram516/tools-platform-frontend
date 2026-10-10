// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatIsoDate } from "@/lib/format-iso-date";

describe("formatIsoDate", () => {
  it("writes a calendar date in words", () => {
    expect(formatIsoDate("2026-10-09")).toBe("9 October 2026");
    expect(formatIsoDate("2024-02-29")).toBe("29 February 2024");
  });

  it("does not move a date across a day boundary", () => {
    expect(formatIsoDate("2026-01-01")).toBe("1 January 2026");
    expect(formatIsoDate("2026-12-31")).toBe("31 December 2026");
  });

  it("returns text that is not a date as it is", () => {
    expect(formatIsoDate("soon")).toBe("soon");
  });
});
