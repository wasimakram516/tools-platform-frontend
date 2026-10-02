import { describe, expect, it } from "vitest";
import { MAX_BASE64_INPUT_CHARACTERS, transformBase64 } from "./base64";

describe("transformBase64", () => {
  it("encodes and decodes Unicode text as UTF-8", () => {
    const encoded = transformBase64("Tools Platform ✓ مرحبا", "encode");

    expect(encoded.ok).toBe(true);
    if (!encoded.ok) {
      return;
    }

    expect(transformBase64(encoded.output, "decode")).toEqual({
      ok: true,
      output: "Tools Platform ✓ مرحبا",
      characterCount: 22,
    });
  });

  it("decodes unpadded Base64 and ignores whitespace", () => {
    expect(transformBase64("SGVs\nbG8", "decode")).toEqual({
      ok: true,
      output: "Hello",
      characterCount: 5,
    });
  });

  it("returns mode-specific empty input errors", () => {
    expect(transformBase64("", "encode")).toMatchObject({
      ok: false,
      message: "Enter text to encode.",
    });
    expect(transformBase64("", "decode")).toMatchObject({
      ok: false,
      message: "Enter Base64 text to decode.",
    });
    expect(transformBase64("  \n", "decode")).toMatchObject({
      ok: false,
      message: "Enter Base64 text to decode.",
    });
  });

  it("rejects malformed Base64 and non-UTF-8 content", () => {
    expect(transformBase64("not base64!", "decode")).toMatchObject({
      ok: false,
      message: "Enter valid Base64 text using the standard Base64 alphabet.",
    });
    expect(transformBase64("/w==", "decode")).toMatchObject({
      ok: false,
      message: "This Base64 value does not contain valid UTF-8 text.",
    });
  });

  it("rejects input above the local processing limit", () => {
    expect(transformBase64("a".repeat(MAX_BASE64_INPUT_CHARACTERS + 1), "encode")).toMatchObject({
      ok: false,
      message: "This input exceeds the 5 million character local-processing limit.",
    });
  });
});
