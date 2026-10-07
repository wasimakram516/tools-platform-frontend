import { type CalculationFailure, failure } from "@/lib/tools/dates/result";
import { pickOne, randomInt, secureUint32, shuffleInPlace, type Uint32Source } from "@/lib/tools/generators/random";
import { PASSPHRASE_WORDS } from "@/lib/tools/generators/word-list";

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_TOKEN_LENGTH = 8;
export const MAX_TOKEN_LENGTH = 256;
export const MIN_PASSPHRASE_WORDS = 3;
export const MAX_PASSPHRASE_WORDS = 12;
export const MAX_SEPARATOR_LENGTH = 3;
export const MIN_PIN_LENGTH = 3;
export const MAX_PIN_LENGTH = 12;
export const MAX_GENERATED = 50;

export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const DIGITS = "0123456789";
/** Symbols that are safe to paste into most forms and shells. Quotes, backslash, and space are left out. */
export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";
/** Characters that look alike in many fonts. */
export const AMBIGUOUS = "Il1|O0o";

const PIN_PATTERN_ATTEMPTS = 200;
const PASSWORD_MAX_EXCLUDED = 200;

export type TokenAlphabet = "hex" | "base62" | "base64url";

const TOKEN_ALPHABETS: Readonly<Record<TokenAlphabet, string>> = {
  base62: DIGITS + LOWERCASE + UPPERCASE,
  base64url: UPPERCASE + LOWERCASE + DIGITS + "-_",
  hex: DIGITS + "abcdef",
};

export interface PasswordOptions {
  digits: boolean;
  /** Characters to leave out, typed by the person. */
  excludeCharacters: string;
  /** Leave out characters that look alike, such as l, 1, I, O, and 0. */
  excludeAmbiguous: boolean;
  length: number;
  lowercase: boolean;
  /** Make sure every chosen kind of character appears at least once. */
  requireEachKind: boolean;
  symbols: boolean;
  uppercase: boolean;
}

export interface PassphraseOptions {
  capitalize: boolean;
  /** Add a number from 0 to 99 at the end. */
  includeNumber: boolean;
  separator: string;
  words: number;
}

export interface PinOptions {
  /** Refuse PINs such as 1111 and 1234. */
  avoidPatterns: boolean;
  length: number;
}

export interface TokenOptions {
  alphabet: TokenAlphabet;
  length: number;
}

export interface Generated {
  /** An estimate of how unpredictable each value is, in bits. Each extra bit doubles the guesses needed. */
  entropyBits: number;
  ok: true;
  values: string[];
}

export type GenerationResult = Generated | CalculationFailure;

/**
 * Rounds to one decimal place.
 */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Checks how many values were asked for.
 */
function checkCount(count: number): CalculationFailure | null {
  return Number.isInteger(count) && count >= 1 && count <= MAX_GENERATED
    ? null
    : failure(`Choose between 1 and ${MAX_GENERATED}.`);
}

/**
 * Builds the character groups for a password, after taking out the characters to leave out.
 */
function buildGroups(options: PasswordOptions): string[][] {
  const excluded = new Set(Array.from(options.excludeCharacters.slice(0, PASSWORD_MAX_EXCLUDED)));

  if (options.excludeAmbiguous) {
    Array.from(AMBIGUOUS).forEach((character) => excluded.add(character));
  }

  return [
    options.lowercase ? LOWERCASE : "",
    options.uppercase ? UPPERCASE : "",
    options.digits ? DIGITS : "",
    options.symbols ? SYMBOLS : "",
  ]
    .map((group) => Array.from(group).filter((character) => !excluded.has(character)))
    .filter((group) => group.length > 0);
}

/**
 * Makes random passwords from the chosen kinds of character, using the browser's secure
 * random numbers. With "require each kind", every chosen kind is guaranteed to appear.
 */
export function generatePasswords(
  options: PasswordOptions,
  count: number,
  source: Uint32Source = secureUint32,
): GenerationResult {
  const countProblem = checkCount(count);

  if (countProblem) {
    return countProblem;
  }

  if (!Number.isInteger(options.length) || options.length < MIN_PASSWORD_LENGTH || options.length > MAX_PASSWORD_LENGTH) {
    return failure(`Length must be a whole number from ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH}.`);
  }

  if (![options.lowercase, options.uppercase, options.digits, options.symbols].some(Boolean)) {
    return failure("Choose at least one kind of character.");
  }

  const groups = buildGroups(options);

  if (groups.length === 0) {
    return failure("Every character of the kinds you chose was excluded. Allow some back in.");
  }

  if (options.requireEachKind && options.length < groups.length) {
    return failure(`A password with one of each chosen kind needs a length of at least ${groups.length}.`);
  }

  const pool = groups.flat();
  const values = Array.from({ length: count }, () => {
    const characters: string[] = options.requireEachKind ? groups.map((group) => pickOne(group, source)) : [];

    while (characters.length < options.length) {
      characters.push(pickOne(pool, source));
    }

    return shuffleInPlace(characters, source).join("");
  });

  return { entropyBits: roundToTenth(options.length * Math.log2(pool.length)), ok: true, values };
}

/**
 * Makes random passphrases: words from the EFF short list, which are easy to type and remember.
 */
export function generatePassphrases(
  options: PassphraseOptions,
  count: number,
  source: Uint32Source = secureUint32,
): GenerationResult {
  const countProblem = checkCount(count);

  if (countProblem) {
    return countProblem;
  }

  if (!Number.isInteger(options.words) || options.words < MIN_PASSPHRASE_WORDS || options.words > MAX_PASSPHRASE_WORDS) {
    return failure(`Use between ${MIN_PASSPHRASE_WORDS} and ${MAX_PASSPHRASE_WORDS} words.`);
  }

  if (options.separator.length > MAX_SEPARATOR_LENGTH) {
    return failure(`The separator can be at most ${MAX_SEPARATOR_LENGTH} characters.`);
  }

  const values = Array.from({ length: count }, () => {
    const parts: string[] = Array.from({ length: options.words }, () => {
      const word = pickOne(PASSPHRASE_WORDS, source);

      return options.capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    });

    if (options.includeNumber) {
      parts.push(String(randomInt(100, source)));
    }

    return parts.join(options.separator);
  });
  const bits = options.words * Math.log2(PASSPHRASE_WORDS.length) + (options.includeNumber ? Math.log2(100) : 0);

  return { entropyBits: roundToTenth(bits), ok: true, values };
}

/**
 * Tells whether a PIN is an easy guess: every digit the same, or a run going up or down.
 */
export function isPatternedPin(pin: string): boolean {
  const digits = Array.from(pin, Number);
  const steps = digits.slice(1).map((digit, index) => digit - (digits[index] ?? 0));

  return steps.every((step) => step === 0) || steps.every((step) => step === 1) || steps.every((step) => step === -1);
}

/**
 * Makes random numeric PINs, optionally refusing obvious ones such as 1111 and 1234.
 */
export function generatePins(options: PinOptions, count: number, source: Uint32Source = secureUint32): GenerationResult {
  const countProblem = checkCount(count);

  if (countProblem) {
    return countProblem;
  }

  if (!Number.isInteger(options.length) || options.length < MIN_PIN_LENGTH || options.length > MAX_PIN_LENGTH) {
    return failure(`A PIN needs ${MIN_PIN_LENGTH} to ${MAX_PIN_LENGTH} digits.`);
  }

  const values: string[] = [];

  for (let made = 0; made < count; made += 1) {
    let pin = "";

    for (let attempt = 0; attempt < PIN_PATTERN_ATTEMPTS; attempt += 1) {
      pin = Array.from({ length: options.length }, () => String(randomInt(10, source))).join("");

      if (!options.avoidPatterns || !isPatternedPin(pin)) {
        break;
      }
    }

    if (options.avoidPatterns && isPatternedPin(pin)) {
      return failure("Could not make a PIN without an obvious pattern. Try again.");
    }

    values.push(pin);
  }

  return { entropyBits: roundToTenth(options.length * Math.log2(10)), ok: true, values };
}

/**
 * Makes random tokens, such as API keys and secrets, from hexadecimal, base 62, or URL-safe
 * base 64 characters.
 */
export function generateTokens(options: TokenOptions, count: number, source: Uint32Source = secureUint32): GenerationResult {
  const countProblem = checkCount(count);

  if (countProblem) {
    return countProblem;
  }

  if (!Number.isInteger(options.length) || options.length < MIN_TOKEN_LENGTH || options.length > MAX_TOKEN_LENGTH) {
    return failure(`A token needs ${MIN_TOKEN_LENGTH} to ${MAX_TOKEN_LENGTH} characters.`);
  }

  const alphabet = Array.from(TOKEN_ALPHABETS[options.alphabet]);
  const values = Array.from({ length: count }, () =>
    Array.from({ length: options.length }, () => pickOne(alphabet, source)).join(""),
  );

  return { entropyBits: roundToTenth(options.length * Math.log2(alphabet.length)), ok: true, values };
}

export interface Strength {
  label: string;
  /** How worried to look: "error" for weak, "warning" for fair, "success" for good and better. */
  tone: "error" | "warning" | "success";
}

/**
 * Describes how unpredictable a value is from its entropy. These bands are rules of thumb for
 * values chosen at random, not a promise about any attack.
 */
export function strengthOf(entropyBits: number): Strength {
  if (entropyBits < 40) {
    return { label: "Weak", tone: "error" };
  }

  if (entropyBits < 60) {
    return { label: "Fair", tone: "warning" };
  }

  if (entropyBits < 80) {
    return { label: "Good", tone: "success" };
  }

  return { label: entropyBits < 100 ? "Strong" : "Very strong", tone: "success" };
}
