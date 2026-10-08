import { formatAmount, formatNumber, formatPercent, parseDecimal } from "@/lib/tools/calculators/format";
import {
  adjustByPercent,
  applyDiscount,
  marginFromCostAndPrice,
  percentChange,
  percentOf,
  priceFromMargin,
  priceFromMarkup,
  whatPercent,
  type Direction,
  type MarginSuccess,
} from "@/lib/tools/calculators/percentage";

export type PercentageMode = "percentOf" | "whatPercent" | "change" | "adjust" | "discount" | "margin";
export type MarginMode = "fromPrice" | "fromMarkup" | "fromMargin";

/** How many decimals a plain result shows, so 100 / 3 reads as 33.3333. */
const RESULT_DECIMALS = 4;

export interface ModeFields {
  firstLabel: string;
  firstSuffix?: string;
  secondLabel: string;
  secondSuffix?: string;
}

export interface PercentageSummary {
  headline: string;
  rows: { label: string; value: string }[];
}

export type PercentageOutcome = PercentageSummary | { message: string } | null;

export const PERCENTAGE_MODE_OPTIONS: readonly { label: string; value: PercentageMode }[] = [
  { label: "What is X% of a number?", value: "percentOf" },
  { label: "X is what % of a number?", value: "whatPercent" },
  { label: "Percentage change from one number to another", value: "change" },
  { label: "Increase or decrease a number by a percentage", value: "adjust" },
  { label: "Discount and sale price", value: "discount" },
  { label: "Margin and markup", value: "margin" },
];

export const MARGIN_MODE_OPTIONS: readonly { label: string; value: MarginMode }[] = [
  { label: "I know the cost and the selling price", value: "fromPrice" },
  { label: "I want a markup on the cost", value: "fromMarkup" },
  { label: "I want a margin on the price", value: "fromMargin" },
];

/**
 * The two input labels for the chosen mode.
 */
export function fieldsFor(mode: PercentageMode, marginMode: MarginMode): ModeFields {
  switch (mode) {
    case "percentOf":
      return { firstLabel: "Percentage", firstSuffix: "%", secondLabel: "Of this number" };
    case "whatPercent":
      return { firstLabel: "Number", secondLabel: "Out of" };
    case "change":
      return { firstLabel: "From", secondLabel: "To" };
    case "adjust":
      return { firstLabel: "Number", secondLabel: "Percentage", secondSuffix: "%" };
    case "discount":
      return { firstLabel: "Original price", secondLabel: "Discount", secondSuffix: "%" };
    case "margin":
      return marginMode === "fromPrice"
        ? { firstLabel: "Cost", secondLabel: "Selling price" }
        : { firstLabel: "Cost", secondLabel: marginMode === "fromMarkup" ? "Markup" : "Margin", secondSuffix: "%" };
  }
}

/**
 * Describes a profit result, leading with the figure the person asked for.
 */
function marginSummary(result: MarginSuccess, lead: "price" | "margin"): PercentageSummary {
  const price = { label: "Selling price", value: formatAmount(result.price) };
  const margin = { label: "Margin (profit as a share of the price)", value: formatPercent(result.marginPercent) };
  const markup = { label: "Markup (profit as a share of the cost)", value: formatPercent(result.markupPercent) };
  const profit = { label: "Profit", value: formatAmount(result.profit) };

  return lead === "price"
    ? { headline: `Selling price: ${formatAmount(result.price)}`, rows: [profit, margin, markup] }
    : { headline: `Margin: ${formatPercent(result.marginPercent)}`, rows: [markup, profit, price] };
}

/**
 * Works out the answer for the chosen mode from the two typed values. It returns null while a
 * field is still empty, so the page shows its waiting message rather than an error.
 */
export function summarizePercentage(
  mode: PercentageMode,
  firstText: string,
  secondText: string,
  options: { direction: Exclude<Direction, "none">; marginMode: MarginMode },
): PercentageOutcome {
  const first = parseDecimal(firstText);
  const second = parseDecimal(secondText);

  if (first === null || second === null) {
    return null;
  }

  const num = (value: number): string => formatNumber(value, RESULT_DECIMALS);

  switch (mode) {
    case "percentOf": {
      const result = percentOf(first, second);

      return result.ok
        ? { headline: `${num(first)}% of ${num(second)} is ${num(result.result)}`, rows: [] }
        : { message: result.message };
    }
    case "whatPercent": {
      const result = whatPercent(first, second);

      return result.ok
        ? { headline: `${num(first)} is ${num(result.percent)}% of ${num(second)}`, rows: [] }
        : { message: result.message };
    }
    case "change": {
      const result = percentChange(first, second);

      if (!result.ok) {
        return { message: result.message };
      }

      return {
        headline:
          result.direction === "none"
            ? "No change"
            : `${num(result.percent)}% ${result.direction}`,
        rows: [
          { label: "From", value: num(first) },
          { label: "To", value: num(second) },
          { label: "Difference", value: num(result.difference) },
        ],
      };
    }
    case "adjust": {
      const result = adjustByPercent(first, second, options.direction);

      if (!result.ok) {
        return { message: result.message };
      }

      const sign = options.direction === "increase" ? "+" : "-";

      return {
        headline: `${num(first)} ${sign} ${num(second)}% = ${num(result.result)}`,
        rows: [{ label: options.direction === "increase" ? "Amount added" : "Amount taken off", value: num(result.change) }],
      };
    }
    case "discount": {
      const result = applyDiscount(first, second);

      return result.ok
        ? {
            headline: `Sale price: ${formatAmount(result.finalPrice)}`,
            rows: [
              { label: "Original price", value: formatAmount(first) },
              { label: "You save", value: formatAmount(result.saved) },
            ],
          }
        : { message: result.message };
    }
    case "margin": {
      const result =
        options.marginMode === "fromPrice"
          ? marginFromCostAndPrice(first, second)
          : options.marginMode === "fromMarkup"
            ? priceFromMarkup(first, second)
            : priceFromMargin(first, second);

      return result.ok
        ? marginSummary(result, options.marginMode === "fromPrice" ? "margin" : "price")
        : { message: result.message };
    }
  }
}
