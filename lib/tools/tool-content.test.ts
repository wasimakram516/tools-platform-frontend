// @vitest-environment node
import { describe, expect, it } from "vitest";
import { TOOL_CONTENT } from "@/lib/tools/tool-content";
import { getTools } from "@/lib/tools/tool-registry";

/** Search results show about this many characters of a title and a description. */
const MAX_TITLE_WITH_BRAND = 62;
const BRAND_SUFFIX_LENGTH = " | QuicklySorted".length;
const MAX_DESCRIPTION = 165;
const MAX_ANSWER = 420;

const available = getTools().filter((tool) => tool.status === "available");

describe("tool content", () => {
  it("covers every available tool, and only those", () => {
    expect(Object.keys(TOOL_CONTENT).sort()).toEqual(available.map((tool) => tool.id).sort());
  });

  it.each(available.map((tool) => [tool.slug, tool.id] as const))("%s has a title, description, steps, and questions of the right size", (_slug, id) => {
    const content = TOOL_CONTENT[id];

    expect(content, id).toBeDefined();
    expect((content?.seoTitle.length ?? 0) + BRAND_SUFFIX_LENGTH, `${id} title`).toBeLessThanOrEqual(MAX_TITLE_WITH_BRAND);
    expect(content?.metaDescription.length ?? 0, `${id} description`).toBeGreaterThanOrEqual(80);
    expect(content?.metaDescription.length ?? 0, `${id} description`).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(content?.steps.length ?? 0, `${id} steps`).toBeGreaterThanOrEqual(3);
    expect(content?.steps.length ?? 0, `${id} steps`).toBeLessThanOrEqual(5);
    expect(content?.faqs.length ?? 0, `${id} faqs`).toBeGreaterThanOrEqual(3);

    for (const faq of content?.faqs ?? []) {
      expect(faq.question.endsWith("?"), `${id}: ${faq.question}`).toBe(true);
      expect(faq.answer.length, `${id}: ${faq.question}`).toBeLessThanOrEqual(MAX_ANSWER);
    }
  });

  it("has no placeholder text, and no two tools share a title or description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const [id, content] of Object.entries(TOOL_CONTENT)) {
      const everything = [content.seoTitle, content.metaDescription, ...content.steps, ...content.faqs.flatMap((faq) => [faq.question, faq.answer])].join(" ");

      expect(everything, id).not.toMatch(/lorem|todo|tbd|xxx/i);
      expect(titles.has(content.seoTitle), `duplicate title ${id}`).toBe(false);
      expect(descriptions.has(content.metaDescription), `duplicate description ${id}`).toBe(false);
      titles.add(content.seoTitle);
      descriptions.add(content.metaDescription);
    }
  });

  it("makes no promise that the site never uses a server, which is not true of every future tool", () => {
    const text = JSON.stringify(TOOL_CONTENT);

    expect(text).not.toMatch(/never (use|uses|touch|touches) a server|100% private/i);
  });
});

describe("tool dates", () => {
  it("gives every tool a real date, for the sitemap", () => {
    for (const tool of getTools()) {
      expect(tool.updatedAt, tool.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(tool.updatedAt)), tool.id).toBe(false);
    }
  });
});
