import type { ToolDefinition } from "@/types/tool";

/** How strongly each field counts when a word matches it. Higher means it ranks earlier. */
const NAME_SCORE = 8;
const KEYWORD_SCORE = 5;
const DESCRIPTION_SCORE = 2;
const CATEGORY_SCORE = 1;

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
 * Scores how well one word matches a tool, or 0 when it matches nothing.
 */
function scoreWord(word: string, tool: ToolDefinition, categoryName: string): number {
  let score = 0;

  if (normalize(tool.name).includes(word)) {
    score += NAME_SCORE;
  }

  if (tool.keywords.some((keyword) => normalize(keyword).includes(word))) {
    score += KEYWORD_SCORE;
  }

  if (normalize(`${tool.shortDescription} ${tool.description}`).includes(word)) {
    score += DESCRIPTION_SCORE;
  }

  if (normalize(categoryName).includes(word)) {
    score += CATEGORY_SCORE;
  }

  return score;
}

/**
 * Finds the tools that match every word typed, best match first. Words match anywhere in a
 * tool's name, keywords, descriptions, or category, ignoring case and punctuation. An empty
 * query returns no tools, because the caller shows the normal browse view instead.
 */
export function searchTools(
  tools: readonly ToolDefinition[],
  query: string,
  categoryNameFor: (categoryId: string) => string,
): ToolDefinition[] {
  const words = normalize(query).split(" ").filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  return tools
    .map((tool, index) => {
      const scores = words.map((word) => scoreWord(word, tool, categoryNameFor(tool.categoryId)));

      return { index, score: scores.every((score) => score > 0) ? scores.reduce((a, b) => a + b, 0) : 0, tool };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((match) => match.tool);
}
