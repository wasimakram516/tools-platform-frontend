// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  removeDuplicateLines,
  sortLines,
  seededRandom,
  splitLines,
  type DuplicateOptions,
  type SortOptions,
} from "@/lib/tools/text/line-tools";

const SORT: SortOptions = {
  caseSensitive: false,
  naturalNumbers: false,
  order: "ascending",
  removeDuplicates: false,
  removeEmptyLines: false,
  trimLines: false,
};
const DEDUPE: DuplicateOptions = {
  caseSensitive: false,
  mode: "remove",
  removeEmptyLines: false,
  trimWhitespace: false,
};

describe("splitLines", () => {
  it("splits on any line break and drops the final empty line", () => {
    expect(splitLines("a\r\nb\rc\nd\n")).toEqual(["a", "b", "c", "d"]);
    expect(splitLines("")).toEqual([]);
    expect(splitLines("a\n\nb")).toEqual(["a", "", "b"]);
  });
});

describe("sortLines", () => {
  it("sorts ascending and descending, ignoring case by default", () => {
    expect(sortLines("banana\nApple\ncherry", SORT)).toEqual({ lines: 3, output: "Apple\nbanana\ncherry" });
    expect(sortLines("banana\nApple\ncherry", { ...SORT, order: "descending" }).output).toBe(
      "cherry\nbanana\nApple",
    );
  });

  it("can tell upper and lower case apart", () => {
    expect(sortLines("b\nA\na\nB", { ...SORT, caseSensitive: true }).output).toBe("a\nA\nb\nB");
  });

  it("sorts numbers inside text in natural order when asked", () => {
    const text = "item 10\nitem 2\nitem 1";

    expect(sortLines(text, SORT).output).toBe("item 1\nitem 10\nitem 2");
    expect(sortLines(text, { ...SORT, naturalNumbers: true }).output).toBe("item 1\nitem 2\nitem 10");
  });

  it("sorts accented letters with their base letter", () => {
    expect(sortLines("zebra\nécole\napple", SORT).output).toBe("apple\nécole\nzebra");
  });

  it("sorts by length, breaking ties alphabetically", () => {
    expect(sortLines("ccc\na\nbb\naa", { ...SORT, order: "shortest" }).output).toBe("a\naa\nbb\nccc");
    expect(sortLines("ccc\na\nbb\naa", { ...SORT, order: "longest" }).output).toBe("ccc\naa\nbb\na");
  });

  it("reverses the current order without sorting", () => {
    expect(sortLines("a\nc\nb", { ...SORT, order: "reverse" }).output).toBe("b\nc\na");
  });

  it("shuffles with a fair swap, and keeps every line", () => {
    // With a source that always returns 0, Fisher-Yates swaps each position with the first.
    expect(sortLines("a\nb\nc\nd", { ...SORT, order: "shuffle" }, () => 0).output).toBe("b\nc\nd\na");
    expect(sortLines("a\nb\nc\nd", { ...SORT, order: "shuffle" }, () => 0.999).output).toBe("a\nb\nc\nd");

    const shuffled = sortLines("a\nb\nc\nd\ne\nf", { ...SORT, order: "shuffle" }).output.split("\n");

    expect([...shuffled].sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("can trim lines, drop empty lines, and drop duplicates before sorting", () => {
    expect(sortLines("  b\na  \n\n  ", { ...SORT, removeEmptyLines: true, trimLines: true })).toEqual({
      lines: 2,
      output: "a\nb",
    });
    expect(sortLines("b\na\nB\na", { ...SORT, removeDuplicates: true }).output).toBe("a\nb");
    expect(sortLines("b\na\nB\na", { ...SORT, caseSensitive: true, removeDuplicates: true }).output).toBe(
      "a\nb\nB",
    );
  });

  it("ignores a final line break and returns nothing for empty text", () => {
    expect(sortLines("b\na\n", SORT)).toEqual({ lines: 2, output: "a\nb" });
    expect(sortLines("", SORT)).toEqual({ lines: 0, output: "" });
  });
});

describe("seededRandom", () => {
  it("repeats the same sequence for the same seed, in the range 0 up to 1", () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const values = Array.from({ length: 50 }, () => first());

    expect(values).toEqual(Array.from({ length: 50 }, () => second()));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it("gives a different sequence for a different seed, so a new seed reshuffles", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());

    const list = Array.from({ length: 20 }, (_, index) => String(index)).join("\n");
    const options = { ...SORT, order: "shuffle" as const };

    expect(sortLines(list, options, seededRandom(1)).output).toBe(sortLines(list, options, seededRandom(1)).output);
    expect(sortLines(list, options, seededRandom(1)).output).not.toBe(sortLines(list, options, seededRandom(2)).output);
  });
});

describe("removeDuplicateLines", () => {
  const text = "a\nb\na\nA\n b\nb";

  it("keeps the first of each line, in the original order, ignoring case", () => {
    expect(removeDuplicateLines(text, DEDUPE)).toMatchObject({ kept: 3, output: "a\nb\n b", removed: 3 });
  });

  it("can tell upper and lower case apart", () => {
    expect(removeDuplicateLines(text, { ...DEDUPE, caseSensitive: true })).toMatchObject({
      kept: 4,
      output: "a\nb\nA\n b",
      removed: 2,
    });
  });

  it("can ignore spaces at the ends of lines", () => {
    expect(removeDuplicateLines(text, { ...DEDUPE, trimWhitespace: true })).toMatchObject({
      kept: 2,
      output: "a\nb",
      removed: 4,
    });
  });

  it("keeps one empty line, or removes them all when asked", () => {
    expect(removeDuplicateLines("a\n\n\na", DEDUPE)).toMatchObject({ kept: 2, output: "a\n", removed: 2 });
    expect(removeDuplicateLines("a\n\n\na", { ...DEDUPE, removeEmptyLines: true })).toMatchObject({
      kept: 1,
      output: "a",
      removed: 3,
    });
  });

  it("can keep only the lines that appear once", () => {
    expect(removeDuplicateLines("a\nb\na\nc\nb\nd", { ...DEDUPE, mode: "uniqueOnly" })).toMatchObject({
      kept: 2,
      output: "c\nd",
      removed: 4,
    });
  });

  it("can keep one copy of only the lines that repeat", () => {
    expect(removeDuplicateLines("a\nb\na\nc\nb\nd", { ...DEDUPE, mode: "duplicatesOnly" })).toMatchObject({
      kept: 2,
      output: "a\nb",
      removed: 4,
    });
  });

  it("lists the most repeated lines with their counts", () => {
    expect(removeDuplicateLines("x\ny\ny\ny\nx\nz", DEDUPE).repeated).toEqual([
      { count: 3, line: "y" },
      { count: 2, line: "x" },
    ]);
    expect(removeDuplicateLines("a\nb", DEDUPE).repeated).toEqual([]);
  });

  it("returns nothing for empty text", () => {
    expect(removeDuplicateLines("", DEDUPE)).toEqual({ kept: 0, output: "", removed: 0, repeated: [] });
  });
});
