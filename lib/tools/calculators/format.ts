/** The most digits an amount or percentage is shown with. */
const AMOUNT_DECIMALS = 2;
const PERCENT_MAX_DECIMALS = 2;

/**
 * Reads a number typed into a field, or null when the field is empty or not a number. The
 * fields keep their value as text so an empty box can be told apart from zero.
 */
export function parseDecimal(text: string): number | null {
  if (text.trim() === "") {
    return null;
  }

  const value = Number(text);

  return Number.isFinite(value) ? value : null;
}

/**
 * Shows an amount with thousands separators and two decimals, for example 1,234.50. It has no
 * currency symbol, because the tools do not assume a country.
 */
export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: AMOUNT_DECIMALS,
    minimumFractionDigits: AMOUNT_DECIMALS,
  });
}

/**
 * Shows a percentage with up to two decimals and no trailing zeros, for example 12.5%.
 */
export function formatPercent(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: PERCENT_MAX_DECIMALS })}%`;
}

/**
 * Shows a plain number with up to the given decimals and no trailing zeros.
 */
export function formatNumber(value: number, maxDecimals = PERCENT_MAX_DECIMALS): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}
