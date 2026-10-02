import { describe, expect, it } from "vitest";
import { MAX_URL_INPUT_CHARACTERS, transformUrlComponent } from "./url-encoder";

describe("transformUrlComponent", () => {
  it("encodes reserved characters, spaces, and Unicode", () => {
    expect(transformUrlComponent("search=tools platform & ✓", "encode")).toEqual({
      ok: true,
      output: "search%3Dtools%20platform%20%26%20%E2%9C%93",
      characterCount: 43,
    });
  });

  it("decodes percent-encoded URL component text", () => {
    expect(transformUrlComponent("search%3Dtools%20platform%20%26%20%E2%9C%93", "decode")).toEqual({
      ok: true,
      output: "search=tools platform & ✓",
      characterCount: 25,
    });
  });

  it("does not treat plus as a space when decoding URL components", () => {
    expect(transformUrlComponent("one+two", "decode")).toMatchObject({
      ok: true,
      output: "one+two",
    });
  });

  it("returns mode-specific empty input errors", () => {
    expect(transformUrlComponent("", "encode")).toMatchObject({
      ok: false,
      message: "Enter text to URL-encode.",
    });
    expect(transformUrlComponent("", "decode")).toMatchObject({
      ok: false,
      message: "Enter text to URL-decode.",
    });
  });

  it("returns actionable errors for malformed input", () => {
    expect(transformUrlComponent("%ZZ", "decode")).toMatchObject({
      ok: false,
      message: "Enter valid percent-encoded text. Every % must be followed by two hexadecimal characters.",
    });
    expect(transformUrlComponent("\ud800", "encode")).toMatchObject({
      ok: false,
      message: "The input contains an unmatched Unicode surrogate. Remove the invalid character and try again.",
    });
  });

  it("rejects input above the local processing limit", () => {
    expect(transformUrlComponent("a".repeat(MAX_URL_INPUT_CHARACTERS + 1), "encode")).toMatchObject({
      ok: false,
      message: "This input exceeds the 5 million character local-processing limit.",
    });
  });
});
