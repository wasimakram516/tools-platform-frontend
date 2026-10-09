// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  bitLength,
  bytesToText,
  formatInteger,
  fromRoman,
  groupDigits,
  parseInteger,
  textToBytes,
  toRoman,
} from "@/lib/tools/data/number-bases";

/**
 * Reads a number and returns its value, failing the test if it could not be read.
 */
function valueOf(text: string, base: number): bigint {
  const result = parseInteger(text, base);

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.value;
}

// The expected values below were produced by Python's int(), hex(), bin(), and str.encode().
describe("parseInteger and formatInteger", () => {
  it("reads numbers in any base from 2 to 36", () => {
    expect(valueOf("FF", 16)).toBe(255n);
    expect(valueOf("-1010", 2)).toBe(-10n);
    expect(valueOf("zz", 36)).toBe(1295n);
    expect(valueOf("777", 8)).toBe(511n);
    expect(valueOf("0", 2)).toBe(0n);
  });

  it("ignores case, spaces, and underscores, and accepts a plus sign", () => {
    expect(valueOf("ff", 16)).toBe(255n);
    expect(valueOf("1111 0000", 2)).toBe(240n);
    expect(valueOf("1_000_000", 10)).toBe(1_000_000n);
    expect(valueOf("+42", 10)).toBe(42n);
  });

  it("accepts a prefix that matches the base", () => {
    expect(valueOf("0xFF", 16)).toBe(255n);
    expect(valueOf("0b1010", 2)).toBe(10n);
    expect(valueOf("0o17", 8)).toBe(15n);
    expect(valueOf("-0x10", 16)).toBe(-16n);
  });

  it("is exact for numbers far beyond what an ordinary number can hold", () => {
    expect(formatInteger(valueOf("1267650600228229401496703205376", 10), 16)).toBe("10000000000000000000000000");
    expect(formatInteger(2n ** 100n, 2)).toBe(`1${"0".repeat(100)}`);
  });

  it("writes numbers with capital letters in any base", () => {
    expect(formatInteger(255n, 16)).toBe("FF");
    expect(formatInteger(255n, 2)).toBe("11111111");
    expect(formatInteger(511n, 8)).toBe("777");
    expect(formatInteger(-10n, 2)).toBe("-1010");
    expect(formatInteger(1295n, 36)).toBe("ZZ");
  });

  it("names the digit that does not belong", () => {
    expect(parseInteger("1012", 2)).toMatchObject({ message: '"2" is not a digit in base 2.', ok: false });
    expect(parseInteger("GG", 16)).toMatchObject({ ok: false });
    expect(parseInteger("12.5", 10)).toMatchObject({ message: '"." is not a digit in base 10.', ok: false });
  });

  it("explains other problems", () => {
    expect(parseInteger("", 10)).toMatchObject({ ok: false });
    expect(parseInteger("0x", 16)).toMatchObject({ ok: false });
    expect(parseInteger("1", 1)).toMatchObject({ ok: false });
    expect(parseInteger("1", 37)).toMatchObject({ ok: false });
    expect(parseInteger("9".repeat(10_001), 10)).toMatchObject({ ok: false });
  });
});

describe("groupDigits and bitLength", () => {
  it("groups digits from the right", () => {
    expect(groupDigits("11110000", 4)).toBe("1111 0000");
    expect(groupDigits("1111000", 4)).toBe("111 1000");
    expect(groupDigits("-1234567", 3, ",")).toBe("-1,234,567");
  });

  it("counts the bits a number needs", () => {
    expect(bitLength(0n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(256n)).toBe(9);
    expect(bitLength(-255n)).toBe(8);
  });
});

describe("text and bytes", () => {
  it("writes text as UTF-8 bytes in each base", () => {
    expect(textToBytes("Hi", 16, " ", true, false)).toEqual({ ok: true, output: "48 69" });
    expect(textToBytes("Hi", 10, " ", false, false)).toEqual({ ok: true, output: "72 105" });
    expect(textToBytes("A", 2, " ", true, false)).toEqual({ ok: true, output: "01000001" });
    expect(textToBytes("A", 8, " ", true, false)).toEqual({ ok: true, output: "101" });
  });

  it("writes characters outside the basic set as several bytes", () => {
    expect(textToBytes("€", 16, " ", true, false)).toEqual({ ok: true, output: "e2 82 ac" });
    expect(textToBytes("héllo", 16, " ", true, false)).toEqual({ ok: true, output: "68 c3 a9 6c 6c 6f" });
    expect(textToBytes("é", 10, ",", false, false)).toEqual({ ok: true, output: "195,169" });
  });

  it("can use capitals, no padding, and another separator", () => {
    expect(textToBytes("€", 16, "", true, true)).toEqual({ ok: true, output: "E282AC" });
    expect(textToBytes("A", 2, " ", false, false)).toEqual({ ok: true, output: "1000001" });
    expect(textToBytes("Hi", 16, ", ", true, false)).toEqual({ ok: true, output: "48, 69" });
  });

  it("reads bytes back into text, with or without separators", () => {
    expect(bytesToText("48 69", 16)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("4869", 16)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("0x48 0x69", 16)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("0100100001101001", 2)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("72 105", 10)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("110 151", 8)).toEqual({ ok: true, output: "Hi" });
    expect(bytesToText("e2 82 ac", 16)).toEqual({ ok: true, output: "€" });
    expect(bytesToText("195,169", 10)).toEqual({ ok: true, output: "é" });
  });

  it("round-trips every base", () => {
    const text = "Héllo, wörld € 日本";

    for (const base of [2, 8, 10, 16] as const) {
      const bytes = textToBytes(text, base, " ", true, false);

      expect(bytes.ok && bytesToText(bytes.output, base)).toEqual({ ok: true, output: text });
    }
  });

  it("explains bad bytes", () => {
    expect(bytesToText("48 6", 16)).toMatchObject({ ok: true });
    expect(bytesToText("100000000", 2)).toMatchObject({ message: expect.stringContaining("Separate the bytes"), ok: false });
    expect(bytesToText("300", 10)).toMatchObject({ message: expect.stringContaining("not a byte"), ok: false });
    expect(bytesToText("zz", 16)).toMatchObject({ ok: false });
    expect(bytesToText("ff fe", 16)).toMatchObject({ message: expect.stringContaining("not valid UTF-8"), ok: false });
    expect(bytesToText("", 16)).toMatchObject({ ok: false });
    expect(textToBytes("", 16, " ", true, false)).toMatchObject({ ok: false });
  });
});

describe("Roman numerals", () => {
  it("writes the standard form", () => {
    const expected: Record<number, string> = {
      1: "I", 4: "IV", 9: "IX", 14: "XIV", 40: "XL", 49: "XLIX", 90: "XC", 400: "CD", 1994: "MCMXCIV", 2024: "MMXXIV", 3999: "MMMCMXCIX",
    };

    for (const [number, numeral] of Object.entries(expected)) {
      expect(toRoman(Number(number)), number).toEqual({ ok: true, output: numeral });
    }
  });

  it("reads them back, in capitals or lower case, for every number from 1 to 3999", () => {
    expect(fromRoman("mcmxciv")).toEqual({ ok: true, value: 1994 });

    for (let number = 1; number <= 3999; number += 1) {
      const numeral = toRoman(number);

      expect(numeral.ok && fromRoman(numeral.output)).toEqual({ ok: true, value: number });
    }
  });

  it("rejects numbers out of range and forms that are not standard", () => {
    expect(toRoman(0)).toMatchObject({ ok: false });
    expect(toRoman(4000)).toMatchObject({ ok: false });
    expect(toRoman(2.5)).toMatchObject({ ok: false });

    for (const bad of ["IIII", "VX", "IC", "XM", "IIV", "MMMM", "VV"]) {
      expect(fromRoman(bad), bad).toMatchObject({ ok: false });
    }

    expect(fromRoman("ABC")).toMatchObject({ message: expect.stringContaining("only the letters"), ok: false });
    expect(fromRoman("")).toMatchObject({ ok: false });
  });
});
