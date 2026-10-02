import { describe, expect, it } from "vitest";
import {
  getRelatedTools,
  getToolBySlug,
  getToolCategories,
  getToolCategoryById,
  getToolCategoryBySlug,
  getTools,
  getToolsByCategory,
} from "./tool-registry";

describe("tool registry", () => {
  it("keeps category and tool slugs unique", () => {
    const categorySlugs = getToolCategories().map((category) => category.slug);
    const toolSlugs = getTools().map((tool) => tool.slug);

    expect(new Set(categorySlugs).size).toBe(categorySlugs.length);
    expect(new Set(toolSlugs).size).toBe(toolSlugs.length);
  });

  it("resolves categories and their tools", () => {
    const category = getToolCategoryBySlug("developer-tools");

    expect(category?.name).toBe("Developer tools");
    expect(getToolCategoryById("developer")?.slug).toBe("developer-tools");
    expect(getToolsByCategory("developer")).toHaveLength(5);
  });

  it("resolves a tool and its related tools", () => {
    const tool = getToolBySlug("json-formatter");

    expect(tool?.status).toBe("available");
    expect(getToolBySlug("base64-encoder-decoder")?.status).toBe("available");
    expect(tool ? getRelatedTools(tool).map((relatedTool) => relatedTool.id) : []).toEqual([
      "DEV-04",
      "DEV-05",
      "DEV-02",
    ]);
  });

  it("returns undefined for unknown public slugs", () => {
    expect(getToolBySlug("missing-tool")).toBeUndefined();
    expect(getToolCategoryBySlug("missing-category")).toBeUndefined();
  });
});
