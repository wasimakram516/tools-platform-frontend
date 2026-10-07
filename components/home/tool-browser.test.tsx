import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToolBrowser, type BrowsableCategory } from "@/components/home/tool-browser";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { TOOLS_GRID_COLUMNS } from "@/components/ui/card-grid";
import { getAvailableToolCategories, getToolsByCategory } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const CATEGORIES: BrowsableCategory[] = getAvailableToolCategories().map((category) => ({
  category,
  tools: getToolsByCategory(category.id).filter((tool) => tool.status === "available"),
}));

/**
 * Renders the homepage browser inside the production theme.
 */
function renderBrowser(): void {
  render(
    <AppThemeProvider>
      <ToolBrowser categories={CATEGORIES} />
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
  it("shows every category with a short preview of its tools and a link to the rest", () => {
    renderBrowser();

    for (const { category, tools } of CATEGORIES) {
      const section = screen.getByRole("region", { name: category.name });

      expect(within(section).getAllByRole("article")).toHaveLength(Math.min(tools.length, TOOLS_GRID_COLUMNS));
      expect(within(section).getByRole("link", { name: tools.length > TOOLS_GRID_COLUMNS ? `View all ${tools.length} tools` : "View all" })).toHaveAttribute(
        "href",
        `/categories/${category.slug}`,
      );
    }
  });

  it("searches every tool, including ones not previewed on the homepage", () => {
    renderBrowser();

    const hidden = CATEGORIES.flatMap((entry) => entry.tools.slice(TOOLS_GRID_COLUMNS));

    expect(hidden.length).toBeGreaterThan(0);

    search(hidden[0]?.name ?? "");

    expect(screen.getAllByRole("heading", { name: hidden[0]?.name ?? "" }).length).toBeGreaterThan(0);
  });

  it("filters to matching tools as you type, across categories", () => {
    renderBrowser();

    search("sha256");

    const results = screen.getByRole("region", { name: "Search results" });

    expect(within(results).getAllByRole("article")).toHaveLength(1);
    expect(within(results).getByRole("heading", { name: "Hash Generator" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view all/i })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 tool found.");
  });

  it("matches words from a tool's keywords, not only its name", () => {
    renderBrowser();

    search("excel serial");

    expect(screen.getByRole("heading", { name: "Excel Date Converter" })).toBeInTheDocument();
  });

  it("says when nothing matches, and clears the search", () => {
    renderBrowser();

    search("zzzz");

    expect(screen.getByText("No tools match this search. Try a shorter word.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show all tools" }));

    expect(screen.getByLabelText("Search tools")).toHaveValue("");
    expect(screen.getAllByRole("link", { name: /view all/i })).toHaveLength(CATEGORIES.length);
  });
});
