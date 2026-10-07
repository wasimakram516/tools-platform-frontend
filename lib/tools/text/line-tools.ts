const LINE_BREAK = /\r\n|\r|\n/u;
const MAX_REPEATED_LINES = 10;

export type SortOrder = "ascending" | "descending" | "shortest" | "longest" | "reverse" | "shuffle";

export interface SortOptions {
  caseSensitive: boolean;
  /** Sort "item 2" before "item 10" by reading digits as numbers. */
  naturalNumbers: boolean;
  order: SortOrder;
  /** Drop repeated lines, keeping the first of each, before sorting. */
  removeDuplicates: boolean;
  removeEmptyLines: boolean;
  /** Remove spaces at both ends of every line first. */
  trimLines: boolean;
}

export type DuplicateMode = "remove" | "uniqueOnly" | "duplicatesOnly";

export interface DuplicateOptions {
  caseSensitive: boolean;
  mode: DuplicateMode;
  removeEmptyLines: boolean;
  /** Treat lines that differ only by spaces at the ends as the same line. */
  trimWhitespace: boolean;
}

export interface SortResult {
  lines: number;
  output: string;
}

export interface RepeatedLine {
  count: number;
  line: string;
}

export interface DuplicateResult {
  kept: number;
  output: string;
  removed: number;
  /** The lines that appear more than once, most repeated first. */
  repeated: RepeatedLine[];
}

/** Returns a random number from 0 up to but not including 1. */
export type RandomSource = () => number;

/**
 * A small repeatable random source: the same seed always gives the same sequence. A tool keeps
 * one seed in state so a shuffle stays put until the person asks for a new one.
 */
export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;

    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
}

/**
 * Picks a fresh seed from the browser's secure generator.
 */
export function newShuffleSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

/**
 * Random numbers from the browser's secure generator, so a shuffle has no pattern.
 */
function secureRandom(): number {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));

  return value / 2 ** 32;
}

/**
 * Splits text into lines, treating a final line break as the end of the last line.
 */
export function splitLines(text: string): string[] {
  if (text === "") {
    return [];
  }

  const lines = text.split(LINE_BREAK);

  return lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
}

/**
 * Builds the value two lines are compared by, so case and end spaces can be ignored.
 */
function keyFor(line: string, caseSensitive: boolean, trim: boolean): string {
  const value = trim ? line.trim() : line;

  return caseSensitive ? value : value.toLowerCase();
}

/**
 * Shuffles lines into a random order without bias (Fisher-Yates).
 */
function shuffle(lines: readonly string[], random: RandomSource): string[] {
  const result = [...lines];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    const held = result[index] ?? "";

    result[index] = result[swapWith] ?? "";
    result[swapWith] = held;
  }

  return result;
}

/**
 * Puts lines in order: alphabetical either way, by length, reversed, or shuffled. Alphabetical
 * sorting is stable, and accented letters sort with their base letter instead of after Z.
 */
export function sortLines(text: string, options: SortOptions, random: RandomSource = secureRandom): SortResult {
  const collator = new Intl.Collator(undefined, {
    numeric: options.naturalNumbers,
    sensitivity: options.caseSensitive ? "variant" : "base",
  });
  const seen = new Set<string>();
  const lines = splitLines(text)
    .map((line) => (options.trimLines ? line.trim() : line))
    .filter((line) => !options.removeEmptyLines || line.trim() !== "")
    .filter((line) => {
      if (!options.removeDuplicates) {
        return true;
      }

      const key = keyFor(line, options.caseSensitive, true);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  let sorted: string[];

  switch (options.order) {
    case "ascending":
      sorted = [...lines].sort((a, b) => collator.compare(a, b));
      break;
    case "descending":
      sorted = [...lines].sort((a, b) => collator.compare(b, a));
      break;
    case "shortest":
      sorted = [...lines].sort((a, b) => a.length - b.length || collator.compare(a, b));
      break;
    case "longest":
      sorted = [...lines].sort((a, b) => b.length - a.length || collator.compare(a, b));
      break;
    case "reverse":
      sorted = [...lines].reverse();
      break;
    case "shuffle":
      sorted = shuffle(lines, random);
      break;
  }

  return { lines: sorted.length, output: sorted.join("\n") };
}

/**
 * Finds repeated lines. Depending on the mode it removes the repeats (keeping the first of
 * each line, in the original order), keeps only the lines that appear once, or keeps one copy
 * of each line that appears more than once. It also reports which lines repeat most.
 */
export function removeDuplicateLines(text: string, options: DuplicateOptions): DuplicateResult {
  const allLines = splitLines(text);
  const lines = allLines.filter((line) => !options.removeEmptyLines || line.trim() !== "");
  const groups = new Map<string, { count: number; first: string }>();

  for (const line of lines) {
    const key = keyFor(line, options.caseSensitive, options.trimWhitespace);
    const group = groups.get(key);

    if (group) {
      group.count += 1;
    } else {
      groups.set(key, { count: 1, first: line });
    }
  }

  const emitted = new Set<string>();
  const kept: string[] = [];

  for (const line of lines) {
    const key = keyFor(line, options.caseSensitive, options.trimWhitespace);
    const count = groups.get(key)?.count ?? 1;
    const wanted =
      options.mode === "uniqueOnly" ? count === 1 : options.mode === "duplicatesOnly" ? count > 1 : true;

    if (wanted && !emitted.has(key)) {
      emitted.add(key);
      kept.push(line);
    }
  }

  const repeated = [...groups.values()]
    .filter((group) => group.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_REPEATED_LINES)
    .map((group) => ({ count: group.count, line: group.first }));

  return { kept: kept.length, output: kept.join("\n"), removed: allLines.length - kept.length, repeated };
}
