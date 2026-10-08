// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateLoan, monthlyPaymentFor, type LoanInput } from "@/lib/tools/calculators/loan";

const BASE: LoanInput = { annualRatePercent: 6, extraMonthly: 0, principal: 200000, termMonths: 360 };

describe("monthlyPaymentFor", () => {
  it("uses the standard payment formula", () => {
    expect(monthlyPaymentFor(200000, 6, 360)).toBeCloseTo(1199.10105, 4);
    expect(monthlyPaymentFor(5000, 8, 12)).toBeCloseTo(434.94215, 4);
  });

  it("splits the loan evenly when there is no interest", () => {
    expect(monthlyPaymentFor(12000, 0, 12)).toBe(1000);
  });
});

describe("calculateLoan", () => {
  it("finds the payment, the total interest, and a full schedule", () => {
    const result = calculateLoan(BASE);

    expect(result.ok && result.monthlyPayment).toBeCloseTo(1199.10105, 4);
    expect(result.ok && result.totalInterest).toBeCloseTo(231676.37811, 2);
    expect(result.ok && result.totalPaid).toBeCloseTo(431676.37811, 2);
    expect(result.ok && result.payoffMonths).toBe(360);
    expect(result.ok && result.schedule).toHaveLength(360);
  });

  it("starts with interest on the full balance and ends at exactly zero", () => {
    const result = calculateLoan(BASE);
    const first = result.ok ? result.schedule[0] : undefined;
    const last = result.ok ? result.schedule[359] : undefined;

    expect(first?.interest).toBeCloseTo(1000, 8);
    expect(first?.balance).toBeCloseTo(199800.89895, 4);
    expect(last?.balance).toBe(0);
  });

  it("reports no savings when there are no extra payments", () => {
    const result = calculateLoan(BASE);

    expect(result.ok && result.interestSaved).toBe(0);
    expect(result.ok && result.monthsSaved).toBe(0);
  });

  it("shortens the loan and saves interest with an extra monthly payment", () => {
    const result = calculateLoan({ ...BASE, extraMonthly: 200 });

    expect(result.ok && result.payoffMonths).toBe(252);
    expect(result.ok && result.monthsSaved).toBe(108);
    expect(result.ok && result.totalInterest).toBeCloseTo(151875.87165, 2);
    expect(result.ok && result.interestSaved).toBeCloseTo(79800.50646, 2);
    expect(result.ok && result.monthlyPayment).toBeCloseTo(1199.10105, 4);
  });

  it("makes the last payment only what is still owed", () => {
    const result = calculateLoan({ ...BASE, extraMonthly: 200 });
    const last = result.ok ? result.schedule[251] : undefined;

    expect(last?.payment).toBeCloseTo(701.50802, 4);
    expect(last?.balance).toBe(0);
  });

  it("handles a loan with no interest", () => {
    const result = calculateLoan({ annualRatePercent: 0, extraMonthly: 0, principal: 12000, termMonths: 12 });

    expect(result.ok && result.monthlyPayment).toBe(1000);
    expect(result.ok && result.totalInterest).toBe(0);
    expect(result.ok && result.schedule[11]?.balance).toBe(0);
  });

  it("pays back exactly the amount borrowed through principal payments", () => {
    const result = calculateLoan(BASE);
    const repaid = result.ok ? result.schedule.reduce((sum, row) => sum + row.principal, 0) : 0;

    expect(repaid).toBeCloseTo(200000, 4);
  });

  it("refuses inputs that cannot work", () => {
    expect(calculateLoan({ ...BASE, principal: 0 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, annualRatePercent: -1 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, annualRatePercent: 101 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, termMonths: 0 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, termMonths: 601 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, termMonths: 12.5 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, extraMonthly: -5 }).ok).toBe(false);
    expect(calculateLoan({ ...BASE, principal: Number.NaN }).ok).toBe(false);
  });
});
