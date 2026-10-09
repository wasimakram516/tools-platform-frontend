import { describe, expect, it } from "vitest";
import { buildSitemap, MAX_SITEMAP_URLS, type SitemapInput } from "@/lib/tools/seo/sitemap";

const BASE: SitemapInput = { changeFrequency: "", lastModified: "", priority: "", urls: "" };

const messages = (input: Partial<SitemapInput>): string[] =>
  buildSitemap({ ...BASE, ...input }).issues.map((issue) => `${issue.level}: ${issue.message}`);

describe("buildSitemap", () => {
  it("writes a sitemap in the standard format", () => {
    const result = buildSitemap({ ...BASE, urls: "https://example.com/\nhttps://example.com/about" });

    expect(result.xml).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "  <url>",
        "    <loc>https://example.com/</loc>",
        "  </url>",
        "  <url>",
        "    <loc>https://example.com/about</loc>",
        "  </url>",
        "</urlset>",
      ].join("\n"),
    );
    expect(result.count).toBe(2);
  });

  it("produces XML that a real XML reader accepts, including addresses with symbols", () => {
    const { xml } = buildSitemap({ ...BASE, urls: "https://example.com/a?x=1&y=2\nhttps://example.com/it's" });
    const document = new DOMParser().parseFromString(xml, "application/xml");

    expect(document.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(Array.from(document.getElementsByTagName("loc")).map((node) => node.textContent)).toEqual([
      "https://example.com/a?x=1&y=2",
      "https://example.com/it's",
    ]);
    expect(xml).toContain("a?x=1&amp;y=2");
  });

  it("adds the date, frequency, and priority to every address, with the right order", () => {
    const { xml } = buildSitemap({ changeFrequency: "weekly", lastModified: "2026-10-09", priority: "0.8", urls: "https://example.com/" });

    expect(xml).toContain("<loc>https://example.com/</loc>\n    <lastmod>2026-10-09</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>");
  });

  it("skips blank lines, removes repeats, and drops the part after #", () => {
    const result = buildSitemap({ ...BASE, urls: "https://example.com/a\n\nhttps://example.com/a\nhttps://example.com/b#top\nhttps://example.com/b" });

    expect(result.count).toBe(2);
    expect(result.issues.map((issue) => issue.message)).toEqual([
      "2 repeated addresses were left out.",
      "The part after # was removed from 1 address, because it does not change which page is meant.",
    ]);
  });

  it("reports addresses that are not full web addresses, and ones from another site", () => {
    expect(messages({ urls: "https://example.com/a\n/relative" })[0]).toContain('Line 2: "/relative" is not a full web address');
    expect(messages({ urls: "ftp://example.com/file" })[0]).toContain("only http and https");
    expect(messages({ urls: "https://example.com/a\nhttps://other.com/b" })[0]).toContain("other.com is a different site from example.com");
    expect(buildSitemap({ ...BASE, urls: "https://example.com/a\n/relative" }).xml).toBe("");
  });

  it("asks for addresses when the list is empty", () => {
    expect(messages({ urls: "  \n " })[0]).toContain("Add some addresses");
  });

  it("checks the date and the priority", () => {
    expect(messages({ lastModified: "09/10/2026", urls: "https://example.com/" })[0]).toContain("YYYY-MM-DD");
    expect(messages({ lastModified: "2026-13-45", urls: "https://example.com/" })[0]).toContain("YYYY-MM-DD");
    expect(messages({ priority: "2", urls: "https://example.com/" })[0]).toContain("from 0 to 1");
    expect(messages({ priority: "0.5", urls: "https://example.com/" })).toEqual(["warning: Google ignores the change frequency and priority hints. They are harmless, and some other search engines read them."]);
  });

  it("refuses a list that is longer than one sitemap may hold", () => {
    const urls = Array.from({ length: MAX_SITEMAP_URLS + 1 }, (_, index) => `https://example.com/${index}`).join("\n");

    expect(messages({ urls })[0]).toContain("up to 50,000 addresses");
  });
});
