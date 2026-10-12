import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { CHARACTER_LIMITS, LIMIT_GROUPS } from "@/lib/tools/text/character-limits";
import CharacterLimitsPage, { metadata } from "./page";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const BRAND_SUFFIX_LENGTH = " | QuicklySorted".length;

/**
 * Renders the page inside the production theme.
 */
function renderPage(): HTMLElement {
  return render(
    <AppThemeProvider>
      <CharacterLimitsPage />
    </AppThemeProvider>,
  ).container;
}

describe("character limits page", () => {
  it("has a title and description that fit in search results", () => {
    const description = String(metadata.description);

    expect(String(metadata.title).length + BRAND_SUFFIX_LENGTH).toBeLessThanOrEqual(62);
    expect(description.length).toBeGreaterThanOrEqual(80);
    expect(description.length).toBeLessThanOrEqual(165);
  });

  it("has one heading, a table for each group, and a row for every limit", () => {
    renderPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Character limits" })).toBeInTheDocument();

    for (const group of LIMIT_GROUPS) {
      const table = screen.getByRole("table", { name: `${group.label}: character limits` });

      expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
        "Where",
        "Limit",
        "How it is counted",
        "Source",
      ]);
    }

    for (const entry of CHARACTER_LIMITS) {
      expect(screen.getByRole("rowheader", { name: entry.label })).toBeInTheDocument();
    }
  });

  it("shows each number with a thousands separator, and links official sources out", () => {
    renderPage();

    const row = screen.getByRole("rowheader", { name: "LinkedIn article" }).closest("tr") as HTMLElement;

    expect(within(row).getByText("125,000")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: /LinkedIn Help/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/www\.linkedin\.com\//),
    );
  });

  it("says plainly which figures are reported or rules of thumb, not official", () => {
    renderPage();

    const caption = screen.getByRole("rowheader", { name: "Instagram caption" }).closest("tr") as HTMLElement;
    const title = screen.getByRole("rowheader", { name: "Page title" }).closest("tr") as HTMLElement;

    expect(within(caption).getByText("Widely reported")).toBeInTheDocument();
    expect(within(title).getByText("Rule of thumb")).toBeInTheDocument();
  });

  it("links to the Character Counter and carries structured data for the page and its questions", () => {
    const container = renderPage();
    const types = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).flatMap((script) => {
      const data = JSON.parse(script.textContent ?? "[]") as { "@type": string } | { "@type": string }[];

      return (Array.isArray(data) ? data : [data]).map((entry) => entry["@type"]);
    });

    expect(screen.getByRole("link", { name: "Open the Character Counter" })).toHaveAttribute(
      "href",
      "/tools/character-counter",
    );
    expect(types).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList", "FAQPage"]));
  });
});
