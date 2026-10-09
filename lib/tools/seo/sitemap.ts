import { escapeText, type MetaTagIssue } from "@/lib/tools/seo/meta-tags";

/** The most addresses one sitemap file may list, set by the sitemap standard. */
export const MAX_SITEMAP_URLS = 50_000;
/** The most characters read, which keeps the page responsive. */
export const MAX_SITEMAP_INPUT_CHARACTERS = 2_000_000;

export const CHANGE_FREQUENCIES = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;
export type ChangeFrequency = (typeof CHANGE_FREQUENCIES)[number];

export interface SitemapInput {
  /** Leave out to add no hint. Google ignores this hint. */
  changeFrequency: ChangeFrequency | "";
  /** A date, as YYYY-MM-DD, put on every address. Leave empty for none. */
  lastModified: string;
  /** A number from 0 to 1, put on every address. Leave empty for none. Google ignores it. */
  priority: string;
  /** The addresses, one for each line. */
  urls: string;
}

export interface SitemapResult {
  issues: MetaTagIssue[];
  /** How many addresses are in the file. */
  count: number;
  xml: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Makes text safe to put inside an XML element.
 */
function escapeXml(text: string): string {
  return escapeText(text).replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

/**
 * Builds an XML sitemap from a list of addresses. Blank lines are skipped, repeats are removed,
 * and a part after # is dropped because it never changes which page is meant. Every address must
 * be a full web address on the same site as the first one, as the sitemap standard requires.
 */
export function buildSitemap(input: SitemapInput): SitemapResult {
  const issues: MetaTagIssue[] = [];
  const seen = new Set<string>();
  const urls: string[] = [];
  let host: string | null = null;
  let removedRepeats = 0;
  let strippedFragments = 0;

  if (input.urls.length > MAX_SITEMAP_INPUT_CHARACTERS) {
    return { count: 0, issues: [{ level: "error", message: `The list is limited to ${MAX_SITEMAP_INPUT_CHARACTERS.toLocaleString("en-US")} characters.` }], xml: "" };
  }

  for (const [index, raw] of input.urls.split(/\r\n|\r|\n/).entries()) {
    const line = raw.trim();

    if (line === "") {
      continue;
    }

    let parsed: URL;

    try {
      parsed = new URL(line);
    } catch {
      issues.push({ level: "error", message: `Line ${index + 1}: "${line}" is not a full web address. Start it with https://.` });
      continue;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      issues.push({ level: "error", message: `Line ${index + 1}: only http and https addresses can go in a sitemap.` });
      continue;
    }

    if (parsed.hash !== "") {
      parsed.hash = "";
      strippedFragments += 1;
    }

    if (host === null) {
      host = parsed.host;
    } else if (parsed.host !== host) {
      issues.push({ level: "error", message: `Line ${index + 1}: ${parsed.host} is a different site from ${host}. One sitemap can only list one site.` });
      continue;
    }

    const address = parsed.toString();

    if (seen.has(address)) {
      removedRepeats += 1;
      continue;
    }

    seen.add(address);
    urls.push(address);
  }

  if (urls.length === 0 && issues.length === 0) {
    issues.push({ level: "error", message: "Add some addresses, one on each line." });
  }

  if (urls.length > MAX_SITEMAP_URLS) {
    issues.push({ level: "error", message: `A sitemap can list up to ${MAX_SITEMAP_URLS.toLocaleString("en-US")} addresses. Split this list into several sitemaps.` });
  }

  if (removedRepeats > 0) {
    issues.push({ level: "warning", message: `${removedRepeats} repeated ${removedRepeats === 1 ? "address was" : "addresses were"} left out.` });
  }

  if (strippedFragments > 0) {
    issues.push({ level: "warning", message: `The part after # was removed from ${strippedFragments} ${strippedFragments === 1 ? "address" : "addresses"}, because it does not change which page is meant.` });
  }

  const lastModified = input.lastModified.trim();
  const priority = input.priority.trim();

  if (lastModified !== "" && (!DATE_PATTERN.test(lastModified) || Number.isNaN(Date.parse(lastModified)))) {
    issues.push({ level: "error", message: "The last changed date is written as YYYY-MM-DD, such as 2026-10-09." });
  }

  if (priority !== "" && !(/^(0(\.\d+)?|1(\.0+)?)$/.test(priority))) {
    issues.push({ level: "error", message: "The priority is a number from 0 to 1, such as 0.8." });
  }

  if (lastModified !== "" && DATE_PATTERN.test(lastModified) && !Number.isNaN(Date.parse(lastModified))) {
    issues.push({ level: "warning", message: "Use a real date for when each page changed. Search engines stop trusting a date that is always today's." });
  }

  if (input.changeFrequency !== "" || priority !== "") {
    issues.push({ level: "warning", message: "Google ignores the change frequency and priority hints. They are harmless, and some other search engines read them." });
  }

  const hasErrors = issues.some((issue) => issue.level === "error");

  if (hasErrors || urls.length === 0) {
    return { count: urls.length, issues, xml: "" };
  }

  const entries = urls.map((address) => {
    const parts = [`    <loc>${escapeXml(address)}</loc>`];

    if (lastModified !== "") {
      parts.push(`    <lastmod>${lastModified}</lastmod>`);
    }

    if (input.changeFrequency !== "") {
      parts.push(`    <changefreq>${input.changeFrequency}</changefreq>`);
    }

    if (priority !== "") {
      parts.push(`    <priority>${priority}</priority>`);
    }

    return `  <url>\n${parts.join("\n")}\n  </url>`;
  });

  return {
    count: urls.length,
    issues,
    xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`,
  };
}
