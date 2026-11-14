// @vitest-environment node
import { describe, expect, it } from "vitest";
import { MAX_GUIDE_RESULTS, searchGuides, type SearchableGuide } from "@/lib/guides/guide-search";
import { getSearchableGuides } from "@/lib/guides/guides";

const guides = getSearchableGuides();

/**
 * The addresses of the guides a search finds, best first.
 */
function found(query: string): string[] {
  return searchGuides(guides, query).map((guide) => guide.href);
}

describe("searchGuides", () => {
  it.each([
    ["jwt", "/guides/jwt-claims"],
    ["jwt exp claim", "/guides/jwt-claims"],
    ["excel serial number", "/guides/excel-date-serial-numbers"],
    ["utm source", "/guides/utm-parameters"],
    ["qr error correction", "/guides/qr-code-error-correction"],
    ["sha256", "/guides/sha-1-vs-sha-256-vs-sha-512"],
    ["sha 256", "/guides/sha-1-vs-sha-256-vs-sha-512"],
    ["regex cheat sheet", "/guides/javascript-regex-cheat-sheet"],
    ["lookbehind", "/guides/javascript-regex-cheat-sheet"],
    ["instagram caption", "/character-limits"],
    ["sms length", "/character-limits"],
  ])("finds the right guide for %s", (query, href) => {
    expect(found(query)[0]).toBe(href);
  });

  it("finds nothing for an empty search, filler words alone, or something no guide covers", () => {
    expect(found("")).toEqual([]);
    expect(found("   ")).toEqual([]);
    expect(found("compress an image")).toEqual([]);
  });

  it("needs every word to match, so a guide is never a loose suggestion", () => {
    expect(found("jwt instagram")).toEqual([]);
  });

  it("lists at most a few guides and ranks a match in the name first", () => {
    const many: SearchableGuide[] = Array.from({ length: MAX_GUIDE_RESULTS + 2 }, (_, index) => ({
      description: "About tokens.",
      href: `/guides/g${index}`,
      name: index === 3 ? "Token guide" : `Guide ${index}`,
      terms: "",
    }));

    const result = searchGuides(many, "token");

    expect(result).toHaveLength(MAX_GUIDE_RESULTS);
    expect(result[0]?.href).toBe("/guides/g3");
  });
});
