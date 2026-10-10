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
      "DAT-05",
      "DAT-01",
      "DAT-03",
      "DEV-02",
      "DEV-04",
    ]);
  });

  it("links each tool to a few real, different tools, and leaves none without a link in", () => {
    const available = getTools().filter((tool) => tool.status === "available");
    const linkedTo = new Set<string>();

    for (const tool of available) {
      const related = getRelatedTools(tool);

      expect(related.length, tool.id).toBeGreaterThanOrEqual(2);
      expect(related.length, tool.id).toBeLessThanOrEqual(5);
      expect(new Set(tool.relatedToolIds).size, `${tool.id} repeats a tool`).toBe(tool.relatedToolIds.length);
      expect(tool.relatedToolIds, `${tool.id} links to itself`).not.toContain(tool.id);
      expect(related.length, `${tool.id} links to a tool that does not exist`).toBe(tool.relatedToolIds.length);
      related.forEach((relatedTool) => linkedTo.add(relatedTool.id));
    }

    for (const tool of available) {
      expect(linkedTo.has(tool.id), `${tool.id} is not linked from any other tool`).toBe(true);
    }
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
