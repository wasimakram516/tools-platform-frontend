import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToolBrowser, type BrowsableCategory } from "@/components/home/tool-browser";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { getAvailableToolCategories, getFeaturedTools, getToolsByCategory } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const CATEGORIES: BrowsableCategory[] = getAvailableToolCategories().map((category) => ({
  category,
  tools: getToolsByCategory(category.id).filter((tool) => tool.status === "available"),
}));
const FEATURED = getFeaturedTools();

/**
 * Renders the homepage browser inside the production theme.
 */
function renderBrowser(): void {
  render(
    <AppThemeProvider>
      <ToolBrowser categories={CATEGORIES} featuredTools={FEATURED} />
    </AppThemeProvider>,
  );
}

describe("ToolBrowser", () => {
  it("shows one short popular row and one compact tile per category, not a row of tools for each", () => {
    renderBrowser();

    const popular = screen.getByRole("region", { name: "Popular tools" });
    const categories = screen.getByRole("region", { name: "Browse by category" });

    expect(FEATURED.length).toBeGreaterThan(0);
    expect(within(popular).getAllByRole("article")).toHaveLength(FEATURED.length);
    expect(within(categories).getAllByRole("article")).toHaveLength(CATEGORIES.length);
  });

  it("links each category tile to its page and says how many tools it holds", () => {
    renderBrowser();

    const categories = screen.getByRole("region", { name: "Browse by category" });

    for (const { category, tools } of CATEGORIES) {
      const tile = within(categories).getByRole("heading", { name: category.name }).closest("article") as HTMLElement;

      expect(within(tile).getByRole("link")).toHaveAttribute("href", `/categories/${category.slug}`);
      expect(within(tile).getByText(`${tools.length} ${tools.length === 1 ? "tool" : "tools"}`)).toBeInTheDocument();
    }

    expect(within(categories).getByRole("link", { name: /all categories/i })).toHaveAttribute("href", "/categories");
  });

  it("leaves searching to the header, so the page has no search box of its own", () => {
    renderBrowser();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
