import { isAbsoluteHttpUrl, type MetaTagIssue } from "@/lib/tools/seo/meta-tags";

export interface CrawlerGroup {
  /** What the crawler does, shown beside it. */
  note: string;
  /** The name a crawler goes by in robots.txt. */
  token: string;
}

/**
 * Crawlers that collect pages to train AI models. Each company publishes the name of its own
 * crawler and may change it, so these are the names in use at the time of writing.
 */
export const AI_TRAINING_CRAWLERS: readonly CrawlerGroup[] = [
  { note: "OpenAI training", token: "GPTBot" },
  { note: "Anthropic training", token: "ClaudeBot" },
  { note: "Google Gemini training and grounding", token: "Google-Extended" },
  { note: "Apple AI training", token: "Applebot-Extended" },
  { note: "Meta AI", token: "meta-externalagent" },
  { note: "Common Crawl, used by many AI models", token: "CCBot" },
  { note: "ByteDance", token: "Bytespider" },
];

/**
 * Crawlers that index pages so an AI assistant can quote and link to them. Blocking these takes
 * a site out of those assistants' answers.
 */
export const AI_SEARCH_CRAWLERS: readonly CrawlerGroup[] = [
  { note: "ChatGPT search", token: "OAI-SearchBot" },
  { note: "Claude search", token: "Claude-SearchBot" },
  { note: "Perplexity search", token: "PerplexityBot" },
];

export interface RobotsInput {
  /** Paths that are allowed even inside a blocked path, one for each line. */
  allowPaths: string;
  /** Also tell AI search and assistant crawlers to stay away. */
  blockAiSearch: boolean;
  /** Tell AI training crawlers to stay away. */
  blockAiTraining: boolean;
  /** Seconds between requests. Some crawlers honour it, but Google does not. Leave empty for none. */
  crawlDelay: string;
  /** Paths to keep crawlers out of, one for each line. */
  disallowPaths: string;
  /** Keep every crawler out of the whole site, as for a site that is not ready. */
  blockEverything: boolean;
  /** Addresses of sitemaps, one for each line. */
  sitemaps: string;
}

export interface RobotsResult {
  issues: MetaTagIssue[];
  text: string;
}

/**
 * Splits a textarea into trimmed, non-empty lines.
 */
function linesOf(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Builds a robots.txt file. A rule group for every crawler (the asterisk) comes first, then a
 * group that blocks each chosen AI crawler, then the sitemap addresses. Paths must start with a
 * slash, or be a pattern that starts with an asterisk.
 */
export function buildRobotsTxt(input: RobotsInput): RobotsResult {
  const issues: MetaTagIssue[] = [];
  const lines: string[] = ["User-agent: *"];
  const disallow = linesOf(input.disallowPaths);
  const allow = linesOf(input.allowPaths);

  for (const path of [...disallow, ...allow]) {
    if (!path.startsWith("/") && !path.startsWith("*")) {
      issues.push({ level: "error", message: `"${path}" is not a valid path. Paths start with a slash, such as /admin/.` });
    }
  }

  if (input.blockEverything) {
    lines.push("Disallow: /");
    issues.push({ level: "warning", message: "This tells every search engine to stay away from the whole site. Use it only for a site that is not ready to be found." });
  } else if (disallow.length === 0) {
    lines.push("Disallow:");
  } else {
    lines.push(...disallow.map((path) => `Disallow: ${path}`));
  }

  if (!input.blockEverything) {
    lines.push(...allow.map((path) => `Allow: ${path}`));
  }

  const delay = input.crawlDelay.trim();

  if (delay !== "") {
    if (!/^\d+(\.\d+)?$/.test(delay)) {
      issues.push({ level: "error", message: "The crawl delay is a number of seconds, such as 10." });
    } else {
      lines.push(`Crawl-delay: ${delay}`);
      issues.push({ level: "warning", message: "Google ignores Crawl-delay. Some other crawlers, such as Bing, follow it." });
    }
  }

  const blocked = [...(input.blockAiTraining ? AI_TRAINING_CRAWLERS : []), ...(input.blockAiSearch ? AI_SEARCH_CRAWLERS : [])];

  for (const crawler of blocked) {
    lines.push("", `User-agent: ${crawler.token}`, "Disallow: /");
  }

  if (blocked.length > 0) {
    issues.push({
      level: "warning",
      message: "robots.txt is a request, not a lock. Well-behaved crawlers follow it, but others may not. Companies also rename their crawlers, so check their documentation.",
    });
  }

  const sitemaps = linesOf(input.sitemaps);

  for (const address of sitemaps) {
    if (!isAbsoluteHttpUrl(address)) {
      issues.push({ level: "error", message: `"${address}" is not a full web address. A sitemap address starts with https://.` });
    }
  }

  if (sitemaps.length > 0) {
    lines.push("", ...sitemaps.map((address) => `Sitemap: ${address}`));
  }

  return { issues, text: lines.join("\n") };
}
