import { splitIntoCharacters, type TextStats } from "@/lib/tools/text/text-stats";

/** Typical adult speeds, in words per minute. These give an estimate, not a promise. */
const READING_WORDS_PER_MINUTE = 238;
const SPEAKING_WORDS_PER_MINUTE = 130;
const SECONDS_PER_MINUTE = 60;
const MAX_KEYWORDS = 10;
const MAX_LONGEST_WORDS = 3;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

/** Very common English words, left out of the keyword table when asked. */
const COMMON_WORDS = new Set([
  "a", "about", "after", "all", "also", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by",
  "can", "could", "did", "do", "does", "for", "from", "had", "has", "have", "he", "her", "his", "how", "i", "if", "in",
  "into", "is", "it", "its", "just", "me", "more", "my", "no", "not", "of", "on", "one", "or", "our", "out", "she",
  "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "to", "up", "us",
  "was", "we", "were", "what", "when", "which", "who", "will", "with", "would", "you", "your",
]);

export interface KeywordRow {
  count: number;
  /** Share of all counted words, as a percentage with one decimal. */
  percent: number;
  word: string;
}

export interface WordInsights {
  /** Letters and digits per word, to one decimal. */
  averageWordLength: number;
  /** Words per sentence, to one decimal. */
  averageSentenceLength: number;
  keywords: KeywordRow[];
  longestWords: string[];
  readingSeconds: number;
  speakingSeconds: number;
}

export interface WordInsightOptions {
  ignoreCommonWords: boolean;
}

/**
 * Rounds to one decimal place.
 */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Finds the words in text, lower-cased, keeping apostrophes inside a word ("don't").
 */
function extractWords(text: string): string[] {
  return (text.match(WORD_PATTERN) ?? []).map((word) => word.toLowerCase());
}

/**
 * Turns a word count into seconds at a given speed.
 */
function secondsFor(words: number, wordsPerMinute: number): number {
  return Math.round((words / wordsPerMinute) * SECONDS_PER_MINUTE);
}

/**
 * Goes deeper than the basic counts: the most used words, average lengths, the longest words,
 * and estimated reading and speaking time. The counts in `stats` come from analyzeText.
 */
export function analyzeWords(text: string, stats: TextStats, options: WordInsightOptions): WordInsights {
  const words = extractWords(text);
  const counted = options.ignoreCommonWords ? words.filter((word) => !COMMON_WORDS.has(word)) : words;
  const tally = new Map<string, number>();

  for (const word of counted) {
    tally.set(word, (tally.get(word) ?? 0) + 1);
  }

  const keywords = [...tally.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_KEYWORDS)
    .map(([word, count]) => ({ count, percent: roundToTenth((count / counted.length) * 100), word }));
  const letters = words.reduce((total, word) => total + splitIntoCharacters(word.replace(/['’]/gu, "")).length, 0);
  const longestWords = [...new Set(words)]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, MAX_LONGEST_WORDS);

  return {
    averageSentenceLength: stats.sentences === 0 ? 0 : roundToTenth(stats.words / stats.sentences),
    averageWordLength: words.length === 0 ? 0 : roundToTenth(letters / words.length),
    keywords,
    longestWords,
    readingSeconds: secondsFor(stats.words, READING_WORDS_PER_MINUTE),
    speakingSeconds: secondsFor(stats.words, SPEAKING_WORDS_PER_MINUTE),
  };
}

/**
 * Writes seconds for people, for example "45 sec", "2 min 10 sec", or "1 hr 5 min".
 */
export function formatSeconds(totalSeconds: number): string {
  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);

  if (minutes < SECONDS_PER_MINUTE) {
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
  }

  const hours = Math.floor(minutes / SECONDS_PER_MINUTE);
  const remainder = minutes % SECONDS_PER_MINUTE;

  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

export interface CharacterTypes {
  digits: number;
  letters: number;
  lowercase: number;
  other: number;
  punctuation: number;
  spaces: number;
  symbols: number;
  uppercase: number;
}

/**
 * Sorts the characters a person sees into kinds: letters (and how many are capitals), digits,
 * spaces, punctuation, and symbols and emoji. Each character is classified by its first part.
 */
export function countCharacterTypes(text: string): CharacterTypes {
  const types: CharacterTypes = {
    digits: 0,
    letters: 0,
    lowercase: 0,
    other: 0,
    punctuation: 0,
    spaces: 0,
    symbols: 0,
    uppercase: 0,
  };

  for (const character of splitIntoCharacters(text)) {
    const first = String.fromCodePoint(character.codePointAt(0) ?? 0);

    if (/^\s+$/u.test(character)) {
      types.spaces += 1;
    } else if (/\p{L}/u.test(first)) {
      types.letters += 1;
      types.uppercase += /\p{Lu}/u.test(first) ? 1 : 0;
      types.lowercase += /\p{Ll}/u.test(first) ? 1 : 0;
    } else if (/\p{Nd}/u.test(first)) {
      types.digits += 1;
    } else if (/\p{P}/u.test(first)) {
      types.punctuation += 1;
    } else if (/\p{S}|\p{Extended_Pictographic}/u.test(first)) {
      types.symbols += 1;
    } else {
      types.other += 1;
    }
  }

  return types;
}
