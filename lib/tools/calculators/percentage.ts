import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

/** Large enough for any real amount, small enough that the arithmetic stays exact enough. */
export const MAX_VALUE = 1e12;

const PERCENT_FACTOR = 100;

export type Direction = "increase" | "decrease" | "none";

export interface PercentOfSuccess {
  ok: true;
  /** The percentage of the value, for example 15% of 200 is 30. */
  result: number;
}

export interface WhatPercentSuccess {
  ok: true;
  percent: number;
}

export interface PercentChangeSuccess {
  ok: true;
  direction: Direction;
  /** Always positive; the direction says which way it moved. */
  difference: number;
  percent: number;
}

export interface AdjustSuccess {
  ok: true;
  change: number;
  result: number;
}

export interface DiscountSuccess {
  ok: true;
  finalPrice: number;
  saved: number;
}

export interface MarginSuccess {
  ok: true;
  cost: number;
  /** Profit as a share of the cost. */
  markupPercent: number;
  /** Profit as a share of the selling price. */
  marginPercent: number;
  price: number;
  profit: number;
}

type Outcome<Success> = Success | CalculationFailure;

/**
 * Checks that a value is a usable number inside the supported range.
 */
function isUsable(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= MAX_VALUE;
}

/**
 * Finds a percentage of a value, for example 15% of 200.
 */
export function percentOf(percent: number, value: number): Outcome<PercentOfSuccess> {
  if (!isUsable(percent) || !isUsable(value)) {
    return failure("Enter numbers below one trillion.");
  }

  return { ok: true, result: (value * percent) / PERCENT_FACTOR };
}

/**
 * Finds what percentage one number is of another, for example 30 is 15% of 200.
 */
export function whatPercent(part: number, whole: number): Outcome<WhatPercentSuccess> {
  if (!isUsable(part) || !isUsable(whole)) {
    return failure("Enter numbers below one trillion.");
  }

  if (whole === 0) {
    return failure("The whole cannot be zero, because a share of nothing is not defined.");
  }

  return { ok: true, percent: (part / whole) * PERCENT_FACTOR };
}

/**
 * Finds the percentage change from one value to another. The change is measured against the
 * starting value, so going from 50 to 75 is a 50% increase.
 */
export function percentChange(from: number, to: number): Outcome<PercentChangeSuccess> {
  if (!isUsable(from) || !isUsable(to)) {
    return failure("Enter numbers below one trillion.");
  }

  if (from === 0) {
    return failure("The starting value cannot be zero, because a change from nothing has no percentage.");
  }

  const difference = to - from;

  return {
    difference: Math.abs(difference),
    direction: difference > 0 ? "increase" : difference < 0 ? "decrease" : "none",
    ok: true,
    percent: (Math.abs(difference) / Math.abs(from)) * PERCENT_FACTOR,
  };
}

/**
 * Raises or lowers a value by a percentage, for example 200 plus 15% is 230.
 */
export function adjustByPercent(
  value: number,
  percent: number,
  direction: Exclude<Direction, "none">,
): Outcome<AdjustSuccess> {
  if (!isUsable(value) || !isUsable(percent)) {
    return failure("Enter numbers below one trillion.");
  }

  const change = (value * percent) / PERCENT_FACTOR;

  return { change, ok: true, result: direction === "increase" ? value + change : value - change };
}

/**
 * Takes a percentage off a price, for example 20% off 80 is 64.
 */
export function applyDiscount(price: number, discountPercent: number): Outcome<DiscountSuccess> {
  if (!isUsable(price) || !isUsable(discountPercent)) {
    return failure("Enter numbers below one trillion.");
  }

  if (price < 0) {
    return failure("The price cannot be negative.");
  }

  if (discountPercent < 0 || discountPercent > PERCENT_FACTOR) {
    return failure("A discount must be between 0% and 100%.");
  }

  const saved = (price * discountPercent) / PERCENT_FACTOR;

  return { finalPrice: price - saved, ok: true, saved };
}

/**
 * Works out profit, markup, and margin from a cost and a selling price. Markup is profit over
 * cost; margin is profit over price. They are different numbers, and people often mix them up.
 */
export function marginFromCostAndPrice(cost: number, price: number): Outcome<MarginSuccess> {
  if (!isUsable(cost) || !isUsable(price)) {
    return failure("Enter numbers below one trillion.");
  }

  if (cost <= 0) {
    return failure("The cost must be more than zero.");
  }

  if (price <= 0) {
    return failure("The selling price must be more than zero.");
  }

  const profit = price - cost;

  return {
    cost,
    marginPercent: (profit / price) * PERCENT_FACTOR,
    markupPercent: (profit / cost) * PERCENT_FACTOR,
    ok: true,
    price,
    profit,
  };
}

/**
 * Finds the selling price that gives a target markup over the cost.
 */
export function priceFromMarkup(cost: number, markupPercent: number): Outcome<MarginSuccess> {
  if (!isUsable(cost) || !isUsable(markupPercent)) {
    return failure("Enter numbers below one trillion.");
  }

  if (cost <= 0) {
    return failure("The cost must be more than zero.");
  }

  if (markupPercent <= -PERCENT_FACTOR) {
    return failure("A markup of -100% or less would make the price zero or negative.");
  }

  return marginFromCostAndPrice(cost, cost * (1 + markupPercent / PERCENT_FACTOR));
}

/**
 * Finds the selling price that gives a target margin, meaning a share of the price.
 */
export function priceFromMargin(cost: number, marginPercent: number): Outcome<MarginSuccess> {
  if (!isUsable(cost) || !isUsable(marginPercent)) {
    return failure("Enter numbers below one trillion.");
  }

  if (cost <= 0) {
    return failure("The cost must be more than zero.");
  }

  if (marginPercent >= PERCENT_FACTOR) {
    return failure("A margin must be below 100%, because the cost is part of the price.");
  }

  return marginFromCostAndPrice(cost, cost / (1 - marginPercent / PERCENT_FACTOR));
}
