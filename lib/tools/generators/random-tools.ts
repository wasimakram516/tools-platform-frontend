import { type CalculationFailure, failure } from "@/lib/tools/dates/result";
import { randomInt, secureUint32, shuffleInPlace, type Uint32Source } from "@/lib/tools/generators/random";

export const MAX_NUMBERS = 1000;
export const MAX_DICE = 100;
export const MAX_SIDES = 1000;
export const MAX_COINS = 1000;
export const MAX_LIST_ITEMS = 5000;
export const MAX_DECIMALS = 8;
/** Keeps every range inside what a JavaScript number can count exactly. */
export const MAX_RANGE_MAGNITUDE = 1e15;
/** Up to this many choices, unique picks are made by shuffling the whole range. */
const SHUFFLE_RANGE_LIMIT = 100_000;
const TWO_POW_32 = 2 ** 32;
const TWO_POW_53 = 2 ** 53;

export type NumberSort = "none" | "ascending" | "descending";

export interface NumberOptions {
  count: number;
  /** Digits after the decimal point; 0 makes whole numbers. */
  decimals: number;
  max: number;
  min: number;
  sort: NumberSort;
  /** No number appears twice. */
  unique: boolean;
}

export interface NumberSummary {
  average: number;
  largest: number;
  smallest: number;
  sum: number;
}

export type NumbersResult =
  | { ok: true; summary: NumberSummary; values: string[] }
  | CalculationFailure;

/**
 * Picks a whole number from an inclusive range with every number equally likely. Ranges that fit
 * in 32 bits use one draw; wider ranges (up to 2^53) combine two draws and throw away the unfair tail.
 */
export function randomIntBetween(min: number, max: number, source: Uint32Source = secureUint32): number {
  const range = max - min + 1;

  if (range <= TWO_POW_32) {
    return min + randomInt(range, source);
  }

  const fairLimit = Math.floor(TWO_POW_53 / range) * range;
  let value = (source() >>> 11) * TWO_POW_32 + source();

  while (value >= fairLimit) {
    value = (source() >>> 11) * TWO_POW_32 + source();
  }

  return min + (value % range);
}

/**
 * Picks the given number of different whole numbers from an inclusive range. Small ranges are
 * shuffled; large ranges draw again on a repeat, which is rare when there are so many choices.
 */
function uniqueIntegers(min: number, max: number, count: number, source: Uint32Source): number[] {
  const range = max - min + 1;

  if (range <= SHUFFLE_RANGE_LIMIT) {
    const all = Array.from({ length: range }, (_, offset) => min + offset);

    for (let index = 0; index < count; index += 1) {
      const swapWith = index + randomInt(range - index, source);
      const held = all[index] as number;

      all[index] = all[swapWith] as number;
      all[swapWith] = held;
    }

    return all.slice(0, count);
  }

  const seen = new Set<number>();

  while (seen.size < count) {
    seen.add(randomIntBetween(min, max, source));
  }

  return [...seen];
}

/**
 * Makes random numbers in a range, as whole numbers or with decimal places, optionally all
 * different and sorted, with their sum and average.
 */
export function generateNumbers(options: NumberOptions, source: Uint32Source = secureUint32): NumbersResult {
  const { count, decimals, max, min, sort, unique } = options;

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return failure("Enter a smallest and a largest number.");
  }

  if (Math.abs(min) > MAX_RANGE_MAGNITUDE || Math.abs(max) > MAX_RANGE_MAGNITUDE) {
    return failure("Numbers can be up to 1,000,000,000,000,000 in either direction.");
  }

  if (min > max) {
    return failure("The smallest number is larger than the largest. Swap them.");
  }

  if (!Number.isInteger(count) || count < 1 || count > MAX_NUMBERS) {
    return failure(`Choose between 1 and ${MAX_NUMBERS.toLocaleString("en-US")} numbers.`);
  }

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_DECIMALS) {
    return failure(`Decimal places must be from 0 to ${MAX_DECIMALS}.`);
  }

  const factor = 10 ** decimals;
  const low = Math.ceil(min * factor);
  const high = Math.floor(max * factor);

  if (Math.max(Math.abs(low), Math.abs(high)) > MAX_RANGE_MAGNITUDE) {
    return failure("That range with that many decimal places is too large. Use fewer decimal places.");
  }

  if (low > high) {
    return failure("No number with that many decimal places fits between the smallest and the largest.");
  }

  const choices = high - low + 1;

  if (unique && count > choices) {
    return failure(`There are only ${choices.toLocaleString("en-US")} different numbers in that range, so ${count.toLocaleString("en-US")} different ones cannot be picked.`);
  }

  const scaled = unique
    ? uniqueIntegers(low, high, count, source)
    : Array.from({ length: count }, () => randomIntBetween(low, high, source));

  if (sort !== "none") {
    scaled.sort((a, b) => (sort === "ascending" ? a - b : b - a));
  }

  const numbers = scaled.map((value) => value / factor);
  const sum = numbers.reduce((total, value) => total + value, 0);

  return {
    ok: true,
    summary: {
      average: sum / numbers.length,
      largest: Math.max(...numbers),
      smallest: Math.min(...numbers),
      sum,
    },
    values: numbers.map((value) => value.toFixed(decimals)),
  };
}

export interface DiceOptions {
  count: number;
  /** Added to the total, for rules such as "roll a d20 and add 3". */
  modifier: number;
  sides: number;
}

export type DiceResult = { ok: true; rolls: number[]; total: number } | CalculationFailure;

/**
 * Rolls dice, each with the same number of sides, and totals them with an optional modifier.
 */
export function rollDice(options: DiceOptions, source: Uint32Source = secureUint32): DiceResult {
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > MAX_DICE) {
    return failure(`Roll between 1 and ${MAX_DICE} dice.`);
  }

  if (!Number.isInteger(options.sides) || options.sides < 2 || options.sides > MAX_SIDES) {
    return failure(`A die has between 2 and ${MAX_SIDES.toLocaleString("en-US")} sides.`);
  }

  if (!Number.isInteger(options.modifier) || Math.abs(options.modifier) > MAX_SIDES * MAX_DICE) {
    return failure("The modifier must be a whole number.");
  }

  const rolls = Array.from({ length: options.count }, () => 1 + randomInt(options.sides, source));

  return { ok: true, rolls, total: rolls.reduce((sum, roll) => sum + roll, 0) + options.modifier };
}

export type CoinSide = "Heads" | "Tails";

export type CoinResult = { flips: CoinSide[]; heads: number; ok: true; tails: number } | CalculationFailure;

/**
 * Flips fair coins.
 */
export function flipCoins(count: number, source: Uint32Source = secureUint32): CoinResult {
  if (!Number.isInteger(count) || count < 1 || count > MAX_COINS) {
    return failure(`Flip between 1 and ${MAX_COINS.toLocaleString("en-US")} coins.`);
  }

  const flips = Array.from({ length: count }, (): CoinSide => (randomInt(2, source) === 0 ? "Heads" : "Tails"));
  const heads = flips.filter((side) => side === "Heads").length;

  return { flips, heads, ok: true, tails: count - heads };
}

export interface ListOptions {
  /** Treat lines that differ only in capitals or end spaces as one entry. */
  removeDuplicates: boolean;
}

export type ListResult = { items: string[]; ok: true } | CalculationFailure;

/**
 * Turns lines of text into a clean list: ends trimmed, empty lines dropped, and optionally
 * repeats removed (keeping the first).
 */
export function parseList(text: string, { removeDuplicates }: ListOptions): string[] {
  const seen = new Set<string>();

  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (line === "") {
        return false;
      }

      if (!removeDuplicates) {
        return true;
      }

      const key = line.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

/**
 * Checks that a list has something in it and is not unreasonably long.
 */
function checkList(items: readonly string[]): CalculationFailure | null {
  if (items.length === 0) {
    return failure("Add at least one item, one per line.");
  }

  return items.length > MAX_LIST_ITEMS ? failure(`Lists can have up to ${MAX_LIST_ITEMS.toLocaleString("en-US")} items.`) : null;
}

/**
 * Picks winners from a list: the given number of different items, each equally likely.
 */
export function pickFromList(items: readonly string[], count: number, source: Uint32Source = secureUint32): ListResult {
  const problem = checkList(items);

  if (problem) {
    return problem;
  }

  if (!Number.isInteger(count) || count < 1 || count > items.length) {
    return failure(`Choose between 1 and ${items.length.toLocaleString("en-US")}, the number of items.`);
  }

  return { items: shuffleInPlace([...items], source).slice(0, count), ok: true };
}

/**
 * Puts a list in a random order.
 */
export function shuffleList(items: readonly string[], source: Uint32Source = secureUint32): ListResult {
  const problem = checkList(items);

  return problem ?? { items: shuffleInPlace([...items], source), ok: true };
}

export type TeamSplit = { by: "teams"; teams: number } | { by: "size"; size: number };

export type TeamsResult = { ok: true; teams: string[][] } | CalculationFailure;

/**
 * Splits a list into fair teams. People are shuffled and dealt out one at a time, so team sizes
 * never differ by more than one. Split by a number of teams, or by the biggest team size wanted.
 */
export function splitIntoTeams(items: readonly string[], split: TeamSplit, source: Uint32Source = secureUint32): TeamsResult {
  const problem = checkList(items);

  if (problem) {
    return problem;
  }

  const teamCount = split.by === "teams" ? split.teams : Math.ceil(items.length / split.size);

  if (split.by === "size" && (!Number.isInteger(split.size) || split.size < 1)) {
    return failure("A team needs at least 1 person.");
  }

  if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > items.length) {
    return failure(`Choose between 2 and ${items.length.toLocaleString("en-US")} teams for ${items.length.toLocaleString("en-US")} people.`);
  }

  const teams: string[][] = Array.from({ length: teamCount }, () => []);

  shuffleInPlace([...items], source).forEach((person, index) => teams[index % teamCount]?.push(person));

  return { ok: true, teams };
}
