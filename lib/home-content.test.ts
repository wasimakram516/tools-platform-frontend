// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ABOUT_PARAGRAPHS, FAQ_ITEMS, REASONS, USE_CASES } from "@/lib/home-content";
import { getToolBySlug } from "@/lib/tools/tool-registry";
import { faqJsonLd } from "@/lib/seo";
import { MAX_BATCH_FILES, MAX_IMAGE_FILE_BYTES } from "@/lib/tools/image/format";
import { MAX_TEXT_TOOL_CHARACTERS } from "@/lib/tools/text/text-stats";

describe("home page content", () => {
  it("gives every item an id, and the ids are unique", () => {
    for (const items of [USE_CASES, REASONS, FAQ_ITEMS]) {
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    }
  });

  it("has real text everywhere, with no leftover placeholders", () => {
    const text = [
      ...ABOUT_PARAGRAPHS,
      ...USE_CASES.flatMap((group) => [group.title, ...group.links.map((link) => link.label)]),
      ...REASONS.flatMap((item) => [item.title, item.description]),
      ...FAQ_ITEMS.flatMap((item) => [item.question, item.answer]),
    ];

    for (const entry of text) {
      expect(entry.trim().length).toBeGreaterThanOrEqual(8);
      expect(entry).not.toMatch(/lorem|todo|tbd|xxx/i);
    }
  });

  it("states the limits that the code actually enforces", () => {
    const limits = FAQ_ITEMS.find((item) => item.id === "limits")?.answer ?? "";

    expect(limits).toContain(MAX_TEXT_TOOL_CHARACTERS.toLocaleString("en-US"));
    expect(limits).toContain(`${MAX_IMAGE_FILE_BYTES / 1024 / 1024} MB`);
    expect(limits).toContain(String(MAX_BATCH_FILES));
  });

  it("never promises that every tool will always avoid a server, only what holds today", () => {
    const privacy = FAQ_ITEMS.find((item) => item.id === "privacy")?.answer ?? "";

    expect(privacy).toContain("available today");
    expect(privacy).toContain("will say so");
  });

  it("is sent to search engines as FAQ structured data that matches the page word for word", () => {
    const data = faqJsonLd(FAQ_ITEMS) as {
      "@type": string;
      mainEntity: { acceptedAnswer: { text: string }; name: string }[];
    };

    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(FAQ_ITEMS.length);
    FAQ_ITEMS.forEach((item, index) => {
      expect(data.mainEntity[index]?.name).toBe(item.question);
      expect(data.mainEntity[index]?.acceptedAnswer.text).toBe(item.answer);
    });
  });

  it("links every use case to a live tool, so there are no dead links on the home page", () => {
    for (const group of USE_CASES) {
      expect(group.links.length).toBeGreaterThanOrEqual(3);

      for (const link of group.links) {
        expect(getToolBySlug(link.slug)?.status, `${link.label} -> ${link.slug}`).toBe("available");
      }
    }
  });
});
