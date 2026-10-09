// @vitest-environment node
import { describe, expect, it } from "vitest";
import { CATEGORY_CONTENT } from "@/lib/tools/category-content";
import { getAvailableToolCategories } from "@/lib/tools/tool-registry";

describe("category content", () => {
  it("covers every available category, and only those", () => {
    expect(Object.keys(CATEGORY_CONTENT).sort()).toEqual(
      getAvailableToolCategories()
        .map((category) => category.id)
        .sort(),
    );
  });

  it("has an intro and a description of a sensible length for each", () => {
    for (const [id, content] of Object.entries(CATEGORY_CONTENT)) {
      expect(content.intro.length, `${id} intro`).toBeGreaterThanOrEqual(80);
      expect(content.metaDescription.length, `${id} description`).toBeGreaterThanOrEqual(80);
      expect(content.metaDescription.length, `${id} description`).toBeLessThanOrEqual(165);
    }
  });

  it("does not describe tools that do not exist yet", () => {
    const text = JSON.stringify(CATEGORY_CONTENT).toLowerCase();

    for (const promise of ["business day", "time zone difference", "csv", "yaml", "xml", "meta tag", "sitemap"]) {
      expect(text, promise).not.toContain(promise);
    }
  });
});
