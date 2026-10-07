/** Text tools work in one pass on this device, so the limit only protects the page's memory. */
export const MAX_TEXT_TOOL_CHARACTERS = 1_000_000;

export interface TextStats {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  utf8Bytes: number;
}

const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;
const WHITESPACE_ONLY = /^\s+$/u;
const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+/u;
const PARAGRAPH_BOUNDARY = /\r?\n\s*\r?\n/u;

/**
 * Splits text into the characters a person sees, so an emoji or an accented letter counts once.
 * Falls back to code points where the browser has no segmenter.
 */
export function splitIntoCharacters(text: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
  }

  return Array.from(text);
}

/**
 * Counts the pieces of text that contain at least one letter or digit, so stray punctuation
 * such as a lone dash is not counted as a word, a sentence, or a paragraph.
 */
function countMeaningful(pieces: readonly string[]): number {
  return pieces.filter((piece) => LETTER_OR_NUMBER.test(piece)).length;
}

/**
 * Counts the lines in text, treating a final line break as the end of the last line rather than
 * the start of another.
 */
function countLines(text: string): number {
  if (text === "") {
    return 0;
  }

  return text.replace(/(\r\n|\r|\n)$/u, "").split(/\r\n|\r|\n/u).length;
}

/**
 * Measures text: words (groups separated by spaces), characters as a person sees them, sentences
 * (estimated from . ! ? endings), paragraphs (separated by a blank line), lines, and UTF-8 size.
 */
export function analyzeText(text: string): TextStats {
  const characters = splitIntoCharacters(text);

  return {
    characters: characters.length,
    charactersWithoutSpaces: characters.filter((character) => !WHITESPACE_ONLY.test(character)).length,
    lines: countLines(text),
    paragraphs: countMeaningful(text.split(PARAGRAPH_BOUNDARY)),
    sentences: countMeaningful(text.split(SENTENCE_BOUNDARY)),
    utf8Bytes: new TextEncoder().encode(text).length,
    words: countMeaningful(text.split(/\s+/u)),
  };
}

export interface LimitStatus {
  limit: number;
  remaining: number;
  isOver: boolean;
}

/**
 * Compares a character count with a limit such as a post length. Returns null when no valid
 * limit is set.
 */
export function checkLimit(characters: number, limit: number | null): LimitStatus | null {
  if (limit === null || !Number.isInteger(limit) || limit < 1) {
    return null;
  }

  return { isOver: characters > limit, limit, remaining: limit - characters };
}
