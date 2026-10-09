// @vitest-environment node
import { describe, expect, it } from "vitest";
import { searchTools, searchToolsDetailed } from "@/lib/tools/tool-search";
import { getToolCategoryById, getTools } from "@/lib/tools/tool-registry";
import type { ToolDefinition } from "@/types/tool";

function tool(overrides: Partial<ToolDefinition> & Pick<ToolDefinition, "id" | "name">): ToolDefinition {
  return {
    categoryId: "developer",
    description: "",
    icon: "json",
    searchTerms: [],
    keywords: [],
    processingMode: "browser",
    relatedToolIds: [],
    shortDescription: "",
    slug: overrides.id.toLowerCase(),
    status: "available",
    updatedAt: "2026-10-09",
    ...overrides,
  };
}

const TOOLS = [
  tool({ id: "A", keywords: ["sha256", "checksum"], name: "Hash Generator" }),
  tool({ id: "B", name: "Age Calculator", categoryId: "datetime", shortDescription: "Work out an exact age." }),
  tool({ id: "C", name: "Excel Date Converter", categoryId: "datetime", keywords: ["excel serial number"] }),
  tool({ id: "D", name: "Unix Timestamp Converter", categoryId: "datetime", description: "Convert a date to a timestamp." }),
];
const categoryName = (id: string): string => (id === "datetime" ? "Date and time tools" : "Developer tools");

const ids = (query: string): string[] => searchTools(TOOLS, query, categoryName).map((match) => match.id);

describe("searchTools", () => {
  it("returns nothing for an empty or blank query", () => {
    expect(ids("")).toEqual([]);
    expect(ids("   ")).toEqual([]);
  });

  it("matches the name, keywords, and descriptions without caring about case", () => {
    expect(ids("HASH")).toEqual(["A"]);
    expect(ids("checksum")).toEqual(["A"]);
    expect(ids("exact")).toEqual(["B"]);
  });

  it("ignores punctuation, so SHA-256 and sha 256 both find sha256", () => {
    expect(ids("sha 256")).toEqual(["A"]);
    expect(ids("SHA-256")).toEqual(["A"]);
  });

  it("puts tools that match every word first, then the closest partial matches", () => {
    expect(ids("excel date")).toEqual(["C"]);
    expect(ids("excel hash")).toEqual(["C", "A"]);
    expect(searchToolsDetailed(TOOLS, "excel hash", categoryName).approximate).toBe(true);
  });

  it("ranks name matches above description matches", () => {
    // "date" is in the name of C, the description of D, and the category of B, C, and D.
    expect(ids("date")).toEqual(["C", "D", "B"]);
  });

  it("matches the category name", () => {
    expect(ids("developer")).toEqual(["A"]);
  });

  it("matches the everyday words a tool lists, even when its name does not contain them", () => {
    const withTerms = [tool({ id: "I", name: "Image Tool", searchTerms: ["photo", "upload"] }), ...TOOLS];

    expect(searchTools(withTerms, "my photo is too big to upload", categoryName)[0]?.id).toBe("I");
  });

  it("ignores filler words and understands everyday synonyms", () => {
    const tools = [tool({ id: "I", name: "Image Compressor", keywords: ["compress image"] }), ...TOOLS];

    expect(searchTools(tools, "how do I make my picture smaller", categoryName).map((match) => match.id)).toEqual(["I"]);
  });

  it("does not mark a full match as approximate", () => {
    expect(searchToolsDetailed(TOOLS, "excel date", categoryName).approximate).toBe(false);
  });

  it("returns nothing, not everything, when no word matches at all", () => {
    expect(searchToolsDetailed(TOOLS, "zebra giraffe", categoryName)).toEqual({ approximate: false, tools: [] });
  });
});

describe("searchTools on the real tools", () => {
  const available = getTools().filter((entry) => entry.status === "available");
  const first = (query: string): string | undefined =>
    searchTools(available, query, (id) => getToolCategoryById(id)?.name ?? "")[0]?.slug;

  it.each([
    ["my image is too big to upload", "image-compressor-converter"],
    ["how do I make a photo smaller", "image-compressor-converter"],
    ["how old am I", "age-calculator"],
    ["excel shows a number instead of a date", "excel-date-converter"],
    ["how many words is my essay", "word-counter"],
    ["i need a strong password", "password-generator"],
    ["share my wifi with a scan", "qr-code-generator"],
    ["my list has repeated items", "remove-duplicate-lines"],
    ["make my json readable", "json-formatter"],
    ["pick a winner", "random-number-generator"],
    ["see what is inside a login token", "jwt-decoder"],
    ["turn my logo into an ico file", "favicon-generator"],
    ["split the bill with friends", "tip-and-bill-split-calculator"],
    ["monthly payment on my car loan", "loan-calculator"],
    ["compound interest on my savings", "interest-calculator"],
    ["what is my bmi", "bmi-calculator"],
    ["how much is 20 percent off", "percentage-calculator"],
    ["csv to json", "csv-json-converter"],
    ["turn a spreadsheet into json", "csv-json-converter"],
    ["convert yaml to json", "json-yaml-converter"],
    ["xml to json", "xml-json-converter"],
    ["binary to decimal", "number-base-converter"],
    ["convert miles to km", "unit-converter"],
    ["celsius to fahrenheit", "unit-converter"],
  ])("finds the right tool for %s", (query, slug) => {
    expect(first(query)).toBe(slug);
  });

  it("lists several single search words for every available tool", () => {
    for (const entry of available) {
      expect(entry.searchTerms.length, entry.slug).toBeGreaterThanOrEqual(6);

      for (const term of entry.searchTerms) {
        expect(term, `${entry.slug}: ${term}`).toMatch(/^[a-z0-9]+$/);
      }
    }
  });
});
