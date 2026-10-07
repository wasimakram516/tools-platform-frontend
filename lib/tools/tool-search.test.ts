// @vitest-environment node
import { describe, expect, it } from "vitest";
import { searchTools } from "@/lib/tools/tool-search";
import type { ToolDefinition } from "@/types/tool";

function tool(overrides: Partial<ToolDefinition> & Pick<ToolDefinition, "id" | "name">): ToolDefinition {
  return {
    categoryId: "developer",
    description: "",
    icon: "json",
    keywords: [],
    processingMode: "browser",
    relatedToolIds: [],
    shortDescription: "",
    slug: overrides.id.toLowerCase(),
    status: "available",
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

  it("requires every word to match", () => {
    expect(ids("excel date")).toEqual(["C"]);
    expect(ids("excel hash")).toEqual([]);
  });

  it("ranks name matches above description matches", () => {
    // "date" is in the name of C, the description of D, and the category of B, C, and D.
    expect(ids("date")).toEqual(["C", "D", "B"]);
  });

  it("matches the category name", () => {
    expect(ids("developer")).toEqual(["A"]);
  });
});
