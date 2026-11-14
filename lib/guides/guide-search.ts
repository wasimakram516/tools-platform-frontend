import { alternatives, appearsIn, significantWords } from "@/lib/tools/tool-search";

/**
 * What the site search needs to know about a guide: small enough to send to the browser, unlike
 * the guide itself.
 */
export interface SearchableGuide {
  description: string;
  href: string;
  name: string;
  /** Section headings and extra search words, joined into one line. */
  terms: string;
}

/** The most guides the search lists, below the tools, so tools stay the main result. */
export const MAX_GUIDE_RESULTS = 3;

/** How strongly a word counts in each field. A word in the name ranks a guide highest. */
const NAME_SCORE = 3;
const TERMS_SCORE = 2;
const DESCRIPTION_SCORE = 1;

/**
 * Scores one typed word against a guide, counting its synonyms too, or 0 when it matches nothing.
 */
function scoreWord(word: string, guide: SearchableGuide): number {
  return Math.max(
    ...alternatives(word).map((option) => {
      if (appearsIn(guide.name, option)) {
        return NAME_SCORE;
      }

      if (appearsIn(guide.terms, option)) {
        return TERMS_SCORE;
      }

      return appearsIn(guide.description, option) ? DESCRIPTION_SCORE : 0;
    }),
  );
}

/**
 * Finds the guides that match every meaningful word of a search, best first, up to
 * MAX_GUIDE_RESULTS. Unlike the tool search there are no "closest matches": a guide is a reading
 * suggestion, so it shows only when it fits the whole search.
 */
export function searchGuides(guides: readonly SearchableGuide[], query: string): SearchableGuide[] {
  const words = query.trim() === "" ? [] : significantWords(query);

  if (words.length === 0) {
    return [];
  }

  return guides
    .map((guide, index) => ({ guide, index, scores: words.map((word) => scoreWord(word, guide)) }))
    .filter((match) => match.scores.every((score) => score > 0))
    .map((match) => ({ ...match, total: match.scores.reduce((sum, score) => sum + score, 0) }))
    .sort((a, b) => b.total - a.total || a.index - b.index)
    .slice(0, MAX_GUIDE_RESULTS)
    .map((match) => match.guide);
}
