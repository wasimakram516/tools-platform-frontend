// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateCompoundInterest, calculateSimpleInterest, type InterestInput } from "@/lib/tools/calculators/interest";

const BASE: InterestInput = {
  compoundsPerYear: 12,
  monthlyContribution: 0,
  principal: 10000,
  ratePercent: 5,
  termMonths: 120,
};

describe("calculateSimpleInterest", () => {
  it("earns interest on the starting amount only: principal x rate x years", () => {
    const result = calculateSimpleInterest({ ...BASE, termMonths: 36 });

    expect(result.ok && result.totalInterest).toBeCloseTo(1500, 8);
    expect(result.ok && result.finalBalance).toBeCloseTo(11500, 8);
  });

  it("counts interest on monthly additions for the months they are held", () => {
    const result = calculateSimpleInterest({ ...BASE, monthlyContribution: 100, principal: 1000, ratePercent: 6, termMonths: 12 });

    expect(result.ok && result.totalInterest).toBeCloseTo(93, 8);
    expect(result.ok && result.totalDeposited).toBeCloseTo(2200, 8);
    expect(result.ok && result.finalBalance).toBeCloseTo(2293, 8);
  });
});

describe("calculateCompoundInterest", () => {
  it("matches principal x (1 + rate / n) ^ (n x years) for monthly compounding", () => {
    const result = calculateCompoundInterest(BASE);

    expect(result.ok && result.finalBalance).toBeCloseTo(16470.0949769, 5);
  });

  it("matches yearly compounding", () => {
    const result = calculateCompoundInterest({ ...BASE, compoundsPerYear: 1 });

    expect(result.ok && result.finalBalance).toBeCloseTo(16288.9462678, 5);
  });

  it("matches daily compounding over one year", () => {
    const result = calculateCompoundInterest({ ...BASE, compoundsPerYear: 365, termMonths: 12 });

    expect(result.ok && result.finalBalance).toBeCloseTo(10512.6749647, 5);
  });

  it("adds a monthly contribution at the end of each month", () => {
    const result = calculateCompoundInterest({ ...BASE, monthlyContribution: 200 });

    expect(result.ok && result.finalBalance).toBeCloseTo(47526.5508660, 4);
    expect(result.ok && result.totalDeposited).toBe(34000);
    expect(result.ok && result.totalInterest).toBeCloseTo(13526.5508660, 4);
  });

  it("handles a term that is not whole years, with a final part-year row", () => {
    const result = calculateCompoundInterest({ ...BASE, compoundsPerYear: 1, principal: 1000, ratePercent: 10, termMonths: 6 });

    expect(result.ok && result.finalBalance).toBeCloseTo(1048.8088482, 6);
    expect(result.ok && result.years).toHaveLength(1);
  });

  it("returns one row per year, ending at the final balance", () => {
    const result = calculateCompoundInterest(BASE);

    expect(result.ok && result.years).toHaveLength(10);
    expect(result.ok && result.years[9]?.balance).toBeCloseTo(16470.0949769, 5);
    expect(result.ok && result.years[0]?.year).toBe(1);
  });

  it("stays at the starting amount with no interest", () => {
    const result = calculateCompoundInterest({ ...BASE, ratePercent: 0 });

    expect(result.ok && result.finalBalance).toBeCloseTo(10000, 8);
  });

  it("refuses inputs that cannot work", () => {
    expect(calculateCompoundInterest({ ...BASE, principal: -1 }).ok).toBe(false);
    expect(calculateCompoundInterest({ ...BASE, principal: 0 }).ok).toBe(false);
    expect(calculateCompoundInterest({ ...BASE, ratePercent: 101 }).ok).toBe(false);
    expect(calculateCompoundInterest({ ...BASE, termMonths: 0 }).ok).toBe(false);
    expect(calculateCompoundInterest({ ...BASE, termMonths: 1201 }).ok).toBe(false);
    expect(calculateCompoundInterest({ ...BASE, compoundsPerYear: 7 }).ok).toBe(false);
    expect(calculateSimpleInterest({ ...BASE, principal: Number.NaN }).ok).toBe(false);
  });

  it("allows saving from nothing with a monthly amount alone", () => {
    expect(calculateCompoundInterest({ ...BASE, monthlyContribution: 50, principal: 0 }).ok).toBe(true);
  });
});
