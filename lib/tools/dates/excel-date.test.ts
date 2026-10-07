// @vitest-environment node
import { describe, expect, it } from "vitest";
import { dateToExcelSerial, excelSerialToDate } from "@/lib/tools/dates/excel-date";

describe("dateToExcelSerial", () => {
  it("matches Excel's own serial numbers in the 1900 system", () => {
    // Expected values were computed independently with Python's datetime module.
    expect(dateToExcelSerial("2026-10-07", "", "1900")).toMatchObject({ ok: true, serial: "46302" });
    expect(dateToExcelSerial("2000-01-01", "", "1900")).toMatchObject({ ok: true, serial: "36526" });
    expect(dateToExcelSerial("2024-02-29", "", "1900")).toMatchObject({ ok: true, serial: "45351" });
    expect(dateToExcelSerial("9999-12-31", "", "1900")).toMatchObject({ ok: true, serial: "2958465" });
  });

  it("accounts for Excel's invented 29 February 1900", () => {
    expect(dateToExcelSerial("1900-01-01", "", "1900")).toMatchObject({ serial: "1" });
    expect(dateToExcelSerial("1900-02-28", "", "1900")).toMatchObject({ serial: "59" });
    expect(dateToExcelSerial("1900-03-01", "", "1900")).toMatchObject({ serial: "61" });
  });

  it("uses the 1904 system when asked", () => {
    expect(dateToExcelSerial("1904-01-01", "", "1904")).toMatchObject({ serial: "0" });
    expect(dateToExcelSerial("2026-10-07", "", "1904")).toMatchObject({ serial: "44840" });
    expect(dateToExcelSerial("9999-12-31", "", "1904")).toMatchObject({ serial: "2957003" });
  });

  it("adds the time as a fraction of a day", () => {
    expect(dateToExcelSerial("2026-10-07", "12:00", "1900")).toMatchObject({
      serial: "46302.5",
      timeFraction: ".5",
    });
    expect(dateToExcelSerial("2026-10-07", "18:30", "1900")).toMatchObject({
      serial: "46302.7708333333",
    });
    expect(dateToExcelSerial("2026-10-07", "00:00", "1900")).toMatchObject({ serial: "46302" });
  });

  it("explains dates outside what each system can hold", () => {
    expect(dateToExcelSerial("1899-12-31", "", "1900")).toMatchObject({ ok: false });
    expect(dateToExcelSerial("1903-12-31", "", "1904")).toMatchObject({ ok: false });
    expect(dateToExcelSerial("", "", "1900")).toEqual({ message: "Pick a date to convert.", ok: false });
    expect(dateToExcelSerial("2026-10-07", "25:00", "1900")).toMatchObject({ ok: false });
  });
});

describe("excelSerialToDate", () => {
  it("turns serial numbers back into dates", () => {
    expect(excelSerialToDate("1", "1900")).toMatchObject({ isoDate: "1900-01-01", ok: true, time: null });
    expect(excelSerialToDate("59", "1900")).toMatchObject({ isoDate: "1900-02-28" });
    expect(excelSerialToDate("61", "1900")).toMatchObject({ isoDate: "1900-03-01" });
    expect(excelSerialToDate("46302", "1900")).toMatchObject({
      isoDate: "2026-10-07",
      longDate: "Wednesday, 7 October 2026",
    });
    expect(excelSerialToDate("2958465", "1900")).toMatchObject({ isoDate: "9999-12-31" });
    expect(excelSerialToDate("44840", "1904")).toMatchObject({ isoDate: "2026-10-07" });
  });

  it("reads the fraction as a time of day", () => {
    expect(excelSerialToDate("46302.5", "1900")).toMatchObject({ isoDate: "2026-10-07", time: "12:00:00" });
    expect(excelSerialToDate("46302.7708333333", "1900")).toMatchObject({ time: "18:30:00" });
    expect(excelSerialToDate("46302.99999999", "1900")).toMatchObject({ isoDate: "2026-10-08", time: "00:00:00" });
  });

  it("flags the 29 February 1900 that never existed", () => {
    const result = excelSerialToDate("60", "1900");

    expect(result).toMatchObject({ isoDate: null, longDate: "29 February 1900", ok: true });
    expect(result.ok && result.note).toContain("never existed");
  });

  it("rejects bad or out-of-range input", () => {
    expect(excelSerialToDate("", "1900")).toMatchObject({ ok: false });
    expect(excelSerialToDate("abc", "1900")).toMatchObject({ ok: false });
    expect(excelSerialToDate("-5", "1900")).toMatchObject({ ok: false });
    expect(excelSerialToDate("0", "1900")).toMatchObject({ ok: false });
    expect(excelSerialToDate("0", "1904")).toMatchObject({ isoDate: "1904-01-01" });
    expect(excelSerialToDate("2958466", "1900")).toMatchObject({ ok: false });
  });
});
