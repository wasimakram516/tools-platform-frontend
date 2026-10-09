import { describe, expect, it } from "vitest";
import {
  getAvailableToolCategories,
  getFeaturedTools,
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
    expect(getToolsByCategory("developer").length).toBeGreaterThan(0);
    expect(getToolsByCategory("developer").every((tool) => tool.categoryId === "developer")).toBe(true);
  });

  it("separates live categories from planned ones", () => {
    const available = getAvailableToolCategories();
    const planned = getToolCategories().filter((category) => category.status === "planned");

    expect(available.length).toBeGreaterThan(0);
    // A live category must have something to open, and a planned one must not offer tools yet.
    for (const category of available) {
      expect(getToolsByCategory(category.id).some((tool) => tool.status === "available")).toBe(true);
    }
    for (const category of planned) {
      expect(getToolsByCategory(category.id).some((tool) => tool.status === "available")).toBe(false);
    }
  });

  it("resolves a tool and its related tools", () => {
    const tool = getToolBySlug("json-formatter");

    expect(tool?.status).toBe("available");
    expect(getToolBySlug("base64-encoder-decoder")?.status).toBe("available");
    expect(getToolBySlug("url-encoder-decoder")?.status).toBe("available");
    expect(getToolBySlug("uuid-generator")?.status).toBe("available");
    expect(getToolBySlug("jwt-decoder")?.status).toBe("available");
    expect(tool ? getRelatedTools(tool).map((relatedTool) => relatedTool.id) : []).toEqual([
      "DEV-04",
      "DEV-05",
      "DEV-02",
      "DAT-01",
      "DAT-05",
    ]);
  });

  it("returns undefined for unknown public slugs", () => {
    expect(getToolBySlug("missing-tool")).toBeUndefined();
    expect(getToolCategoryBySlug("missing-category")).toBeUndefined();
  });

  it("keeps the homepage's popular tools few, available, and spread over categories", () => {
    const featured = getFeaturedTools();

    // A short row: at least one, and no more than a few rows of the grid.
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThanOrEqual(9);
    expect(featured.every((tool) => tool.status === "available")).toBe(true);
    expect(new Set(featured.map((tool) => tool.categoryId)).size).toBeGreaterThan(1);
  });
});
