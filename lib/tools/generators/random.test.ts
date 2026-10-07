// @vitest-environment node
import { describe, expect, it } from "vitest";
import { pickOne, randomInt, shuffleInPlace } from "@/lib/tools/generators/random";

/**
 * A source that returns the given numbers in turn, so a test controls every draw.
 */
function sequence(...values: number[]): () => number {
  let index = 0;

  return () => values[index++ % values.length] ?? 0;
}

describe("randomInt", () => {
  it("maps a draw to a number below the limit", () => {
    expect(randomInt(10, sequence(7))).toBe(7);
    expect(randomInt(10, sequence(1234))).toBe(4);
    expect(randomInt(1, sequence(99))).toBe(0);
  });

  it("throws away draws from the uneven tail instead of favouring small numbers", () => {
    // 2^32 is 4294967296. For a limit of 3, draws of 4294967295 and above are the unfair tail,
    // because 4294967295 is the largest multiple of 3 that fits.
    const draws: number[] = [];
    const source = sequence(4_294_967_295, 4_294_967_295, 7);
    const value = randomInt(3, () => {
      const next = source();

      draws.push(next);

      return next;
    });

    expect(draws).toEqual([4_294_967_295, 4_294_967_295, 7]);
    expect(value).toBe(1);
  });

  it("rejects limits that are not whole numbers from 1 to 2^32", () => {
    for (const bad of [0, -1, 2.5, Number.NaN, 2 ** 32 + 1]) {
      expect(() => randomInt(bad)).toThrow(RangeError);
    }
  });

  it("gives every number about the same chance with the real generator", () => {
    const draws = 60_000;
    const tally = new Array<number>(6).fill(0);

    for (let index = 0; index < draws; index += 1) {
      const value = randomInt(6);

      tally[value] = (tally[value] ?? 0) + 1;
    }

    // Each face is expected 10,000 times with a spread of about 91, so 600 is over six spreads.
    for (const count of tally) {
      expect(Math.abs(count - draws / 6)).toBeLessThan(600);
    }
  });
});

describe("pickOne and shuffleInPlace", () => {
  it("picks the item a draw points at", () => {
    expect(pickOne(["a", "b", "c"], sequence(1))).toBe("b");
  });

  it("shuffles with a fair swap, changing the list itself", () => {
    // With a source that always draws 0, Fisher-Yates swaps each position with the first.
    const list = ["a", "b", "c", "d"];

    expect(shuffleInPlace(list, sequence(0))).toBe(list);
    expect(list).toEqual(["b", "c", "d", "a"]);
  });

  it("keeps every item", () => {
    const list = Array.from({ length: 30 }, (_, index) => index);

    expect([...shuffleInPlace([...list])].sort((a, b) => a - b)).toEqual(list);
  });
});
