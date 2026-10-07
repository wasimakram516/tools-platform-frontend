/**
 * Every style the converter offers. `example` is what the sample sentence
 * "The quick brown fox" becomes, so the list documents itself and a test keeps it honest.
 */
export const CASE_STYLES = [
  { example: "THE QUICK BROWN FOX", label: "UPPER CASE", value: "upper" },
  { example: "the quick brown fox", label: "lower case", value: "lower" },
  { example: "The Quick Brown Fox", label: "Title Case", value: "title" },
  { example: "The Quick Brown Fox", label: "Capitalize Each Word", value: "capitalized" },
  { example: "The quick brown fox", label: "Sentence case", value: "sentence" },
  { example: "tHe QuIcK bRoWn FoX", label: "aLtErNaTiNg", value: "alternating" },
  { example: "tHE QUICK BROWN FOX", label: "iNVERTED", value: "inverse" },
  { example: "theQuickBrownFox", label: "camelCase", value: "camel" },
  { example: "TheQuickBrownFox", label: "PascalCase", value: "pascal" },
  { example: "the_quick_brown_fox", label: "snake_case", value: "snake" },
  { example: "the-quick-brown-fox", label: "kebab-case", value: "kebab" },
  { example: "THE_QUICK_BROWN_FOX", label: "CONSTANT_CASE", value: "constant" },
  { example: "the.quick.brown.fox", label: "dot.case", value: "dot" },
  { example: "The-Quick-Brown-Fox", label: "Train-Case", value: "train" },
  { example: "the-quick-brown-fox", label: "URL slug", value: "slug" },
  { example: "The quick brown fox", label: "Tidy spacing", value: "tidy" },
] as const;

export type CaseStyle = (typeof CASE_STYLES)[number]["value"];

/** The sentence used for the example next to each style. */
export const CASE_SAMPLE = "The quick brown fox";

/** Short words that stay lower case inside a title, unless they open it. */
const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet",
]);

const WORD_PATTERN = /[\p{L}\p{N}][\p{L}\p{N}'’]*/gu;
const SENTENCE_START = /(^\s*|[.!?…]\s+|\n\s*)(\p{L})/gu;

/**
 * Capitalises the first letter of a word and lowers the rest.
 */
function capitalize(word: string): string {
  const [first = "", ...rest] = Array.from(word);

  return first.toUpperCase() + rest.join("").toLowerCase();
}

/**
 * Writes every word with a capital, except small words such as "of" and "the" after the first.
 */
function toTitleCase(text: string): string {
  let wordIndex = 0;

  return text.replace(WORD_PATTERN, (word) => {
    const lower = word.toLowerCase();
    const isFirst = wordIndex === 0;

    wordIndex += 1;

    return !isFirst && SMALL_WORDS.has(lower) ? lower : capitalize(word);
  });
}

/**
 * Lowers everything, then capitalises the first letter of each sentence and line.
 */
function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(SENTENCE_START, (_match, boundary: string, letter: string) => boundary + letter.toUpperCase());
}

/**
 * Alternates lower and upper case from letter to letter, starting lower, and skips anything
 * that is not a letter.
 */
function toAlternatingCase(text: string): string {
  let letterIndex = 0;

  return Array.from(text, (character) => {
    if (!/\p{L}/u.test(character)) {
      return character;
    }

    const converted = letterIndex % 2 === 0 ? character.toLowerCase() : character.toUpperCase();

    letterIndex += 1;

    return converted;
  }).join("");
}

/**
 * Swaps every letter's case: capitals become lower case and the reverse.
 */
function toInvertedCase(text: string): string {
  return Array.from(text, (character) =>
    character === character.toUpperCase() ? character.toLowerCase() : character.toUpperCase(),
  ).join("");
}

/**
 * Splits a line into its words, whether it is spaced, snake_case, kebab-case, or camelCase.
 */
function splitIntoWords(line: string): string[] {
  return line
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Applies an identifier style to each line on its own, so a list of names stays a list.
 */
function toIdentifierCase(text: string, join: (words: string[]) => string): string {
  return text
    .split("\n")
    .map((line) => join(splitIntoWords(line)))
    .join("\n");
}

/**
 * Makes a URL-friendly slug: accents removed, lower case, words joined by hyphens. Unlike
 * kebab-case it does not split camelCase, so "iPhone Case" becomes "iphone-case".
 */
function toSlug(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .normalize("NFD")
        .replace(/\p{M}+/gu, "")
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
        .join("-"),
    )
    .join("\n");
}

/**
 * Cleans up spacing: trims each line, collapses runs of spaces and tabs, and turns three or
 * more line breaks into one blank line.
 */
function tidySpacing(text: string): string {
  return text
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/gu, " ").trim())
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

const CONVERTERS: Readonly<Record<CaseStyle, (text: string) => string>> = {
  alternating: toAlternatingCase,
  camel: (text) =>
    toIdentifierCase(text, (words) =>
      words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word))).join(""),
    ),
  capitalized: (text) => text.replace(WORD_PATTERN, capitalize),
  constant: (text) => toIdentifierCase(text, (words) => words.join("_").toUpperCase()),
  dot: (text) => toIdentifierCase(text, (words) => words.join(".").toLowerCase()),
  inverse: toInvertedCase,
  kebab: (text) => toIdentifierCase(text, (words) => words.join("-").toLowerCase()),
  lower: (text) => text.toLowerCase(),
  pascal: (text) => toIdentifierCase(text, (words) => words.map(capitalize).join("")),
  sentence: toSentenceCase,
  slug: toSlug,
  snake: (text) => toIdentifierCase(text, (words) => words.join("_").toLowerCase()),
  tidy: tidySpacing,
  title: toTitleCase,
  train: (text) => toIdentifierCase(text, (words) => words.map(capitalize).join("-")),
  upper: (text) => text.toUpperCase(),
};

/**
 * Rewrites text in the chosen letter-case style.
 */
export function convertCase(text: string, style: CaseStyle): string {
  return CONVERTERS[style](text);
}
