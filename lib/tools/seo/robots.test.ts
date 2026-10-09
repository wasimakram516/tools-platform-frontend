// @vitest-environment node
import { describe, expect, it } from "vitest";
import { AI_SEARCH_CRAWLERS, AI_TRAINING_CRAWLERS, buildRobotsTxt, type RobotsInput } from "@/lib/tools/seo/robots";

const BASE: RobotsInput = {
  allowPaths: "",
  blockAiSearch: false,
  blockAiTraining: false,
  blockEverything: false,
  crawlDelay: "",
  disallowPaths: "",
  sitemaps: "",
};

const errors = (input: Partial<RobotsInput>): string[] =>
  buildRobotsTxt({ ...BASE, ...input }).issues.filter((issue) => issue.level === "error").map((issue) => issue.message);

describe("buildRobotsTxt", () => {
  it("allows everything by default", () => {
    expect(buildRobotsTxt(BASE).text).toBe("User-agent: *\nDisallow:");
  });

  it("blocks the paths you list and allows exceptions inside them", () => {
    const { text } = buildRobotsTxt({ ...BASE, allowPaths: "/admin/help/", disallowPaths: "/admin/\n/cart/\n\n  /search  " });

    expect(text).toBe("User-agent: *\nDisallow: /admin/\nDisallow: /cart/\nDisallow: /search\nAllow: /admin/help/");
  });

  it("blocks the whole site, and warns that it hides the site from search", () => {
    const result = buildRobotsTxt({ ...BASE, allowPaths: "/x/", blockEverything: true, disallowPaths: "/a/" });

    expect(result.text).toBe("User-agent: *\nDisallow: /");
    expect(result.issues.some((issue) => issue.message.includes("whole site"))).toBe(true);
  });

  it("adds a group for each AI training crawler, with a warning that robots.txt is only a request", () => {
    const result = buildRobotsTxt({ ...BASE, blockAiTraining: true });

    for (const crawler of AI_TRAINING_CRAWLERS) {
      expect(result.text).toContain(`User-agent: ${crawler.token}\nDisallow: /`);
    }

    for (const crawler of AI_SEARCH_CRAWLERS) {
      expect(result.text).not.toContain(crawler.token);
    }

    expect(result.issues.some((issue) => issue.message.includes("a request, not a lock"))).toBe(true);
  });

  it("can also block AI search crawlers", () => {
    const { text } = buildRobotsTxt({ ...BASE, blockAiSearch: true });

    expect(text).toContain("User-agent: OAI-SearchBot\nDisallow: /");
    expect(text).toContain("User-agent: PerplexityBot\nDisallow: /");
    expect(text).not.toContain("GPTBot");
  });

  it("uses the crawler names that OpenAI and Anthropic publish", () => {
    const tokens = [...AI_TRAINING_CRAWLERS, ...AI_SEARCH_CRAWLERS].map((crawler) => crawler.token);

    expect(tokens).toEqual(expect.arrayContaining(["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "CCBot"]));
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("lists sitemaps at the end", () => {
    const { text } = buildRobotsTxt({ ...BASE, blockAiTraining: true, sitemaps: "https://example.com/sitemap.xml\nhttps://example.com/news.xml" });

    expect(text.endsWith("Sitemap: https://example.com/sitemap.xml\nSitemap: https://example.com/news.xml")).toBe(true);
  });

  it("adds a crawl delay and says Google ignores it", () => {
    const result = buildRobotsTxt({ ...BASE, crawlDelay: "10" });

    expect(result.text).toBe("User-agent: *\nDisallow:\nCrawl-delay: 10");
    expect(result.issues.some((issue) => issue.message.includes("Google ignores"))).toBe(true);
  });

  it("reports paths, delays, and sitemap addresses that are not valid", () => {
    expect(errors({ disallowPaths: "admin" })[0]).toContain('"admin" is not a valid path');
    expect(errors({ allowPaths: "images" })[0]).toContain("not a valid path");
    expect(errors({ crawlDelay: "soon" })[0]).toContain("number of seconds");
    expect(errors({ sitemaps: "/sitemap.xml" })[0]).toContain("full web address");
    expect(errors({ disallowPaths: "/ok/\n*.pdf", sitemaps: "https://example.com/s.xml" })).toEqual([]);
  });
});
