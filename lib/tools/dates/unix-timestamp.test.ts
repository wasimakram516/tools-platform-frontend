// @vitest-environment node
import { describe, expect, it } from "vitest";
import { pickerValueToTimestamp, transformUnixTimestamp } from "@/lib/tools/dates/unix-timestamp";

/**
 * Returns the output text of a successful conversion, or fails the test.
 */
function outputOf(result: ReturnType<typeof transformUnixTimestamp>): string {
  if (!result.ok) {
    throw new Error(`Expected success but got: ${result.message}`);
  }

  return result.output;
}

describe("timestamp to date", () => {
  it("reads seconds and shows UTC and local time", () => {
    const output = outputOf(transformUnixTimestamp("1760000000", "toDate", { timeZone: "UTC" }));

    expect(output).toContain("Detected unit: seconds");
    expect(output).toContain("Seconds: 1760000000");
    expect(output).toContain("Milliseconds: 1760000000000");
    expect(output).toContain("ISO 8601: 2025-10-09T08:53:20.000Z");
    expect(output).toContain("UTC: 09 Oct 2025, 08:53:20 am UTC");
    expect(output).toContain("Local (UTC):");
    expect(output).toContain("08:53:20");
  });

  it("reads 13-digit values as milliseconds and keeps the fraction", () => {
    const output = outputOf(transformUnixTimestamp("1760000000123", "toDate", { timeZone: "UTC" }));

    expect(output).toContain("Detected unit: milliseconds");
    expect(output).toContain("Seconds: 1760000000");
    expect(output).toContain("ISO 8601: 2025-10-09T08:53:20.123Z");
  });

  it("applies the requested time zone to the local line", () => {
    const output = outputOf(
      transformUnixTimestamp("1760000000", "toDate", { timeZone: "Asia/Karachi" }),
    );

    expect(output).toContain("Local (Asia/Karachi):");
    expect(output).toContain("13:53:20");
  });

  it("handles zero and negative timestamps", () => {
    expect(outputOf(transformUnixTimestamp("0", "toDate", { timeZone: "UTC" }))).toContain(
      "ISO 8601: 1970-01-01T00:00:00.000Z",
    );
    expect(outputOf(transformUnixTimestamp("-86400", "toDate", { timeZone: "UTC" }))).toContain(
      "ISO 8601: 1969-12-31T00:00:00.000Z",
    );
  });

  it("explains empty, malformed, and out-of-range input", () => {
    expect(transformUnixTimestamp("   ", "toDate")).toEqual({
      message: "Enter a Unix timestamp to convert.",
      ok: false,
    });
    expect(transformUnixTimestamp("12.5", "toDate").ok).toBe(false);
    expect(transformUnixTimestamp("abc", "toDate").ok).toBe(false);
    expect(transformUnixTimestamp("9999999999999999", "toDate")).toEqual({
      message: "That timestamp is outside the range a date can represent.",
      ok: false,
    });
  });
});

describe("date to timestamp", () => {
  it("converts an ISO date-time in UTC", () => {
    const output = outputOf(transformUnixTimestamp("2026-10-07T12:30:00Z", "toTimestamp"));

    expect(output).toContain("Seconds: 1791376200");
    expect(output).toContain("Milliseconds: 1791376200000");
    expect(output).toContain("ISO 8601: 2026-10-07T12:30:00.000Z");
    expect(output).not.toContain("Note:");
  });

  it("reads a date with no time zone as UTC and says so", () => {
    const dateOnly = outputOf(transformUnixTimestamp("2026-10-07", "toTimestamp"));
    const spaced = outputOf(transformUnixTimestamp("2026-10-07 12:30:00", "toTimestamp"));

    expect(dateOnly).toContain("Seconds: 1791331200");
    expect(dateOnly).toContain("Note: no time zone was given, so it was read as UTC.");
    expect(spaced).toContain("Seconds: 1791376200");
  });

  it("applies a time zone offset", () => {
    expect(outputOf(transformUnixTimestamp("2026-10-07T12:30:00+05:00", "toTimestamp"))).toContain(
      "Seconds: 1791358200",
    );
    expect(outputOf(transformUnixTimestamp("2026-10-07T12:30:00+0500", "toTimestamp"))).toContain(
      "Seconds: 1791358200",
    );
  });

  it("keeps milliseconds", () => {
    const output = outputOf(transformUnixTimestamp("1970-01-01T00:00:00.5Z", "toTimestamp"));

    expect(output).toContain("Seconds: 0");
    expect(output).toContain("Milliseconds: 500");
  });

  it("round-trips the 32-bit limit", () => {
    const toDate = outputOf(transformUnixTimestamp("2147483647", "toDate", { timeZone: "UTC" }));
    const toTimestamp = outputOf(transformUnixTimestamp("2038-01-19T03:14:07Z", "toTimestamp"));

    expect(toDate).toContain("ISO 8601: 2038-01-19T03:14:07.000Z");
    expect(toTimestamp).toContain("Seconds: 2147483647");
  });

  it("rejects dates that do not exist and text that is not a date", () => {
    expect(transformUnixTimestamp("2026-02-30", "toTimestamp")).toEqual({
      message: "That date or time does not exist.",
      ok: false,
    });
    expect(transformUnixTimestamp("2026-10-07T25:00:00Z", "toTimestamp").ok).toBe(false);
    expect(transformUnixTimestamp("2026-10-07T12:30:00+25:00", "toTimestamp").ok).toBe(false);
    expect(transformUnixTimestamp("yesterday", "toTimestamp")).toEqual({
      message: "Enter a date such as 2026-10-07 or 2026-10-07T12:30:00Z.",
      ok: false,
    });
    expect(transformUnixTimestamp("", "toTimestamp")).toEqual({
      message: "Enter a date and time to convert.",
      ok: false,
    });
  });
});

describe("pickerValueToTimestamp", () => {
  it("reads the picked time as UTC", () => {
    // Expected values were computed independently with Python's datetime module.
    const result = pickerValueToTimestamp("2026-10-07T15:30", "utc");

    expect(outputOf(result)).toContain("Seconds: 1791387000");
    expect(outputOf(result)).toContain("ISO 8601: 2026-10-07T15:30:00.000Z");
  });

  it("reads the picked time in the browser's time zone", () => {
    const east = pickerValueToTimestamp("2026-10-07T15:30", "local", () => 300);
    const west = pickerValueToTimestamp("2026-10-07T15:30", "local", () => -210);

    expect(outputOf(east)).toContain("Seconds: 1791369000");
    expect(outputOf(east)).toContain("Time zone used: +05:00");
    expect(outputOf(west)).toContain("Seconds: 1791399600");
    expect(outputOf(west)).toContain("Time zone used: -03:30");
  });

  it("asks for a value when nothing is picked", () => {
    expect(pickerValueToTimestamp("", "utc")).toEqual({
      message: "Pick a date and time to convert.",
      ok: false,
    });
  });
});
