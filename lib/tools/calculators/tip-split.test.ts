// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateTipSplit } from "@/lib/tools/calculators/tip-split";
import { formatAmount, formatPercent, parseDecimal } from "@/lib/tools/calculators/format";

describe("calculateTipSplit", () => {
  it("adds the tip and splits the total evenly", () => {
    const result = calculateTipSplit({ bill: 120.5, people: 4, roundUpShare: false, tipPercent: 18 });

    expect(result.ok && result.total).toBeCloseTo(142.19, 8);
    expect(result.ok && result.tip).toBeCloseTo(21.69, 8);
    expect(result.ok && result.perPerson).toBeCloseTo(35.5475, 8);
    expect(result.ok && result.effectiveTipPercent).toBeCloseTo(18, 8);
  });

  it("rounds each share up to a whole number and counts the extra as tip", () => {
    const result = calculateTipSplit({ bill: 120.5, people: 4, roundUpShare: true, tipPercent: 18 });

    expect(result.ok && result.perPerson).toBe(36);
    expect(result.ok && result.total).toBe(144);
    expect(result.ok && result.tip).toBeCloseTo(23.5, 8);
    expect(result.ok && result.effectiveTipPercent).toBeCloseTo(19.5020747, 6);
  });

  it("does not round up a share that is already whole", () => {
    const result = calculateTipSplit({ bill: 100, people: 4, roundUpShare: true, tipPercent: 20 });

    expect(result.ok && result.perPerson).toBe(30);
  });

  it("works for one person with no tip", () => {
    const result = calculateTipSplit({ bill: 50, people: 1, roundUpShare: false, tipPercent: 0 });

    expect(result).toMatchObject({ ok: true, perPerson: 50, tip: 0, total: 50 });
  });

  it("refuses inputs that cannot work", () => {
    expect(calculateTipSplit({ bill: 0, people: 2, roundUpShare: false, tipPercent: 10 }).ok).toBe(false);
    expect(calculateTipSplit({ bill: 10, people: 0, roundUpShare: false, tipPercent: 10 }).ok).toBe(false);
    expect(calculateTipSplit({ bill: 10, people: 2.5, roundUpShare: false, tipPercent: 10 }).ok).toBe(false);
    expect(calculateTipSplit({ bill: 10, people: 101, roundUpShare: false, tipPercent: 10 }).ok).toBe(false);
    expect(calculateTipSplit({ bill: 10, people: 2, roundUpShare: false, tipPercent: 101 }).ok).toBe(false);
    expect(calculateTipSplit({ bill: Number.NaN, people: 2, roundUpShare: false, tipPercent: 10 }).ok).toBe(false);
  });
});

describe("number formatting", () => {
  it("parses a typed number, and tells an empty field from zero", () => {
    expect(parseDecimal("12.5")).toBe(12.5);
    expect(parseDecimal("0")).toBe(0);
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("  ")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
  });

  it("shows amounts with separators and two decimals, with no currency symbol", () => {
    expect(formatAmount(1234.5)).toBe("1,234.50");
    expect(formatAmount(0)).toBe("0.00");
  });

  it("shows percentages without trailing zeros", () => {
    expect(formatPercent(12.5)).toBe("12.5%");
    expect(formatPercent(15)).toBe("15%");
    expect(formatPercent(33.33333)).toBe("33.33%");
  });
});
