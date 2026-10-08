// @vitest-environment node
import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/tools/calculators/csv";

describe("toCsv", () => {
  it("joins cells with commas and rows with CRLF", () => {
    expect(toCsv(["Month", "Balance"], [["1", "100.00"], ["2", "50.00"]])).toBe("Month,Balance\r\n1,100.00\r\n2,50.00");
  });

  it("quotes cells that hold commas, quotes, or line breaks", () => {
    expect(toCsv(["A"], [["1,234.50"], ['say "hi"'], ["two\nlines"]])).toBe('A\r\n"1,234.50"\r\n"say ""hi"""\r\n"two\nlines"');
  });

  it("writes only the header when there are no rows", () => {
    expect(toCsv(["A", "B"], [])).toBe("A,B");
  });
});
