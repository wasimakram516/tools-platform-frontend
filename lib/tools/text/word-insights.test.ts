// @vitest-environment node
import { describe, expect, it } from "vitest";
import { analyzeText } from "@/lib/tools/text/text-stats";
import { analyzeWords, countCharacterTypes, formatSeconds } from "@/lib/tools/text/word-insights";

const TEXT = "the cat and the dog and the bird";

/**
 * Runs the insights the way the tool does: basic counts first, then the deeper analysis.
 */
function insights(text: string, ignoreCommonWords = false): ReturnType<typeof analyzeWords> {
  return analyzeWords(text, analyzeText(text), { ignoreCommonWords });
}

describe("analyzeWords", () => {
  it("ranks the most used words with their share of the text", () => {
    // Shares were checked by hand: 3 of 8 words is 37.5 percent, 2 of 8 is 25, and 1 of 8 is 12.5.
    expect(insights(TEXT).keywords).toEqual([
      { count: 3, percent: 37.5, word: "the" },
      { count: 2, percent: 25, word: "and" },
      { count: 1, percent: 12.5, word: "bird" },
      { count: 1, percent: 12.5, word: "cat" },
      { count: 1, percent: 12.5, word: "dog" },
    ]);
  });

  it("can leave common words out of the keywords", () => {
    expect(insights(TEXT, true).keywords).toEqual([
      { count: 1, percent: 33.3, word: "bird" },
      { count: 1, percent: 33.3, word: "cat" },
      { count: 1, percent: 33.3, word: "dog" },
    ]);
  });

  it("measures average word length, sentence length, and the longest words", () => {
    const result = insights(TEXT);

    expect(result.averageWordLength).toBe(3.1);
    expect(result.averageSentenceLength).toBe(8);
    expect(result.longestWords).toEqual(["bird", "and", "cat"]);
  });

  it("estimates reading and speaking time from the word count", () => {
    // 8 words at 238 per minute is 2.0 seconds; at 130 per minute it is 3.7 seconds.
    expect(insights(TEXT)).toMatchObject({ readingSeconds: 2, speakingSeconds: 4 });
    expect(insights(Array(238).fill("word").join(" "))).toMatchObject({ readingSeconds: 60, speakingSeconds: 110 });
  });

  it("is case-insensitive and keeps apostrophes inside a word", () => {
    expect(insights("Don't STOP don't").keywords[0]).toEqual({ count: 2, percent: 66.7, word: "don't" });
  });

  it("returns empty results for empty text", () => {
    expect(insights("")).toEqual({
      averageSentenceLength: 0,
      averageWordLength: 0,
      keywords: [],
      longestWords: [],
      readingSeconds: 0,
      speakingSeconds: 0,
    });
  });

  it("lists at most ten keywords", () => {
    expect(insights("a b c d e f g h i j k l").keywords).toHaveLength(10);
  });
});

describe("formatSeconds", () => {
  it("writes seconds, minutes, and hours for people", () => {
    expect(formatSeconds(0)).toBe("0 sec");
    expect(formatSeconds(45)).toBe("45 sec");
    expect(formatSeconds(60)).toBe("1 min");
    expect(formatSeconds(130)).toBe("2 min 10 sec");
    expect(formatSeconds(3600)).toBe("1 hr");
    expect(formatSeconds(3900)).toBe("1 hr 5 min");
  });
});

describe("countCharacterTypes", () => {
  it("sorts characters into letters, capitals, digits, spaces, punctuation, and symbols", () => {
    expect(countCharacterTypes("Hello, World 123! 👍")).toEqual({
      digits: 3,
      letters: 10,
      lowercase: 8,
      other: 0,
      punctuation: 2,
      spaces: 3,
      symbols: 1,
      uppercase: 2,
    });
  });

  it("returns zeros for empty text", () => {
    expect(Object.values(countCharacterTypes("")).every((count) => count === 0)).toBe(true);
  });
});
