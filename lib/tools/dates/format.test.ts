// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatCount, formatNumber, formatYmd } from "@/lib/tools/dates/format";

describe("date formatting helpers", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(13294)).toBe("13,294");
    expect(formatNumber(7)).toBe("7");
  });

  it("pluralises only when the count is not one", () => {
    expect(formatCount(1, "day")).toBe("1 day");
    expect(formatCount(0, "day")).toBe("0 days");
    expect(formatCount(2, "month")).toBe("2 months");
    expect(formatCount(-1, "day")).toBe("-1 day");
    expect(formatCount(1500, "day")).toBe("1,500 days");
  });

  it("describes a span and leaves out zero parts", () => {
    expect(formatYmd({ days: 22, months: 4, years: 36 })).toBe("36 years, 4 months, 22 days");
    expect(formatYmd({ days: 1, months: 1, years: 1 })).toBe("1 year, 1 month, 1 day");
    expect(formatYmd({ days: 0, months: 0, years: 26 })).toBe("26 years");
    expect(formatYmd({ days: 5, months: 0, years: 0 })).toBe("5 days");
    expect(formatYmd({ days: 0, months: 0, years: 0 })).toBe("0 days");
  });
});
