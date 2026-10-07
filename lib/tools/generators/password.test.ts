// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  AMBIGUOUS,
  DIGITS,
  generatePassphrases,
  generatePasswords,
  generatePins,
  generateTokens,
  isPatternedPin,
  LOWERCASE,
  MAX_GENERATED,
  strengthOf,
  SYMBOLS,
  UPPERCASE,
  type PasswordOptions,
} from "@/lib/tools/generators/password";
import { PASSPHRASE_WORDS } from "@/lib/tools/generators/word-list";

const OPTIONS: PasswordOptions = {
  digits: true,
  excludeAmbiguous: false,
  excludeCharacters: "",
  length: 16,
  lowercase: true,
  requireEachKind: true,
  symbols: false,
  uppercase: true,
};

/**
 * Returns the values of a successful result, or fails the test.
 */
function valuesOf(result: ReturnType<typeof generatePasswords>): string[] {
  if (!result.ok) {
    throw new Error(`Expected success but got: ${result.message}`);
  }

  return result.values;
}

describe("word list", () => {
  it("holds 1,296 unique, typeable words", () => {
    expect(PASSPHRASE_WORDS).toHaveLength(1296);
    expect(new Set(PASSPHRASE_WORDS).size).toBe(1296);
    expect(PASSPHRASE_WORDS.every((word) => /^[a-z]+(-[a-z]+)?$/.test(word))).toBe(true);
  });
});

describe("generatePasswords", () => {
  it("makes passwords of the right length from the chosen characters only", () => {
    const passwords = valuesOf(generatePasswords({ ...OPTIONS, symbols: true, length: 24 }, 30));

    expect(passwords).toHaveLength(30);

    for (const password of passwords) {
      expect(password).toHaveLength(24);
      expect([...password].every((character) => (LOWERCASE + UPPERCASE + DIGITS + SYMBOLS).includes(character))).toBe(true);
    }
  });

  it("includes every chosen kind of character when asked, even in the shortest passwords", () => {
    for (const password of valuesOf(generatePasswords({ ...OPTIONS, length: 4, symbols: true, lowercase: true, uppercase: true, digits: false }, 40))) {
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect([...password].some((character) => SYMBOLS.includes(character))).toBe(true);
    }
  });

  it("never uses characters that look alike, or ones the person excluded", () => {
    const passwords = valuesOf(
      generatePasswords({ ...OPTIONS, excludeAmbiguous: true, excludeCharacters: "aeiouAEIOU", length: 64, symbols: true }, 40),
    );

    for (const password of passwords) {
      for (const character of AMBIGUOUS + "aeiouAEIOU") {
        expect(password.includes(character)).toBe(false);
      }
    }
  });

  it("estimates entropy as length times the log of the pool size", () => {
    // 26 + 26 + 10 = 62 characters: 16 * log2(62) = 95.267..., checked with Python's math.log2.
    expect(generatePasswords(OPTIONS, 1)).toMatchObject({ entropyBits: 95.3, ok: true });
    // Digits only: 10 characters, 8 * log2(10) = 26.57...
    expect(generatePasswords({ ...OPTIONS, length: 8, lowercase: false, uppercase: false }, 1)).toMatchObject({ entropyBits: 26.6 });
    // Six of the look-alike characters (I, l, 1, O, 0, o) are in this pool, which leaves 56:
    // 16 * log2(56) = 92.92, checked with Python.
    expect(generatePasswords({ ...OPTIONS, excludeAmbiguous: true }, 1)).toMatchObject({ entropyBits: 92.9 });
  });

  it("makes different passwords each time", () => {
    expect(new Set(valuesOf(generatePasswords({ ...OPTIONS, length: 20 }, 50))).size).toBe(50);
  });

  it("explains every way the request can be wrong", () => {
    expect(generatePasswords({ ...OPTIONS, lowercase: false, uppercase: false, digits: false }, 1)).toEqual({
      message: "Choose at least one kind of character.",
      ok: false,
    });
    expect(generatePasswords({ ...OPTIONS, length: 3 }, 1)).toMatchObject({ ok: false });
    expect(generatePasswords({ ...OPTIONS, length: 129 }, 1)).toMatchObject({ ok: false });
    expect(generatePasswords({ ...OPTIONS, length: 8.5 }, 1)).toMatchObject({ ok: false });
    expect(generatePasswords(OPTIONS, 0)).toMatchObject({ ok: false });
    expect(generatePasswords(OPTIONS, MAX_GENERATED + 1)).toMatchObject({ ok: false });
    expect(
      generatePasswords({ ...OPTIONS, digits: false, lowercase: false, excludeCharacters: UPPERCASE }, 1),
    ).toEqual({ message: "Every character of the kinds you chose was excluded. Allow some back in.", ok: false });
  });
});

describe("generatePassphrases", () => {
  const PHRASE = { capitalize: false, includeNumber: false, separator: "-", words: 4 };

  it("joins random words from the list", () => {
    const result = generatePassphrases(PHRASE, 20);

    if (!result.ok) {
      throw new Error(result.message);
    }

    for (const phrase of result.values) {
      const words = phrase.split("-");

      expect(words).toHaveLength(4);
      expect(words.every((word) => PASSPHRASE_WORDS.includes(word))).toBe(true);
    }
  });

  it("can capitalise, change the separator, and add a number", () => {
    // A source that always draws 0 picks the first word, "aardvark", and the number 0.
    expect(generatePassphrases(PHRASE, 1, () => 0)).toMatchObject({ values: ["aardvark-aardvark-aardvark-aardvark"] });
    expect(generatePassphrases({ ...PHRASE, capitalize: true, separator: " " }, 1, () => 0)).toMatchObject({
      values: ["Aardvark Aardvark Aardvark Aardvark"],
    });
    expect(generatePassphrases({ ...PHRASE, includeNumber: true, separator: "." }, 1, () => 0)).toMatchObject({
      values: ["aardvark.aardvark.aardvark.aardvark.0"],
    });
  });

  it("estimates entropy from the list size, 10.34 bits a word, plus 6.64 for a number", () => {
    // Checked with Python: 4 * log2(1296) = 41.36 and log2(100) = 6.64.
    expect(generatePassphrases(PHRASE, 1)).toMatchObject({ entropyBits: 41.4 });
    expect(generatePassphrases({ ...PHRASE, includeNumber: true }, 1)).toMatchObject({ entropyBits: 48 });
  });

  it("explains a bad request", () => {
    expect(generatePassphrases({ ...PHRASE, words: 2 }, 1)).toMatchObject({ ok: false });
    expect(generatePassphrases({ ...PHRASE, words: 13 }, 1)).toMatchObject({ ok: false });
    expect(generatePassphrases({ ...PHRASE, separator: "----" }, 1)).toMatchObject({ ok: false });
  });
});

describe("generatePins", () => {
  it("makes PINs of digits only, with the right length", () => {
    const result = generatePins({ avoidPatterns: false, length: 6 }, 30);

    expect(result.ok && result.values.every((pin) => /^\d{6}$/.test(pin))).toBe(true);
    expect(result).toMatchObject({ entropyBits: 19.9 });
  });

  it("recognises obvious PINs", () => {
    expect(isPatternedPin("1111")).toBe(true);
    expect(isPatternedPin("1234")).toBe(true);
    expect(isPatternedPin("9876")).toBe(true);
    expect(isPatternedPin("1243")).toBe(false);
    expect(isPatternedPin("2580")).toBe(false);
  });

  it("draws again when a PIN is an obvious one", () => {
    // The first four draws make 1234, which is refused; the next four make 7391.
    let index = 0;
    const draws = [1, 2, 3, 4, 7, 3, 9, 1];
    const result = generatePins({ avoidPatterns: true, length: 4 }, 1, () => draws[index++] ?? 5);

    expect(result).toMatchObject({ ok: true, values: ["7391"] });
  });

  it("gives up with a message rather than looping forever", () => {
    expect(generatePins({ avoidPatterns: true, length: 4 }, 1, () => 0)).toEqual({
      message: "Could not make a PIN without an obvious pattern. Try again.",
      ok: false,
    });
  });

  it("explains a bad length", () => {
    expect(generatePins({ avoidPatterns: false, length: 2 }, 1)).toMatchObject({ ok: false });
    expect(generatePins({ avoidPatterns: false, length: 13 }, 1)).toMatchObject({ ok: false });
  });
});

describe("generateTokens", () => {
  it("makes tokens in each alphabet", () => {
    const hex = generateTokens({ alphabet: "hex", length: 32 }, 5);
    const base62 = generateTokens({ alphabet: "base62", length: 40 }, 5);
    const url = generateTokens({ alphabet: "base64url", length: 43 }, 5);

    expect(hex.ok && hex.values.every((token) => /^[0-9a-f]{32}$/.test(token))).toBe(true);
    expect(base62.ok && base62.values.every((token) => /^[0-9A-Za-z]{40}$/.test(token))).toBe(true);
    expect(url.ok && url.values.every((token) => /^[0-9A-Za-z_-]{43}$/.test(token))).toBe(true);
  });

  it("estimates entropy from the alphabet size", () => {
    // 32 hex characters is 128 bits, 40 base 62 characters is 238.2 bits, and 43 base 64 is 258 bits.
    expect(generateTokens({ alphabet: "hex", length: 32 }, 1)).toMatchObject({ entropyBits: 128 });
    expect(generateTokens({ alphabet: "base62", length: 40 }, 1)).toMatchObject({ entropyBits: 238.2 });
    expect(generateTokens({ alphabet: "base64url", length: 43 }, 1)).toMatchObject({ entropyBits: 258 });
  });

  it("explains a bad length", () => {
    expect(generateTokens({ alphabet: "hex", length: 7 }, 1)).toMatchObject({ ok: false });
    expect(generateTokens({ alphabet: "hex", length: 257 }, 1)).toMatchObject({ ok: false });
  });
});

describe("strengthOf", () => {
  it("describes the bands by entropy", () => {
    expect(strengthOf(20)).toEqual({ label: "Weak", tone: "error" });
    expect(strengthOf(40)).toEqual({ label: "Fair", tone: "warning" });
    expect(strengthOf(60)).toEqual({ label: "Good", tone: "success" });
    expect(strengthOf(80)).toEqual({ label: "Strong", tone: "success" });
    expect(strengthOf(128)).toEqual({ label: "Very strong", tone: "success" });
  });
});
