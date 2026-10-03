import type { MetadataRoute } from "next";
import { LEGAL_DOCUMENTS } from "@/lib/legal/legal-content";
import { absoluteUrl } from "@/lib/seo";
import { getAvailableToolCategories, getTools } from "@/lib/tools/tool-registry";

/**
 * Lists every public, indexable URL. Planned categories and tools are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const categoryEntries = getAvailableToolCategories().map((category) => ({
    priority: 0.8,
    url: absoluteUrl(`/categories/${category.slug}`),
  }));
  const toolEntries = getTools()
    .filter((tool) => tool.status === "available")
    .map((tool) => ({ priority: 0.9, url: absoluteUrl(`/tools/${tool.slug}`) }));

  return [
    { priority: 1, url: absoluteUrl("/") },
    { priority: 0.8, url: absoluteUrl("/categories") },
    ...categoryEntries,
    ...toolEntries,
    ...LEGAL_DOCUMENTS.map((document) => ({
      priority: 0.3,
      url: absoluteUrl(`/${document.slug}`),
    })),
  ];
}
