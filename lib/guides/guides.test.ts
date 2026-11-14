// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getGuideBySlug, getGuides, guidePath, latestGuideUpdate } from "@/lib/guides/guides";
import type { Guide } from "@/lib/guides/guide-types";
import { getToolExtras } from "@/lib/tools/tool-extras";
import { getToolBySlug } from "@/lib/tools/tool-registry";

const MAX_TITLE_WITH_BRAND = 62;
const BRAND_SUFFIX_LENGTH = " | QuicklySorted".length;
/** A guide earns its place by going further than a tool page, which has about 490 words. */
const MIN_WORDS = 800;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SITE_PAGES = new Set(["/", "/about", "/categories", "/character-limits", "/guides", "/privacy", "/terms"]);

/**
 * Every piece of text a guide shows, in reading order.
 */
function guideText(guide: Guide): string[] {
  return [
    guide.intro,
    ...guide.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => {
        switch (block.kind) {
          case "paragraph":
            return [block.text];
          case "list":
            return [...block.items];
          case "code":
            return [block.label, block.text];
          case "table":
            return [block.caption, ...block.columns, ...block.rows.flat()];
        }
      }),
    ]),
    ...guide.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ];
}

const guides = getGuides();
const bySlug = guides.map((guide) => [guide.slug, guide] as const);

describe("guides", () => {
  it("have unique slugs that resolve", () => {
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);

    for (const guide of guides) {
      expect(getGuideBySlug(guide.slug)).toBe(guide);
      expect(guidePath(guide)).toBe(`/guides/${guide.slug}`);
    }

    expect(getGuideBySlug("missing")).toBeUndefined();
  });

  it.each(bySlug)("%s fits in search results and is dated", (_slug, guide) => {
    expect(guide.seoTitle.length + BRAND_SUFFIX_LENGTH).toBeLessThanOrEqual(MAX_TITLE_WITH_BRAND);
    expect(guide.metaDescription.length).toBeGreaterThanOrEqual(80);
    expect(guide.metaDescription.length).toBeLessThanOrEqual(155);
    expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(guide.updatedAt))).toBe(false);
  });

  it.each(bySlug)("%s has real depth, sources, and well formed blocks", (_slug, guide) => {
    const words = guideText(guide).join(" ").split(/\s+/).filter(Boolean).length;

    expect(words).toBeGreaterThanOrEqual(MIN_WORDS);
    expect(guide.sources.length).toBeGreaterThanOrEqual(2);
    guide.sources.forEach((source) => expect(source.url).toMatch(/^https:\/\//));
    expect(new Set(guide.sections.map((section) => section.id)).size).toBe(guide.sections.length);
    expect(guide.faqs.length).toBeGreaterThanOrEqual(3);
    guide.faqs.forEach((faq) => expect(faq.question.endsWith("?"), faq.question).toBe(true));

    for (const block of guide.sections.flatMap((section) => section.blocks)) {
      if (block.kind === "table") {
        block.rows.forEach((row) => expect(row, block.caption).toHaveLength(block.columns.length));
      }
    }
  });

  it.each(bySlug)("%s has no placeholders or long dashes", (_slug, guide) => {
    const text = guideText(guide).join(" ");

    expect(text).not.toMatch(/lorem|todo|tbd|xxx/i);
    expect(text).not.toMatch(/[–—]/);
  });

  it.each(bySlug)("%s links only to pages that exist", (_slug, guide) => {
    for (const [, , href] of guideText(guide).join(" ").matchAll(LINK_PATTERN)) {
      if (href?.startsWith("/tools/")) {
        expect(getToolBySlug(href.slice("/tools/".length))?.status, href).toBe("available");
      } else if (href?.startsWith("/")) {
        expect(SITE_PAGES.has(href) || guides.some((other) => guidePath(other) === href), href).toBe(true);
      } else {
        expect(href, guide.slug).toMatch(/^https:\/\//);
      }
    }
  });

  it("pair with a live tool that links back to the guide", () => {
    for (const guide of guides) {
      const tool = getToolBySlug(guide.toolSlug);

      expect(tool?.status, guide.slug).toBe("available");
      expect(getToolExtras(tool?.id ?? "")?.seeAlso?.href, guide.slug).toBe(guidePath(guide));
    }
  });

  it("reports the latest checked date", () => {
    expect(latestGuideUpdate()).toBe(guides.map((guide) => guide.updatedAt).sort().at(-1));
  });
});
