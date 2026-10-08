import { fireEvent, render, screen, within } from "@testing-library/react";
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

/**
 * Types into the search box.
 */
function search(value: string): void {
  fireEvent.change(screen.getByLabelText("Search tools"), { target: { value } });
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

  it("searches every tool, not only the popular ones", () => {
    renderBrowser();

    const notPopular = CATEGORIES.flatMap((entry) => entry.tools).find(
      (tool) => !FEATURED.some((featured) => featured.id === tool.id),
    );

    expect(notPopular).toBeDefined();

    search(notPopular?.name ?? "");

    const results = screen.getByRole("region", { name: "Search results" });

    expect(within(results).getAllByRole("heading", { name: notPopular?.name ?? "" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("region", { name: "Popular tools" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Browse by category" })).not.toBeInTheDocument();
  });

  it("filters to matching tools as you type, across categories", () => {
    renderBrowser();

    search("sha256");

    const results = screen.getByRole("region", { name: "Search results" });

    expect(within(results).getAllByRole("article")).toHaveLength(1);
    expect(within(results).getByRole("heading", { name: "Hash Generator" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 tool found.");
  });

  it("says when nothing matches, and goes back to the browse view", () => {
    renderBrowser();

    search("zzzz");

    expect(screen.getByText('No tools match this search. Try describing the job, like "compress an image".')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show all tools" }));

    expect(screen.getByLabelText("Search tools")).toHaveValue("");
    expect(screen.getByRole("region", { name: "Popular tools" })).toBeInTheDocument();
  });
});
