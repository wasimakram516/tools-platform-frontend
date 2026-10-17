import { describe, expect, it } from "vitest";
import {
  buildHighlightSegments,
  MAX_REGEX_MATCHES,
  MAX_REGEX_PATTERN_CHARACTERS,
  MAX_REGEX_TEXT_CHARACTERS,
  normalizeFlags,
  runRegex,
  type RegexRequest,
} from "./regex-tester";

/**
 * Builds a request with sensible defaults so each test names only what it cares about.
 */
function request(overrides: Partial<RegexRequest>): RegexRequest {
  return { flags: "g", pattern: "a", replacement: "", text: "", ...overrides };
}

describe("normalizeFlags", () => {
  it("keeps supported flags once, in standard order", () => {
    expect(normalizeFlags("uigxg")).toBe("giu");
  });
});

describe("runRegex", () => {
  it("lists every match with its position", () => {
    const result = runRegex(request({ pattern: "\\d+", text: "a1 b22 c333" }));

    expect(result.ok && result.matches.map((match) => [match.value, match.index])).toEqual([
      ["1", 1],
      ["22", 5],
      ["333", 9],
    ]);
  });

  it("returns only the first match without the global flag", () => {
    const result = runRegex(request({ flags: "", pattern: "\\d", text: "1 2 3" }));

    expect(result.ok && result.matches).toHaveLength(1);
  });

  it("reports numbered and named groups, and null for a group that did not take part", () => {
    const result = runRegex(request({ pattern: "(?<year>\\d{4})-(\\d{2})(-(\\d{2}))?", text: "2026-10" }));

    expect(result.ok && result.matches[0]?.groups).toEqual(["2026", "10", null, null]);
    expect(result.ok && result.matches[0]?.namedGroups).toEqual({ year: "2026" });
  });

  it("honours the case insensitive flag", () => {
    const result = runRegex(request({ flags: "gi", pattern: "hello", text: "Hello HELLO" }));

    expect(result.ok && result.matches).toHaveLength(2);
  });

  it("does not loop forever on a pattern that can match nothing", () => {
    const result = runRegex(request({ pattern: "x*", text: "abc" }));

    expect(result.ok && result.matches).toHaveLength(4);
  });

  it("explains a syntax error", () => {
    const result = runRegex(request({ pattern: "(unclosed", text: "text" }));

    expect(result.ok).toBe(false);
    expect(!result.ok && result.message.length).toBeGreaterThan(0);
  });

  it("asks for a pattern when it is empty", () => {
    expect(runRegex(request({ pattern: "" }))).toEqual({ message: "Type a pattern to test.", ok: false });
  });

  it("previews a replacement using groups", () => {
    const result = runRegex(
      request({ pattern: "(\\w+)@(\\w+)\\.com", replacement: "$2: $1", text: "ada@example.com" }),
    );

    expect(result.ok && result.replaced).toBe("example: ada");
  });

  it("replaces only the first match without the global flag", () => {
    const result = runRegex(request({ flags: "", pattern: "a", replacement: "b", text: "aaa" }));

    expect(result.ok && result.replaced).toBe("baa");
  });

  it("gives no replacement preview when the replacement is empty", () => {
    const result = runRegex(request({ pattern: "a", text: "aaa" }));

    expect(result.ok && result.replaced).toBeNull();
  });

  it("caps the match list and says so", () => {
    const result = runRegex(request({ pattern: "a", text: "a".repeat(MAX_REGEX_MATCHES + 5) }));

    expect(result.ok && result.matches).toHaveLength(MAX_REGEX_MATCHES);
    expect(result.ok && result.truncated).toBe(true);
  });

  it("rejects a pattern or text over the limits", () => {
    expect(runRegex(request({ pattern: "a".repeat(MAX_REGEX_PATTERN_CHARACTERS + 1) })).ok).toBe(false);
    expect(runRegex(request({ text: "a".repeat(MAX_REGEX_TEXT_CHARACTERS + 1) })).ok).toBe(false);
  });
});

describe("buildHighlightSegments", () => {
  it("splits text into plain and matched pieces", () => {
    const result = runRegex(request({ pattern: "\\d+", text: "a1b22" }));
    const segments = result.ok ? buildHighlightSegments("a1b22", result.matches) : [];

    expect(segments).toEqual([
      { matchIndex: null, text: "a" },
      { matchIndex: 0, text: "1" },
      { matchIndex: null, text: "b" },
      { matchIndex: 1, text: "22" },
    ]);
  });

  it("skips empty matches", () => {
    const result = runRegex(request({ pattern: "x*", text: "ab" }));

    expect(result.ok && buildHighlightSegments("ab", result.matches)).toEqual([{ matchIndex: null, text: "ab" }]);
  });
});
