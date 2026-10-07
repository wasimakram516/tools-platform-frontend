// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  findMatchingAlgorithms,
  hashText,
  MAX_HASH_INPUT_CHARACTERS,
  MAX_HMAC_KEY_CHARACTERS,
  type HashSet,
} from "@/lib/tools/hash-generator";

// Expected values were computed independently with Python's hashlib.
const HELLO: HashSet = {
  "SHA-1": "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
  "SHA-256": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "SHA-384":
    "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f",
  "SHA-512":
    "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
};

describe("hashText", () => {
  it("returns every SHA hash of the text", async () => {
    expect(await hashText("hello")).toEqual({ hashes: HELLO, ok: true });
  });

  it("reads the text as UTF-8", async () => {
    const result = await hashText("héllo ✓");

    expect(result.ok && result.hashes["SHA-1"]).toBe("b7c2a1aa52961195ac19331417a20a8b4f202ddb");
    expect(result.ok && result.hashes["SHA-256"]).toBe(
      "5657cdef8a85a584e0e961e6f8247cf5d3f8ed21496ed6fdbcfd43a761e94245",
    );
  });

  it("hashes the empty string", async () => {
    const result = await hashText("");

    expect(result.ok && result.hashes["SHA-256"]).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("refuses text over the limit without hashing it", async () => {
    const result = await hashText("a".repeat(MAX_HASH_INPUT_CHARACTERS + 1));

    expect(result).toEqual({ message: "Text is limited to 1,000,000 characters.", ok: false });
  });

  it("explains when the browser has no Web Crypto", async () => {
    const result = await hashText("hello", "", null);

    expect(result).toMatchObject({ ok: false });
    expect(!result.ok && result.message).toContain("cannot hash");
  });

  it("reports a failing digest instead of throwing", async () => {
    const result = await hashText("hello", "", () => Promise.reject(new Error("boom")));

    expect(result).toEqual({ message: "The text could not be hashed. Try again.", ok: false });
  });
});

describe("hashText with a secret key", () => {
  it("returns the HMAC of the text for every algorithm", async () => {
    // Expected values were computed independently with Python's hmac module.
    expect(await hashText("hello", "secret")).toEqual({
      hashes: {
        "SHA-1": "5112055c05f944f85755efc5cd8970e194e9f45b",
        "SHA-256": "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b",
        "SHA-384":
          "7e1e620ca0068fd1fce00c1ad3f5c6dbb12874dd2fb9c26502d09d0d804f2c0ba1d921b9458416cba480417571001e18",
        "SHA-512":
          "db1595ae88a62fd151ec1cba81b98c39df82daae7b4cb9820f446d5bf02f1dcfca6683d88cab3e273f5963ab8ec469a746b5b19086371239f67d1e5f99a79440",
      },
      ok: true,
    });
  });

  it("reads the key and the text as UTF-8", async () => {
    const result = await hashText("héllo ✓", "kéy");

    expect(result.ok && result.hashes["SHA-256"]).toBe(
      "875271b6e5b8121b77087d5896d9f408a245a55efc4b32991b627f8db0ce2173",
    );
  });

  it("treats an empty key as a plain hash", async () => {
    expect(await hashText("hello", "")).toEqual({ hashes: HELLO, ok: true });
  });

  it("refuses a key over the limit", async () => {
    const result = await hashText("hello", "k".repeat(MAX_HMAC_KEY_CHARACTERS + 1));

    expect(result).toEqual({ message: "The secret key is limited to 10,000 characters.", ok: false });
  });
});

describe("findMatchingAlgorithms", () => {
  it("matches a pasted checksum whatever its case or spacing", () => {
    expect(findMatchingAlgorithms(HELLO, `  ${HELLO["SHA-256"].toUpperCase()} \n`)).toEqual(["SHA-256"]);
  });

  it("returns nothing for a different or empty checksum", () => {
    expect(findMatchingAlgorithms(HELLO, "abc123")).toEqual([]);
    expect(findMatchingAlgorithms(HELLO, "   ")).toEqual([]);
  });
});
