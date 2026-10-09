// @vitest-environment node
import { describe, expect, it } from "vitest";
import { jsonToYaml, yamlToJson } from "@/lib/tools/data/yaml-json";

/**
 * Converts YAML to JSON and returns the parsed value, failing the test if it did not work.
 */
function jsonOf(text: string): unknown {
  const result = yamlToJson(text, { indent: 2 });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return JSON.parse(result.output);
}

/**
 * Converts JSON to YAML and returns the text, failing the test if it did not work.
 */
function yamlOf(text: string, options: { indent?: number; sortKeys?: boolean } = {}): string {
  const result = jsonToYaml(text, { indent: 2, sortKeys: false, ...options });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.output;
}

// The expected values for YAML to JSON were produced by Python's PyYAML, an independent reader.
describe("yamlToJson", () => {
  it("reads maps, lists, numbers, booleans, and null", () => {
    expect(jsonOf("name: Ann\nage: 30\ntags:\n  - a\n  - b\nnested:\n  x: 1.5\n  ok: true\n  nothing: null\n")).toEqual({
      age: 30,
      name: "Ann",
      nested: { nothing: null, ok: true, x: 1.5 },
      tags: ["a", "b"],
    });
  });

  it("fills in aliases", () => {
    expect(jsonOf("a: &x [1, 2]\nb: *x\n")).toEqual({ a: [1, 2], b: [1, 2] });
  });

  it("reads block and folded text", () => {
    expect(jsonOf("text: |\n  line1\n  line2\nfolded: >\n  one\n  two\n")).toEqual({
      folded: "one two\n",
      text: "line1\nline2\n",
    });
  });

  it("keeps quoted numbers as text", () => {
    expect(jsonOf("a: \"007\"\nb: '12'\n")).toEqual({ a: "007", b: "12" });
  });

  it("reads the short bracket style, a list at the top, and a lone value", () => {
    expect(jsonOf("{a: 1, b: [x, y], c: {d: e}}")).toEqual({ a: 1, b: ["x", "y"], c: { d: "e" } });
    expect(jsonOf("- 1\n- two\n- [3, 4]\n- k: v\n")).toEqual([1, "two", [3, 4], { k: "v" }]);
    expect(jsonOf("hello")).toBe("hello");
  });

  it("turns several documents into a list and says so", () => {
    const result = yamlToJson("a: 1\n---\nb: 2\n", { indent: 2 });

    expect(result.ok && JSON.parse(result.output)).toEqual([{ a: 1 }, { b: 2 }]);
    expect(result.ok && result.summary).toContain("2 documents");
  });

  it("follows YAML 1.2, so yes and no stay text", () => {
    expect(jsonOf("answer: yes\nswitch: off\n")).toEqual({ answer: "yes", switch: "off" });
  });

  it("indents the output as asked", () => {
    const result = yamlToJson("a:\n  b: 1", { indent: 4 });

    expect(result.ok && result.output).toBe('{\n    "a": {\n        "b": 1\n    }\n}');
  });

  it("says where a mistake is", () => {
    const result = yamlToJson("a: 1\nb: [1, 2\nc: 3", { indent: 2 });

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.message).toMatch(/not valid YAML.*line \d+, column \d+/);
  });

  it("rejects a repeated key rather than quietly dropping one", () => {
    expect(yamlToJson("a: 1\na: 2", { indent: 2 }).ok).toBe(false);
  });

  it("rejects input with no data, and input that is too long", () => {
    expect(yamlToJson("   ", { indent: 2 })).toMatchObject({ ok: false });
    expect(yamlToJson("# only a comment", { indent: 2 })).toMatchObject({ message: expect.stringContaining("only comments"), ok: false });
    expect(yamlToJson("null", { indent: 2 })).toMatchObject({ ok: true, output: "null" });
    expect(yamlToJson("x".repeat(2_000_001), { indent: 2 })).toMatchObject({ ok: false });
  });

  it("is not harmed by a document that repeats an alias many times", () => {
    const bomb = `a: &a [x]\n${Array.from({ length: 150 }, (_, index) => `k${index}: *a`).join("\n")}\n`;

    expect(yamlToJson(bomb, { indent: 0 })).toMatchObject({ ok: false });
  });
});

describe("jsonToYaml", () => {
  it("writes maps and lists", () => {
    expect(yamlOf('{"a":1,"b":[1,2],"c":{"d":"x"}}')).toBe("a: 1\nb:\n  - 1\n  - 2\nc:\n  d: x");
  });

  it("quotes text only when it would otherwise read as something else", () => {
    const yaml = yamlOf('{"zip":"02134","n":"12","t":"true","nul":"null","plain":"hello","colon":"a: b","hash":"# x","empty":""}');

    expect(yaml).toContain('zip: "02134"');
    expect(yaml).toContain('n: "12"');
    expect(yaml).toContain('t: "true"');
    expect(yaml).toContain('nul: "null"');
    expect(yaml).toContain("plain: hello");
    expect(yaml).toContain('colon: "a: b"');
    expect(yaml).toContain('hash: "# x"');
    expect(yaml).toContain('empty: ""');
  });

  it("also quotes the words and numbers that older YAML 1.1 readers misread", () => {
    const yaml = yamlOf('{"a":"yes","b":"No","c":"ON","d":"off","f":"010","g":"1:20"}');

    for (const key of ["a", "b", "c", "d", "f", "g"]) {
      expect(yaml, key).toMatch(new RegExp(`${key}: ["']`));
    }
  });

  it("never folds a long line", () => {
    const long = "word ".repeat(40).trim();

    expect(yamlOf(JSON.stringify({ long }))).toBe(`long: ${long}`);
  });

  it("indents as asked and can sort the keys all the way down", () => {
    expect(yamlOf('{"b":{"z":1,"y":2},"a":1}', { indent: 4, sortKeys: true })).toBe("a: 1\nb:\n    y: 2\n    z: 1");
  });

  it("round-trips: JSON to YAML and back gives the original", () => {
    const original = {
      colon: "a: b",
      empty: "",
      list: [1, "two", null, true],
      multi: "l1\nl2",
      n: "12",
      nested: { a: { b: [] } },
      num: 3,
      yes: "yes",
      zip: "02134",
    };

    expect(jsonOf(yamlOf(JSON.stringify(original)))).toEqual(original);
  });

  it("explains problems", () => {
    expect(jsonToYaml("", { indent: 2, sortKeys: false })).toMatchObject({ ok: false });
    expect(jsonToYaml("{oops", { indent: 2, sortKeys: false })).toMatchObject({
      message: expect.stringContaining("not valid JSON"),
      ok: false,
    });
  });
});
