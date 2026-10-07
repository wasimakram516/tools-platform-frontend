// @vitest-environment node
import { describe, expect, it } from "vitest";
import { analyzeText, checkLimit } from "@/lib/tools/text/text-stats";

describe("analyzeText", () => {
  it("counts words, characters, sentences, paragraphs, lines, and bytes", () => {
    // Totals were checked independently with Python.
    expect(analyzeText("Hello world. How are you?\n\nFine, thanks!")).toEqual({
      characters: 40,
      charactersWithoutSpaces: 33,
      lines: 3,
      paragraphs: 2,
      sentences: 3,
      utf8Bytes: 40,
      words: 7,
    });
  });

  it("returns zeros for empty or blank text", () => {
    const zeros = {
      characters: 0,
      charactersWithoutSpaces: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      utf8Bytes: 0,
      words: 0,
    };

    expect(analyzeText("")).toEqual(zeros);
    expect(analyzeText("   ")).toMatchObject({ characters: 3, charactersWithoutSpaces: 0, paragraphs: 0, sentences: 0, words: 0 });
  });

  it("counts characters as a person sees them and bytes as UTF-8", () => {
    const result = analyzeText("café 👍🏽");

    expect(result.characters).toBe(6);
    expect(result.utf8Bytes).toBe(14);
    expect(result.words).toBe(1);
  });

  it("does not count lone punctuation as a word or a sentence", () => {
    expect(analyzeText("hello - world !")).toMatchObject({ sentences: 1, words: 2 });
  });

  it("keeps decimals and abbreviations from splitting a sentence unnecessarily", () => {
    expect(analyzeText("Pi is 3.14 today.")).toMatchObject({ sentences: 1 });
  });

  it("treats a final line break as the end of the last line", () => {
    expect(analyzeText("a\n").lines).toBe(1);
    expect(analyzeText("a\n\nb").lines).toBe(3);
    expect(analyzeText("a\r\nb").lines).toBe(2);
  });
});

describe("checkLimit", () => {
  it("reports what is left, or how far over the limit the text is", () => {
    expect(checkLimit(250, 280)).toEqual({ isOver: false, limit: 280, remaining: 30 });
    expect(checkLimit(300, 280)).toEqual({ isOver: true, limit: 280, remaining: -20 });
    expect(checkLimit(280, 280)).toEqual({ isOver: false, limit: 280, remaining: 0 });
  });

  it("ignores a missing or invalid limit", () => {
    expect(checkLimit(10, null)).toBeNull();
    expect(checkLimit(10, 0)).toBeNull();
    expect(checkLimit(10, 2.5)).toBeNull();
  });
});
