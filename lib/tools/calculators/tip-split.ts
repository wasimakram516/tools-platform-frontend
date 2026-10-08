import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const PERCENT_FACTOR = 100;
const MAX_BILL = 1e9;
const MAX_TIP_PERCENT = 100;
export const MAX_PEOPLE = 100;

export interface TipSplitInput {
  bill: number;
  people: number;
  /** Round each person's share up to a whole number, which raises the tip a little. */
  roundUpShare: boolean;
  tipPercent: number;
}

export interface TipSplitSuccess {
  ok: true;
  bill: number;
  perPerson: number;
  /** What the table pays in all. Higher than bill plus tip when shares are rounded up. */
  total: number;
  tip: number;
  /** The tip as a share of the bill, which is higher than asked when shares are rounded up. */
  effectiveTipPercent: number;
}

export type TipSplitResult = TipSplitSuccess | CalculationFailure;

/**
 * Works out the tip, the total, and each person's share of a bill. With round-up on, each
 * share goes up to the next whole number and the extra becomes part of the tip.
 */
export function calculateTipSplit(input: TipSplitInput): TipSplitResult {
  const { bill, people, roundUpShare, tipPercent } = input;

  if (![bill, people, tipPercent].every(Number.isFinite)) {
    return failure("Enter the bill, the tip, and the number of people.");
  }

  if (bill <= 0 || bill > MAX_BILL) {
    return failure("Enter a bill above zero.");
  }

  if (tipPercent < 0 || tipPercent > MAX_TIP_PERCENT) {
    return failure("The tip must be between 0% and 100%.");
  }

  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    return failure(`Enter a whole number of people from 1 to ${MAX_PEOPLE}.`);
  }

  const evenShare = (bill * (1 + tipPercent / PERCENT_FACTOR)) / people;
  const perPerson = roundUpShare ? Math.ceil(evenShare - 1e-9) : evenShare;
  const total = perPerson * people;
  const tip = total - bill;

  return { bill, effectiveTipPercent: (tip / bill) * PERCENT_FACTOR, ok: true, perPerson, tip, total };
}
