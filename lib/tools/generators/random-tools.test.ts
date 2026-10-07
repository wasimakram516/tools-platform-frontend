// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  flipCoins,
  generateNumbers,
  MAX_NUMBERS,
  parseList,
  pickFromList,
  randomIntBetween,
  rollDice,
  shuffleList,
  splitIntoTeams,
  type NumberOptions,
} from "@/lib/tools/generators/random-tools";

/**
 * A source that returns the given numbers in turn, so a test controls every draw.
 */
function sequence(...values: number[]): () => number {
  let index = 0;

  return () => values[index++ % values.length] ?? 0;
}

const NUMBERS: NumberOptions = { count: 5, decimals: 0, max: 10, min: 1, sort: "none", unique: false };

/**
 * Returns the values of a successful result, or fails the test.
 */
function valuesOf(result: ReturnType<typeof generateNumbers>): string[] {
  if (!result.ok) {
    throw new Error(`Expected success but got: ${result.message}`);
  }

  return result.values;
}

describe("randomIntBetween", () => {
  it("maps a draw into an inclusive range, including negative ones", () => {
    expect(randomIntBetween(5, 10, sequence(4))).toBe(9);
    expect(randomIntBetween(-3, 3, sequence(0))).toBe(-3);
    expect(randomIntBetween(-3, 3, sequence(6))).toBe(3);
    expect(randomIntBetween(7, 7, sequence(123))).toBe(7);
  });

  it("combines two draws for ranges wider than 32 bits", () => {
    // 6144 >>> 11 is 3, so the value is 3 * 2^32 + 7 = 12884901895.
    expect(randomIntBetween(0, 2 ** 40 - 1, sequence(6144, 7))).toBe(12_884_901_895);
  });

  it("throws away wide draws from the uneven tail", () => {
    // The range is 6e15, so draws of 6e15 and above are unfair. The first pair makes 2^53 - 1 and is
    // rejected; the second pair makes 5.
    expect(randomIntBetween(0, 6e15 - 1, sequence(0xffffffff, 0xffffffff, 0, 5))).toBe(5);
  });
});

describe("generateNumbers", () => {
  it("makes the requested count of whole numbers inside the range", () => {
    const values = valuesOf(generateNumbers({ ...NUMBERS, count: 500, max: 6, min: 1 }));

    expect(values).toHaveLength(500);
    expect(values.every((value) => /^[1-6]$/.test(value))).toBe(true);
    expect(new Set(values).size).toBe(6);
  });

  it("follows the draws, and reports the sum, average, smallest, and largest", () => {
    // Draws 0, 5, 2 over 1 to 6 give 1, 6, 3.
    expect(generateNumbers({ ...NUMBERS, count: 3, max: 6 }, sequence(0, 5, 2))).toEqual({
      ok: true,
      summary: { average: 10 / 3, largest: 6, smallest: 1, sum: 10 },
      values: ["1", "6", "3"],
    });
  });

  it("sorts in either direction", () => {
    expect(valuesOf(generateNumbers({ ...NUMBERS, count: 3, max: 6, sort: "ascending" }, sequence(0, 5, 2)))).toEqual(["1", "3", "6"]);
    expect(valuesOf(generateNumbers({ ...NUMBERS, count: 3, max: 6, sort: "descending" }, sequence(0, 5, 2)))).toEqual(["6", "3", "1"]);
  });

  it("picks different numbers when asked, using every one when the count equals the range", () => {
    const result = generateNumbers({ ...NUMBERS, count: 10, max: 10, sort: "ascending", unique: true });

    // 1 to 10 add up to 55 and average 5.5, checked with Python.
    expect(result).toMatchObject({ summary: { average: 5.5, largest: 10, smallest: 1, sum: 55 } });
    expect(valuesOf(result)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(valuesOf(generateNumbers({ ...NUMBERS, count: 3, max: 5, unique: true }, sequence(0)))).toEqual(["1", "2", "3"]);
  });

  it("picks different numbers from a huge range too", () => {
    const values = valuesOf(generateNumbers({ ...NUMBERS, count: 200, max: 1e12, min: 0, unique: true }));

    expect(new Set(values).size).toBe(200);
  });

  it("makes numbers with decimal places inside the range", () => {
    const values = valuesOf(generateNumbers({ ...NUMBERS, count: 300, decimals: 1, max: 1.5, min: 0.5 }));

    expect(values.every((value) => /^(0\.[5-9]|1\.[0-5])$/.test(value))).toBe(true);
    expect(valuesOf(generateNumbers({ ...NUMBERS, count: 1, decimals: 2, max: 1, min: 0 }, sequence(0)))).toEqual(["0.00"]);
  });

  it("explains every way the request can be wrong", () => {
    const problem = (change: Partial<NumberOptions>): string => {
      const result = generateNumbers({ ...NUMBERS, ...change });

      return result.ok ? "" : result.message;
    };

    expect(problem({ min: 10, max: 1 })).toContain("Swap them");
    expect(problem({ min: Number.NaN })).toContain("smallest and a largest");
    expect(problem({ max: 1e16 })).toContain("up to 1,000,000,000,000,000");
    expect(problem({ count: 0 })).toContain("Choose between 1 and 1,000");
    expect(problem({ count: MAX_NUMBERS + 1 })).toContain("Choose between 1 and 1,000");
    expect(problem({ decimals: 9 })).toContain("0 to 8");
    expect(problem({ count: 11, unique: true })).toBe("There are only 10 different numbers in that range, so 11 different ones cannot be picked.");
    expect(problem({ decimals: 2, max: 0.004, min: 0.001 })).toContain("No number");
    expect(problem({ decimals: 8, max: 1e12, min: 0 })).toContain("too large");
  });
});

describe("rollDice", () => {
  it("rolls each die from 1 to its sides and adds the modifier", () => {
    // Draws 0, 5, 2 on a six-sided die are rolls of 1, 6, and 3.
    expect(rollDice({ count: 3, modifier: 2, sides: 6 }, sequence(0, 5, 2))).toEqual({ ok: true, rolls: [1, 6, 3], total: 12 });
    expect(rollDice({ count: 1, modifier: -3, sides: 20 }, sequence(19))).toEqual({ ok: true, rolls: [20], total: 17 });
  });

  it("keeps every roll in range with the real generator", () => {
    const result = rollDice({ count: 100, modifier: 0, sides: 8 });

    expect(result.ok && result.rolls.every((roll) => roll >= 1 && roll <= 8)).toBe(true);
  });

  it("explains a bad request", () => {
    expect(rollDice({ count: 0, modifier: 0, sides: 6 })).toMatchObject({ ok: false });
    expect(rollDice({ count: 101, modifier: 0, sides: 6 })).toMatchObject({ ok: false });
    expect(rollDice({ count: 1, modifier: 0, sides: 1 })).toMatchObject({ ok: false });
    expect(rollDice({ count: 1, modifier: 0, sides: 1001 })).toMatchObject({ ok: false });
    expect(rollDice({ count: 1, modifier: 1.5, sides: 6 })).toMatchObject({ ok: false });
  });
});

describe("flipCoins", () => {
  it("flips heads and tails and counts them", () => {
    expect(flipCoins(3, sequence(0, 1, 1))).toEqual({ flips: ["Heads", "Tails", "Tails"], heads: 1, ok: true, tails: 2 });
  });

  it("is close to even over many flips", () => {
    const result = flipCoins(1000);

    // A fair coin gives 500 heads with a spread of about 16, so 100 is over six spreads.
    expect(result.ok && Math.abs(result.heads - 500)).toBeLessThan(100);
  });

  it("explains a bad count", () => {
    expect(flipCoins(0)).toMatchObject({ ok: false });
    expect(flipCoins(1001)).toMatchObject({ ok: false });
  });
});

describe("parseList", () => {
  it("trims lines, drops empty ones, and can drop repeats ignoring case", () => {
    const text = "  Ann \n\nBob\nann\r\nCara";

    expect(parseList(text, { removeDuplicates: false })).toEqual(["Ann", "Bob", "ann", "Cara"]);
    expect(parseList(text, { removeDuplicates: true })).toEqual(["Ann", "Bob", "Cara"]);
    expect(parseList("", { removeDuplicates: false })).toEqual([]);
  });
});

describe("pickFromList and shuffleList", () => {
  const PEOPLE = ["a", "b", "c", "d"];

  it("picks different items, each equally likely", () => {
    // With a source that always draws 0, the shuffle gives b, c, d, a, so the first two are b and c.
    expect(pickFromList(PEOPLE, 2, sequence(0))).toEqual({ items: ["b", "c"], ok: true });
    expect(pickFromList(PEOPLE, 4)).toMatchObject({ ok: true });
  });

  it("shuffles without losing anyone, and leaves the original alone", () => {
    const result = shuffleList(PEOPLE);

    expect(result.ok && [...result.items].sort()).toEqual(PEOPLE);
    expect(PEOPLE).toEqual(["a", "b", "c", "d"]);
  });

  it("explains an empty list and a count that is too big", () => {
    expect(pickFromList([], 1)).toMatchObject({ ok: false });
    expect(pickFromList(PEOPLE, 5)).toMatchObject({ message: "Choose between 1 and 4, the number of items.", ok: false });
    expect(pickFromList(PEOPLE, 0)).toMatchObject({ ok: false });
    expect(shuffleList([])).toMatchObject({ ok: false });
  });
});

describe("splitIntoTeams", () => {
  const PEOPLE = ["a", "b", "c", "d", "e", "f", "g"];

  it("deals people out so team sizes never differ by more than one", () => {
    const result = splitIntoTeams(PEOPLE, { by: "teams", teams: 3 });

    if (!result.ok) {
      throw new Error(result.message);
    }

    expect(result.teams.map((team) => team.length)).toEqual([3, 2, 2]);
    expect(result.teams.flat().sort()).toEqual(PEOPLE);
  });

  it("can split by the biggest team size wanted", () => {
    // Seven people in teams of up to 3 needs ceil(7 / 3) = 3 teams.
    const result = splitIntoTeams(PEOPLE, { by: "size", size: 3 });

    expect(result.ok && result.teams).toHaveLength(3);
  });

  it("follows the shuffle", () => {
    // Always drawing 0 shuffles seven people into b, c, d, e, f, g, a, and dealing them to 2 teams
    // puts b, d, f, a in the first and c, e, g in the second.
    expect(splitIntoTeams(PEOPLE, { by: "teams", teams: 2 }, sequence(0))).toEqual({
      ok: true,
      teams: [["b", "d", "f", "a"], ["c", "e", "g"]],
    });
  });

  it("explains every way the request can be wrong", () => {
    expect(splitIntoTeams([], { by: "teams", teams: 2 })).toMatchObject({ ok: false });
    expect(splitIntoTeams(PEOPLE, { by: "teams", teams: 1 })).toMatchObject({ message: "Choose between 2 and 7 teams for 7 people.", ok: false });
    expect(splitIntoTeams(PEOPLE, { by: "teams", teams: 8 })).toMatchObject({ ok: false });
    expect(splitIntoTeams(PEOPLE, { by: "size", size: 0 })).toMatchObject({ ok: false });
    expect(splitIntoTeams(PEOPLE, { by: "size", size: 7 })).toMatchObject({ ok: false });
  });
});
