import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

export const MIN_BASE = 2;
export const MAX_BASE = 36;
/** The most characters a number may have, which keeps the arithmetic quick. */
export const MAX_NUMBER_CHARACTERS = 10_000;
const MAX_TEXT_CHARACTERS = 100_000;
const BYTE_VALUES = 256;

/** The bases people ask for most, shown together. */
export const COMMON_BASES = [
  { base: 2, label: "Binary" },
  { base: 8, label: "Octal" },
  { base: 10, label: "Decimal" },
  { base: 16, label: "Hexadecimal" },
] as const;

/** The prefixes that mark a base, such as 0xFF for hexadecimal. */
const PREFIX_BASES: Readonly<Record<string, number>> = { "0b": 2, "0o": 8, "0x": 16 };

export type ParsedInteger = { ok: true; value: bigint } | CalculationFailure;

/**
 * Reads a whole number written in a base from 2 to 36, with digits 0-9 and then letters a-z.
 * A minus sign, spaces, and underscores between digits are allowed, and a prefix such as 0x is
 * accepted when it matches the base. The number can be as large as MAX_NUMBER_CHARACTERS digits.
 */
export function parseInteger(text: string, base: number): ParsedInteger {
  if (!Number.isInteger(base) || base < MIN_BASE || base > MAX_BASE) {
    return failure(`The base must be a whole number from ${MIN_BASE} to ${MAX_BASE}.`);
  }

  let cleaned = text.replace(/[\s_]/g, "").toLowerCase();

  if (cleaned === "") {
    return failure("Enter a number.");
  }

  if (cleaned.length > MAX_NUMBER_CHARACTERS) {
    return failure(`The number is limited to ${MAX_NUMBER_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  let negative = false;

  if (cleaned.startsWith("-") || cleaned.startsWith("+")) {
    negative = cleaned.startsWith("-");
    cleaned = cleaned.slice(1);
  }

  const prefix = cleaned.slice(0, 2);

  if (PREFIX_BASES[prefix] === base) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned === "") {
    return failure("Enter the digits of the number.");
  }

  let value = 0n;
  const bigBase = BigInt(base);

  for (const char of cleaned) {
    const digit = Number.parseInt(char, MAX_BASE);

    if (Number.isNaN(digit) || digit >= base) {
      return failure(`"${char}" is not a digit in base ${base}.`);
    }

    value = value * bigBase + BigInt(digit);
  }

  return { ok: true, value: negative ? -value : value };
}

/**
 * Writes a whole number in a base from 2 to 36, with capital letters for the digits above 9.
 */
export function formatInteger(value: bigint, base: number): string {
  return value.toString(base).toUpperCase();
}

/**
 * Splits digits into groups from the right, so long numbers are easier to read.
 */
export function groupDigits(digits: string, size: number, separator = " "): string {
  const negative = digits.startsWith("-");
  const body = negative ? digits.slice(1) : digits;
  const groups: string[] = [];

  for (let end = body.length; end > 0; end -= size) {
    groups.unshift(body.slice(Math.max(0, end - size), end));
  }

  return `${negative ? "-" : ""}${groups.join(separator)}`;
}

/**
 * Finds the number of bits needed to hold the size of a whole number, ignoring its sign.
 */
export function bitLength(value: bigint): number {
  const magnitude = value < 0n ? -value : value;

  return magnitude === 0n ? 1 : magnitude.toString(2).length;
}

export type ByteBase = 2 | 8 | 10 | 16;

/** How many digits make one byte in each base, so that every byte has the same width. */
const DIGITS_PER_BYTE: Readonly<Record<ByteBase, number>> = { 10: 3, 16: 2, 2: 8, 8: 3 };

export type TextResult = { ok: true; output: string } | CalculationFailure;

/**
 * Writes text as the bytes it is stored as (UTF-8), each one as a number in the chosen base. A
 * letter such as A is one byte, and a symbol such as the euro sign is three.
 */
export function textToBytes(text: string, base: ByteBase, separator: string, padded: boolean, uppercase: boolean): TextResult {
  if (text === "") {
    return failure("Enter some text.");
  }

  if (text.length > MAX_TEXT_CHARACTERS) {
    return failure(`The text is limited to ${MAX_TEXT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  const output = Array.from(new TextEncoder().encode(text))
    .map((byte) => {
      const digits = byte.toString(base);
      const shown = padded ? digits.padStart(DIGITS_PER_BYTE[base], "0") : digits;

      return uppercase ? shown.toUpperCase() : shown;
    })
    .join(separator);

  return { ok: true, output };
}

/**
 * Splits written bytes into separate numbers. Spaces, commas, and line breaks separate them. If
 * there are none, the digits are cut into equal groups, for example eight at a time for binary.
 */
function splitByteTokens(input: string, base: ByteBase): string[] | null {
  const tokens = input.trim().split(/[\s,;]+/).filter(Boolean);

  if (tokens.length > 1) {
    return tokens;
  }

  const only = tokens[0] ?? "";
  const width = DIGITS_PER_BYTE[base];

  if (base === 10) {
    return only === "" ? [] : [only];
  }

  const plain = only.replace(/^0[xbo]/i, "");

  if (plain.length % width !== 0) {
    return null;
  }

  return plain.match(new RegExp(`.{${width}}`, "g")) ?? [];
}

/**
 * Reads bytes written as numbers in a base back into text. The bytes must be valid UTF-8, which
 * is what the other direction writes.
 */
export function bytesToText(input: string, base: ByteBase): TextResult {
  if (input.trim() === "") {
    return failure("Enter the bytes to turn into text.");
  }

  if (input.length > MAX_TEXT_CHARACTERS * 4) {
    return failure("The input is too long.");
  }

  const tokens = splitByteTokens(input, base);

  if (tokens === null) {
    return failure(
      `Separate the bytes with spaces, or write them with ${DIGITS_PER_BYTE[base]} digits each so they can be split.`,
    );
  }

  const bytes: number[] = [];

  for (const token of tokens) {
    const parsed = parseInteger(token, base);

    if (!parsed.ok) {
      return parsed;
    }

    if (parsed.value < 0n || parsed.value >= BigInt(BYTE_VALUES)) {
      return failure(`"${token}" is not a byte. Each byte must be from 0 to 255.`);
    }

    bytes.push(Number(parsed.value));
  }

  try {
    return { ok: true, output: new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes)) };
  } catch {
    return failure("These bytes are not valid UTF-8 text, so they cannot be shown as characters.");
  }
}

const ROMAN_PAIRS: readonly (readonly [number, string])[] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export const MAX_ROMAN = 3999;
/** Roman numerals in their standard form: each symbol repeated at most three times. */
const ROMAN_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/**
 * Writes a whole number from 1 to 3999 as a Roman numeral.
 */
export function toRoman(number: number): TextResult {
  if (!Number.isInteger(number) || number < 1 || number > MAX_ROMAN) {
    return failure(`Roman numerals in their standard form cover whole numbers from 1 to ${MAX_ROMAN}.`);
  }

  let remaining = number;
  let output = "";

  for (const [value, symbol] of ROMAN_PAIRS) {
    while (remaining >= value) {
      output += symbol;
      remaining -= value;
    }
  }

  return { ok: true, output };
}

/**
 * Reads a Roman numeral in its standard form, in capitals or lower case. Forms that are not
 * standard, such as IIII or IC, are rejected and not guessed at.
 */
export function fromRoman(text: string): { ok: true; value: number } | CalculationFailure {
  const numeral = text.trim().toUpperCase();

  if (numeral === "") {
    return failure("Enter a Roman numeral.");
  }

  if (!/^[MDCLXVI]+$/.test(numeral)) {
    return failure("A Roman numeral uses only the letters M, D, C, L, X, V, and I.");
  }

  if (!ROMAN_PATTERN.test(numeral)) {
    return failure(`"${numeral}" is not a standard Roman numeral. Check the order and repeats, for example IV, not IIII.`);
  }

  let remaining = numeral;
  let value = 0;

  for (const [amount, symbol] of ROMAN_PAIRS) {
    while (remaining.startsWith(symbol)) {
      value += amount;
      remaining = remaining.slice(symbol.length);
    }
  }

  return { ok: true, value };
}
