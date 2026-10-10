import type { ToolDefinition } from "@/types/tool";

/** How strongly each field counts when a word matches it. Higher means it ranks earlier. */
const NAME_SCORE = 8;
const TERM_SCORE = 6;
const KEYWORD_SCORE = 5;
const DESCRIPTION_SCORE = 2;
const CATEGORY_SCORE = 1;
/** Added when the typed word is the first word of the name, so "json" finds "JSON Formatter". */
const NAME_START_SCORE = 2;
/** Shared out between the typed words, by how much of a short name they cover. */
const NAME_COVERAGE_SCORE = 8;

/** The most tools shown as "closest matches" when nothing matches every word. */
const APPROXIMATE_LIMIT = 6;

/**
 * Words that carry no meaning on their own, so a sentence like "how do I make my image smaller"
 * is judged by "image" and "smaller" alone.
 */
const STOP_WORDS: ReadonlySet<string> = new Set([
  "a", "am", "an", "and", "any", "are", "be", "can", "do", "does", "for", "from", "get", "has", "have", "how", "i", "if",
  "in", "into", "is", "it", "item", "items", "its", "just", "like", "make", "me", "my", "need", "of", "on", "online", "or", "out",
  "instead", "not", "please", "show", "shows", "so", "too", "some", "that", "the", "this", "to", "tool", "tools", "up", "use", "want", "was", "way", "what",
  "when", "which", "with", "would", "you", "your",
]);

/**
 * Everyday words people use for what a tool does, each mapped to the words the tools use. A
 * visitor who types "shrink" finds the compressor without having to know it is called one.
 */
const SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  alphabetical: ["sort"],
  arrange: ["sort"],
  barcode: ["qr"],
  birthday: ["age"],
  bigger: ["resize"],
  born: ["age"],
  capital: ["case"],
  capitals: ["case"],
  choose: ["random"],
  cut: ["crop"],
  decrypt: ["decode"],
  dimensions: ["resize"],
  draw: ["random"],
  enlarge: ["resize"],
  epoch: ["unix"],
  jpeg: ["jpg"],
  lighter: ["compress"],
  lowercase: ["case"],
  old: ["age"],
  optimize: ["compress"],
  order: ["sort"],
  photo: ["image"],
  photos: ["image"],
  picture: ["image"],
  pictures: ["image"],
  pic: ["image"],
  pick: ["random"],
  readable: ["format"],
  reduce: ["compress"],
  repeated: ["duplicate"],
  repeats: ["duplicate"],
  scale: ["resize"],
  secure: ["password"],
  shrink: ["compress"],
  smaller: ["compress"],
  spreadsheet: ["excel"],
  timesheet: ["hours"],
  trim: ["crop"],
  uppercase: ["case"],
  wifi: ["qr"],
};

/**
 * Lowercases text and removes punctuation, so "SHA-256" and "sha 256" read the same.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * The words of a tool's name that carry meaning, so "CSV and JSON Converter" is three words.
 */
function nameWords(name: string): string[] {
  const words = normalize(name).split(" ").filter((word) => word !== "" && !STOP_WORDS.has(word));

  return words.length > 0 ? words : [normalize(name)];
}

/**
 * Trims a simple plural, so "images" and "image" find the same tools.
 */
function singular(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

/**
 * Splits a search into the words that matter, dropping filler words. A search made only of
 * filler words is kept as typed, so it never turns into an empty search.
 */
function significantWords(query: string): string[] {
  const words = normalize(query).split(" ").filter(Boolean);
  const meaningful = words.filter((word) => !STOP_WORDS.has(word));

  return (meaningful.length > 0 ? meaningful : words).map(singular);
}

/**
 * The words a typed word can stand for: itself and any everyday synonyms.
 */
function alternatives(word: string): string[] {
  return [word, ...(SYNONYMS[word] ?? [])];
}

/** Words shorter than this must match the start of a word, so "old" cannot match "folder". */
const MIN_ANYWHERE_LENGTH = 4;

/**
 * Tells whether a typed word appears in some text. Short words must start a word, which stops
 * "age" matching "image". Longer words and numbers may appear anywhere, so "256" finds
 * "sha256" and "compress" finds "compressor".
 */
function appearsIn(text: string, word: string): boolean {
  const haystack = normalize(text);

  if (word.length >= MIN_ANYWHERE_LENGTH || /\d/.test(word)) {
    return haystack.includes(word);
  }

  return ` ${haystack}`.includes(` ${word}`);
}

/**
 * Scores how well one word matches a tool, or 0 when it matches nothing.
 */
function scoreWord(word: string, tool: ToolDefinition, categoryName: string): number {
  let score = 0;

  if (appearsIn(tool.name, word)) {
    score += NAME_SCORE;

    // A word that opens a short name is a closer match than one buried in a long name, so the
    // tool that is simply called "JSON Formatter" ranks above "CSV and JSON Converter".
    if (normalize(tool.name).startsWith(word)) {
      score += NAME_START_SCORE;
    }

    score += NAME_COVERAGE_SCORE / nameWords(tool.name).length;
  }

  if (tool.searchTerms.some((term) => appearsIn(term, word))) {
    score += TERM_SCORE;
  }

  if (tool.keywords.some((keyword) => appearsIn(keyword, word))) {
    score += KEYWORD_SCORE;
  }

  if (appearsIn(`${tool.shortDescription} ${tool.description}`, word)) {
    score += DESCRIPTION_SCORE;
  }

  if (appearsIn(categoryName, word)) {
    score += CATEGORY_SCORE;
  }

  return score;
}

/**
 * Scores a typed word as the best of the word itself and its synonyms.
 */
function scoreTypedWord(word: string, tool: ToolDefinition, categoryName: string): number {
  return Math.max(...alternatives(word).map((option) => scoreWord(option, tool, categoryName)));
}

export interface ToolSearchResult {
  /**
   * True when no tool matched every word, so these are the closest matches: tools that fit
   * some of the words. The page says so, so the visitor knows it is a suggestion.
   */
  approximate: boolean;
  tools: ToolDefinition[];
}

/**
 * Finds tools for what someone typed, best match first. It accepts a tool's name, a short
 * description of the job, or a whole sentence about the problem ("my photo is too big to
 * upload"). Filler words are ignored, everyday synonyms count, and words match anywhere in a
 * tool's name, keywords, search terms, descriptions, or category.
 *
 * Tools that match every word come first. If none do, the closest partial matches are
 * returned and marked approximate. An empty query returns no tools, because the caller shows
 * the normal browse view instead.
 */
export function searchToolsDetailed(
  tools: readonly ToolDefinition[],
  query: string,
  categoryNameFor: (categoryId: string) => string,
): ToolSearchResult {
  const words = significantWords(query);

  if (words.length === 0) {
    return { approximate: false, tools: [] };
  }

  const scored = tools.map((tool, index) => {
    const scores = words.map((word) => scoreTypedWord(word, tool, categoryNameFor(tool.categoryId)));

    return {
      index,
      matchedWords: scores.filter((score) => score > 0).length,
      tool,
      total: scores.reduce((sum, score) => sum + score, 0),
    };
  });
  const byRank = (a: (typeof scored)[number], b: (typeof scored)[number]): number =>
    b.matchedWords - a.matchedWords || b.total - a.total || a.index - b.index;

  const exact = scored.filter((match) => match.matchedWords === words.length).sort(byRank);

  if (exact.length > 0 || words.length === 1) {
    return { approximate: false, tools: exact.map((match) => match.tool) };
  }

  const partial = scored
    .filter((match) => match.matchedWords > 0)
    .sort(byRank)
    .slice(0, APPROXIMATE_LIMIT);

  return { approximate: partial.length > 0, tools: partial.map((match) => match.tool) };
}

/**
 * The matching tools only, for callers that do not need to know whether the match is exact.
 */
export function searchTools(
  tools: readonly ToolDefinition[],
  query: string,
  categoryNameFor: (categoryId: string) => string,
): ToolDefinition[] {
  return searchToolsDetailed(tools, query, categoryNameFor).tools;
}
