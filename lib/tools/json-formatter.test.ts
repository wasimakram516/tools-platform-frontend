import { describe, expect, it } from "vitest";
import { findJsonErrorPosition } from "./json-error-location";
import { MAX_JSON_INPUT_CHARACTERS, transformJson } from "./json-formatter";

describe("transformJson error locations", () => {
  it.each([
    ["a trailing comma", '{"name": "Ada",}', 1, 16],
    ["single quotes", "{'name': 'Ada'}", 1, 2],
    ["an unquoted key", '{name: "Ada"}', 1, 2],
    ["a missing comma", '{"a": 1 "b": 2}', 1, 9],
    ["a missing colon", '{"a" 1}', 1, 6],
    ["an unterminated string", '{"a": "text', 1, 12],
    ["input that ends early", '{"a": [1, 2', 1, 12],
    ["extra text after the value", '{"a": 1} x', 1, 10],
    ["a comment", '{"a": 1 // note\n}', 1, 9],
    ["a leading zero", '{"a": 01}', 1, 8],
    ["NaN", '{"a": NaN}', 1, 7],
    ["a bad escape", '{"a": "\\q"}', 1, 9],
    ["a raw tab in a string", '{"a": "x\ty"}', 1, 9],
  ])("reports the line and column for %s", (_name, input, line, column) => {
    const result = transformJson(input, "format");

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ column, line });
  });

  it("counts lines, so an error on the third line is reported there", () => {
    const result = transformJson('{\n  "a": 1,\n  "b": ,\n  "c": 3\n}', "format");

    expect(result).toMatchObject({ column: 8, line: 3, ok: false });
  });

  it("gives a location when the browser's message has none, as in truncated input", () => {
    const result = transformJson('[1, 2,', "format");

    expect(result).toMatchObject({ column: 7, line: 1, ok: false });
  });

  it("does not repeat the location inside the message", () => {
    const result = transformJson('{"a": 1,}', "format");

    expect(result.ok === false && result.message).not.toMatch(/position|line \d+ column/i);
  });

  it("agrees with the browser about what is valid, for many damaged copies of valid JSON", () => {
    const valid = '{"a":[1,2.5e3,-0,{"b":null,"c":"x\\u00e9\\n"}],"d":true,"e":{"f":[]}}';
    const noise = ['"', ",", ":", "{", "}", "[", "]", " ", "x", "0", "-", "\\", "."];
    let seed = 7;
    const next = (limit: number): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;

      return seed % limit;
    };

    for (let round = 0; round < 600; round += 1) {
      let text = valid;

      for (let change = 0; change < 1 + next(3); change += 1) {
        const at = next(text.length);

        text =
          next(2) === 0
            ? text.slice(0, at) + (noise[next(noise.length)] ?? "") + text.slice(at)
            : text.slice(0, at) + text.slice(at + 1);
      }

      let browserAccepts = true;

      try {
        JSON.parse(text);
      } catch {
        browserAccepts = false;
      }

      expect(findJsonErrorPosition(text) === null, JSON.stringify(text)).toBe(browserAccepts);
    }
  });
});

describe("transformJson with very large numbers", () => {
  it("keeps whole numbers up to 9,007,199,254,740,991 exactly", () => {
    const result = transformJson('{"id":9007199254740991}', "minify");

    expect(result).toMatchObject({ ok: true, output: '{"id":9007199254740991}' });
  });

  it("loses digits beyond that, as the tool page warns", () => {
    const result = transformJson('{"id":9007199254740993}', "minify");

    expect(result).toMatchObject({ ok: true, output: '{"id":9007199254740992}' });
  });
});

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
