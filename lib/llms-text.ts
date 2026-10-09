import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/site-config";
import { getAvailableToolCategories, getToolsByCategory } from "@/lib/tools/tool-registry";

/**
 * Builds a plain-text guide to the site for AI assistants and other automated readers: what the
 * site is, and every available tool, grouped by category, with a link and a one-line description.
 * It is built from the tool registry, so it is always complete and never out of date.
 */
export function buildLlmsText(): string {
  const lines = [`# ${BRAND_NAME}`, "", `> ${SITE_DESCRIPTION}`, ""];

  for (const category of getAvailableToolCategories()) {
    const tools = getToolsByCategory(category.id).filter((tool) => tool.status === "available");

    if (tools.length === 0) {
      continue;
    }

    lines.push(`## ${category.name}`, "");

    for (const tool of tools) {
      lines.push(`- [${tool.name}](${absoluteUrl(`/tools/${tool.slug}`)}): ${tool.shortDescription}`);
    }

    lines.push("");
  }

  lines.push("## About", "", `- [Home](${absoluteUrl("/")}): all tools and answers to common questions`, `- [Sitemap](${absoluteUrl("/sitemap.xml")}): every page`, "");

  return lines.join("\n");
}
