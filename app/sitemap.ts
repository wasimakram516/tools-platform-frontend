import type { MetadataRoute } from "next";
import { LEGAL_DOCUMENTS, LEGAL_LAST_UPDATED_ISO } from "@/lib/legal/legal-content";
import { absoluteUrl } from "@/lib/seo";
import { getAvailableToolCategories, getToolsByCategory, getTools } from "@/lib/tools/tool-registry";

/**
 * Finds the latest of several YYYY-MM-DD dates. Such dates sort correctly as plain text.
 */
function latest(dates: readonly string[]): string | undefined {
  return [...dates].sort().at(-1);
}

/**
 * Lists every public, indexable URL with the date it last really changed. Dates come from the
 * tool registry and the legal pages, never from the time of the build, because search engines
 * stop trusting dates that always say "now". Planned categories and tools are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const availableTools = getTools().filter((tool) => tool.status === "available");
  const categoryEntries = getAvailableToolCategories().map((category) => ({
    lastModified: latest(getToolsByCategory(category.id).filter((tool) => tool.status === "available").map((tool) => tool.updatedAt)),
    priority: 0.8,
    url: absoluteUrl(`/categories/${category.slug}`),
  }));
  const toolEntries = availableTools.map((tool) => ({
    lastModified: tool.updatedAt,
    priority: 0.9,
    url: absoluteUrl(`/tools/${tool.slug}`),
  }));
  const catalogUpdated = latest(availableTools.map((tool) => tool.updatedAt));

  return [
    { lastModified: catalogUpdated, priority: 1, url: absoluteUrl("/") },
    { lastModified: catalogUpdated, priority: 0.8, url: absoluteUrl("/categories") },
    ...categoryEntries,
    ...toolEntries,
    ...LEGAL_DOCUMENTS.map((document) => ({
      lastModified: LEGAL_LAST_UPDATED_ISO,
      priority: 0.3,
      url: absoluteUrl(`/${document.slug}`),
    })),
  ];
}
