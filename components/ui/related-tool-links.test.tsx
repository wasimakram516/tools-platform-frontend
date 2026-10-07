import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { RelatedToolLinks } from "@/components/ui/related-tool-links";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

describe("RelatedToolLinks", () => {
  it("shows one quiet line: a label and a link for each related tool", () => {
    const tool = getToolBySlug("excel-date-converter");
    const related = tool ? getRelatedTools(tool) : [];

    expect(related.length).toBeGreaterThan(0);

    render(
      <AppThemeProvider>
        <RelatedToolLinks tools={related} />
      </AppThemeProvider>,
    );

    const nav = screen.getByRole("navigation", { name: "Related tools" });
    const links = within(nav).getAllByRole("link");

    expect(links).toHaveLength(related.length);

    related.forEach((relatedTool, index) => {
      expect(links[index]).toHaveAttribute("href", `/tools/${relatedTool.slug}`);
      expect(links[index]).toHaveAccessibleName(relatedTool.name);
    });
  });

  it("is a list, so screen readers announce how many links there are", () => {
    const related = getRelatedTools(getToolBySlug("age-calculator")!);

    render(
      <AppThemeProvider>
        <RelatedToolLinks tools={related} />
      </AppThemeProvider>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(related.length);
  });

  it("renders nothing when there are no related tools", () => {
    const { container } = render(
      <AppThemeProvider>
        <RelatedToolLinks tools={[]} />
      </AppThemeProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
