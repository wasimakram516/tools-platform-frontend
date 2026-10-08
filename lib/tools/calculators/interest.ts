import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const MONTHS_PER_YEAR = 12;
const PERCENT_FACTOR = 100;
const MAX_AMOUNT = 1e12;
const MAX_RATE_PERCENT = 100;
export const MAX_TERM_YEARS = 100;

/** How many times a year interest is added to the balance. */
export const COMPOUNDING_OPTIONS = [
  { label: "Yearly", perYear: 1 },
  { label: "Half-yearly", perYear: 2 },
  { label: "Quarterly", perYear: 4 },
  { label: "Monthly", perYear: 12 },
  { label: "Daily", perYear: 365 },
] as const;

export interface InterestInput {
  /** What is added at the end of every month. Zero for none. */
  monthlyContribution: number;
  principal: number;
  /** Interest added per year; applies to compound interest only. */
  compoundsPerYear: number;
  ratePercent: number;
  termMonths: number;
}

export interface YearRow {
  /** The balance at the end of the year. */
  balance: number;
  /** Everything put in so far, including the starting amount. */
  deposited: number;
  /** Interest earned so far. */
  interest: number;
  year: number;
}

export interface InterestSuccess {
  ok: true;
  finalBalance: number;
  totalDeposited: number;
  totalInterest: number;
  /** One row per year, with a last partial-year row when the term is not whole years. */
  years: YearRow[];
}

export type InterestResult = InterestSuccess | CalculationFailure;

/**
 * Checks the inputs both calculations share.
 */
function validate(input: InterestInput): CalculationFailure | null {
  const { monthlyContribution, principal, ratePercent, termMonths } = input;

  if (![monthlyContribution, principal, ratePercent, termMonths].every(Number.isFinite)) {
    return failure("Enter every number.");
  }

  if (principal < 0 || monthlyContribution < 0) {
    return failure("Amounts cannot be negative.");
  }

  if (principal > MAX_AMOUNT || monthlyContribution > MAX_AMOUNT) {
    return failure("Enter amounts below one trillion.");
  }

  if (principal === 0 && monthlyContribution === 0) {
    return failure("Enter a starting amount, a monthly amount, or both.");
  }

  if (ratePercent < 0 || ratePercent > MAX_RATE_PERCENT) {
    return failure("The rate must be between 0% and 100%.");
  }

  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > MAX_TERM_YEARS * MONTHS_PER_YEAR) {
    return failure(`The term must be between 1 month and ${MAX_TERM_YEARS} years.`);
  }

  return null;
}

/**
 * Calculates simple interest, which is earned on the starting amount only: interest = principal
 * × rate × years. Monthly additions earn interest for the months they were held.
 */
export function calculateSimpleInterest(input: InterestInput): InterestResult {
  const invalid = validate(input);

  if (invalid) {
    return invalid;
  }

  const { monthlyContribution, principal, ratePercent, termMonths } = input;
  const yearlyRate = ratePercent / PERCENT_FACTOR;
  const rows: YearRow[] = [];
  let deposited = principal;
  let interest = 0;

  for (let month = 1; month <= termMonths; month += 1) {
    // The starting amount earns for every month. A deposit made at the end of month m earns
    // for the months that remain after it.
    interest += (principal * yearlyRate) / MONTHS_PER_YEAR;
    interest += ((month - 1) * monthlyContribution * yearlyRate) / MONTHS_PER_YEAR;
    deposited += monthlyContribution;

    if (month % MONTHS_PER_YEAR === 0 || month === termMonths) {
      rows.push({ balance: deposited + interest, deposited, interest, year: Math.ceil(month / MONTHS_PER_YEAR) });
    }
  }

  return {
    finalBalance: deposited + interest,
    ok: true,
    totalDeposited: deposited,
    totalInterest: interest,
    years: rows,
  };
}

/**
 * Calculates compound interest, where earned interest also earns interest. Interest is added
 * the chosen number of times a year, and any monthly amount is added at the end of each month.
 * The balance after whole years matches principal × (1 + rate / n) ^ (n × years).
 */
export function calculateCompoundInterest(input: InterestInput): InterestResult {
  const invalid = validate(input);

  if (invalid) {
    return invalid;
  }

  const { compoundsPerYear, monthlyContribution, principal, ratePercent, termMonths } = input;

  if (!COMPOUNDING_OPTIONS.some((option) => option.perYear === compoundsPerYear)) {
    return failure("Choose how often interest is added.");
  }

  // The growth of one month, equivalent to compounding the chosen number of times a year.
  const monthlyGrowth = (1 + ratePercent / PERCENT_FACTOR / compoundsPerYear) ** (compoundsPerYear / MONTHS_PER_YEAR);
  const rows: YearRow[] = [];
  let balance = principal;
  let deposited = principal;

  for (let month = 1; month <= termMonths; month += 1) {
    balance = balance * monthlyGrowth + monthlyContribution;
    deposited += monthlyContribution;

    if (month % MONTHS_PER_YEAR === 0 || month === termMonths) {
      rows.push({ balance, deposited, interest: balance - deposited, year: Math.ceil(month / MONTHS_PER_YEAR) });
    }
  }

  return { finalBalance: balance, ok: true, totalDeposited: deposited, totalInterest: balance - deposited, years: rows };
}
