import type { IconKey } from "@/components/ui/tool-icon";
import { getAvailableToolCategories, getBaseToolsByCategory, getFeaturedTools } from "@/lib/tools/tool-registry";

export interface NavTool {
  href: string;
  icon: IconKey;
  label: string;
}

export interface NavCategory {
  href: string;
  id: string;
  name: string;
  tools: NavTool[];
}

export interface NavData {
  categories: NavCategory[];
  /** The tools marked as popular in the registry, for the "Popular" menu. */
  popular: NavTool[];
}

/**
 * Builds what the navigation bar shows from the tool registry: the popular tools, and every
 * available tool grouped by category for the mega menu. Pages made for one job with another
 * tool, such as PNG to JPG, are left out to keep the menu short; their category pages list them. A new tool, category, or popular flag
 * appears with no change here.
 */
export function buildNavData(): NavData {
  return {
    categories: getAvailableToolCategories()
      .map((category) => ({
        href: `/categories/${category.slug}`,
        id: category.id,
        name: category.name,
        tools: getBaseToolsByCategory(category.id).map((tool) => ({ href: `/tools/${tool.slug}`, icon: tool.icon, label: tool.name })),
      }))
      .filter((category) => category.tools.length > 0),
    popular: getFeaturedTools().map((tool) => ({ href: `/tools/${tool.slug}`, icon: tool.icon, label: tool.name })),
  };
}
