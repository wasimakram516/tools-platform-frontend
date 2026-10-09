// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildNavData } from "@/lib/nav-data";
import { getFeaturedTools, getTools } from "@/lib/tools/tool-registry";

describe("buildNavData", () => {
  const data = buildNavData();

  it("lists every available tool once, grouped under its category", () => {
    const listed = data.categories.flatMap((category) => category.tools.map((tool) => tool.href));
    const available = getTools().filter((tool) => tool.status === "available");

    expect(listed.sort()).toEqual(available.map((tool) => `/tools/${tool.slug}`).sort());
  });

  it("leaves out categories with nothing to open", () => {
    expect(data.categories.every((category) => category.tools.length > 0)).toBe(true);
  });

  it("lists the popular tools from the registry, with no list of its own to keep up to date", () => {
    expect(data.popular.map((tool) => tool.href)).toEqual(getFeaturedTools().map((tool) => `/tools/${tool.slug}`));
    expect(data.popular.length).toBeGreaterThan(0);
  });
});
