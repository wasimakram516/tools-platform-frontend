import { describe, expect, it } from "vitest";
import { MAX_JSON_INPUT_CHARACTERS, transformJson } from "./json-formatter";

describe("transformJson", () => {
  it("formats valid JSON with the selected indentation", () => {
    const result = transformJson('{"name":"Wisemen","active":true}', "format", 4);

    expect(result).toEqual({
      ok: true,
      output: '{\n    "name": "Wisemen",\n    "active": true\n}',
      characterCount: 45,
    });
  });

  it("minifies valid JSON", () => {
    const result = transformJson('{\n  "items": [1, 2]\n}', "minify");

    expect(result).toEqual({
      ok: true,
      output: '{"items":[1,2]}',
      characterCount: 15,
    });
  });

  it("accepts valid JSON primitive values", () => {
    expect(transformJson("null", "format")).toEqual({
      ok: true,
      output: "null",
      characterCount: 4,
    });
  });

  it("rejects empty input with actionable guidance", () => {
    expect(transformJson("  ", "format")).toEqual({
      ok: false,
      message: "Enter JSON to format or validate.",
    });
  });

  it("returns parser context for invalid JSON", () => {
    const result = transformJson('{"name": }', "format");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("rejects input beyond the local-processing limit", () => {
    const result = transformJson(`"${"a".repeat(MAX_JSON_INPUT_CHARACTERS)}"`, "format");

    expect(result).toEqual({
      ok: false,
      message: "This JSON exceeds the 5 million character local-processing limit.",
    });
  });
});
