// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  adjustByPercent,
  applyDiscount,
  marginFromCostAndPrice,
  percentChange,
  percentOf,
  priceFromMargin,
  priceFromMarkup,
  whatPercent,
} from "@/lib/tools/calculators/percentage";

describe("percentOf", () => {
  it("finds a percentage of a value", () => {
    expect(percentOf(15, 200)).toEqual({ ok: true, result: 30 });
    expect(percentOf(0, 200)).toEqual({ ok: true, result: 0 });
  });

  it("refuses numbers that are not usable", () => {
    expect(percentOf(Number.NaN, 200).ok).toBe(false);
    expect(percentOf(10, 1e13).ok).toBe(false);
  });
});

describe("whatPercent", () => {
  it("finds what share one number is of another", () => {
    expect(whatPercent(30, 200)).toEqual({ ok: true, percent: 15 });
  });

  it("explains why a whole of zero cannot work", () => {
    const result = whatPercent(5, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.message).toContain("cannot be zero");
  });
});

describe("percentChange", () => {
  it("measures an increase against the starting value", () => {
    expect(percentChange(50, 75)).toEqual({ difference: 25, direction: "increase", ok: true, percent: 50 });
  });

  it("measures a decrease against the starting value, which is not the same size as the increase", () => {
    const result = percentChange(75, 50);

    expect(result).toMatchObject({ difference: 25, direction: "decrease", ok: true });
    expect(result.ok ? result.percent : 0).toBeCloseTo(33.3333, 4);
  });

  it("reports no change", () => {
    expect(percentChange(10, 10)).toEqual({ difference: 0, direction: "none", ok: true, percent: 0 });
  });

  it("refuses a starting value of zero", () => {
    expect(percentChange(0, 10).ok).toBe(false);
  });
});

describe("adjustByPercent", () => {
  it("adds and takes off a percentage", () => {
    const up = adjustByPercent(200, 15, "increase");
    const down = adjustByPercent(200, 15, "decrease");

    expect(up.ok ? up.result : 0).toBeCloseTo(230, 10);
    expect(down).toEqual({ change: 30, ok: true, result: 170 });
  });
});

describe("applyDiscount", () => {
  it("takes a percentage off a price", () => {
    expect(applyDiscount(80, 20)).toEqual({ finalPrice: 64, ok: true, saved: 16 });
  });

  it("only accepts discounts from 0% to 100% and prices that are not negative", () => {
    expect(applyDiscount(80, 101).ok).toBe(false);
    expect(applyDiscount(80, -1).ok).toBe(false);
    expect(applyDiscount(-5, 10).ok).toBe(false);
    expect(applyDiscount(80, 100)).toEqual({ finalPrice: 0, ok: true, saved: 80 });
  });
});

describe("margin and markup", () => {
  it("keeps markup (over cost) and margin (over price) apart", () => {
    const result = marginFromCostAndPrice(60, 100);

    expect(result).toMatchObject({ cost: 60, marginPercent: 40, ok: true, price: 100, profit: 40 });
    expect(result.ok ? result.markupPercent : 0).toBeCloseTo(66.6667, 4);
  });

  it("finds the price for a target markup", () => {
    const result = priceFromMarkup(60, 50);

    expect(result).toMatchObject({ ok: true, price: 90, profit: 30 });
    expect(result.ok ? result.marginPercent : 0).toBeCloseTo(33.3333, 4);
  });

  it("finds the price for a target margin", () => {
    const result = priceFromMargin(60, 40);

    expect(result.ok ? result.price : 0).toBeCloseTo(100, 10);
    expect(result.ok ? result.markupPercent : 0).toBeCloseTo(66.6667, 4);
  });

  it("refuses inputs that cannot work", () => {
    expect(marginFromCostAndPrice(0, 10).ok).toBe(false);
    expect(marginFromCostAndPrice(10, 0).ok).toBe(false);
    expect(priceFromMargin(60, 100).ok).toBe(false);
    expect(priceFromMarkup(60, -100).ok).toBe(false);
  });
});
