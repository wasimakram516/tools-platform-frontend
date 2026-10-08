import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const MONTHS_PER_YEAR = 12;
const PERCENT_FACTOR = 100;
const MAX_AMOUNT = 1e12;
const MAX_RATE_PERCENT = 100;
export const MAX_LOAN_YEARS = 50;
/** A balance below this is treated as paid off, which absorbs floating point dust. */
const PAID_OFF_THRESHOLD = 0.005;

export interface LoanInput {
  annualRatePercent: number;
  /** An extra amount paid every month on top of the payment. Zero for none. */
  extraMonthly: number;
  principal: number;
  termMonths: number;
}

export interface ScheduleRow {
  balance: number;
  interest: number;
  month: number;
  payment: number;
  principal: number;
}

export interface LoanSuccess {
  ok: true;
  /** Months until the loan is paid off. Fewer than the term when extra payments are made. */
  payoffMonths: number;
  /** The regular monthly payment, before any extra amount. */
  monthlyPayment: number;
  schedule: ScheduleRow[];
  totalInterest: number;
  totalPaid: number;
  /** Interest saved by paying extra, compared with paying only the regular payment. */
  interestSaved: number;
  /** Months saved by paying extra. */
  monthsSaved: number;
}

export type LoanResult = LoanSuccess | CalculationFailure;

/**
 * The regular monthly payment that clears a loan exactly over its term: for a monthly rate r
 * and n months, principal × r / (1 − (1 + r) ^ −n), or principal / n when there is no interest.
 */
export function monthlyPaymentFor(principal: number, annualRatePercent: number, termMonths: number): number {
  const monthlyRate = annualRatePercent / PERCENT_FACTOR / MONTHS_PER_YEAR;

  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);
}

/**
 * Builds the month-by-month schedule for a payment, stopping when the balance reaches zero.
 */
function buildSchedule(principal: number, annualRatePercent: number, payment: number, termMonths: number): ScheduleRow[] {
  const monthlyRate = annualRatePercent / PERCENT_FACTOR / MONTHS_PER_YEAR;
  const rows: ScheduleRow[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths && balance > PAID_OFF_THRESHOLD; month += 1) {
    const interest = balance * monthlyRate;
    // The last payment is only what is still owed, so the loan ends at exactly zero.
    const paid = Math.min(payment, balance + interest);
    const principalPart = paid - interest;

    balance = Math.max(balance - principalPart, 0);

    if (balance < PAID_OFF_THRESHOLD) {
      balance = 0;
    }

    rows.push({ balance, interest, month, payment: paid, principal: principalPart });
  }

  return rows;
}

/**
 * Adds up the interest paid across a schedule.
 */
function sumInterest(schedule: readonly ScheduleRow[]): number {
  return schedule.reduce((sum, row) => sum + row.interest, 0);
}

/**
 * Calculates a fixed-rate loan: the monthly payment, the total interest, and the full
 * month-by-month schedule. An extra monthly amount shortens the loan, and the result shows
 * how much interest and how many months that saves.
 */
export function calculateLoan(input: LoanInput): LoanResult {
  const { annualRatePercent, extraMonthly, principal, termMonths } = input;

  if (![annualRatePercent, extraMonthly, principal, termMonths].every(Number.isFinite)) {
    return failure("Enter the loan amount, the rate, and the term.");
  }

  if (principal <= 0 || principal > MAX_AMOUNT) {
    return failure("Enter a loan amount above zero and below one trillion.");
  }

  if (annualRatePercent < 0 || annualRatePercent > MAX_RATE_PERCENT) {
    return failure("The interest rate must be between 0% and 100%.");
  }

  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > MAX_LOAN_YEARS * MONTHS_PER_YEAR) {
    return failure(`The term must be between 1 month and ${MAX_LOAN_YEARS} years.`);
  }

  if (extraMonthly < 0 || extraMonthly > MAX_AMOUNT) {
    return failure("The extra payment cannot be negative.");
  }

  const monthlyPayment = monthlyPaymentFor(principal, annualRatePercent, termMonths);
  const baseline = buildSchedule(principal, annualRatePercent, monthlyPayment, termMonths);
  const schedule =
    extraMonthly > 0
      ? buildSchedule(principal, annualRatePercent, monthlyPayment + extraMonthly, termMonths)
      : baseline;
  const totalInterest = sumInterest(schedule);

  return {
    interestSaved: sumInterest(baseline) - totalInterest,
    monthlyPayment,
    monthsSaved: baseline.length - schedule.length,
    ok: true,
    payoffMonths: schedule.length,
    schedule,
    totalInterest,
    totalPaid: principal + totalInterest,
  };
}
