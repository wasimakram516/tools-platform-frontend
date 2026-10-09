import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ToolGuide } from "@/components/tools/tool-guide";
import { TOOL_CONTENT } from "@/lib/tools/tool-content";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const CONTENT = TOOL_CONTENT["DEV-01"]!;

/**
 * Renders the guide for the JSON tool inside the production theme.
 */
function renderGuide(): HTMLElement {
  return render(
    <AppThemeProvider>
      <ToolGuide content={CONTENT} idPrefix="json-formatter" toolName="JSON Formatter" />
    </AppThemeProvider>,
  ).container;
}

describe("ToolGuide", () => {
  it("lists the steps as a numbered list under a how-to heading", () => {
    renderGuide();

    expect(screen.getByRole("heading", { name: "How to use the JSON Formatter" })).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(CONTENT.steps.length);
  });

  it("shows the questions in the same accordion as the home page, closed to start with", () => {
    renderGuide();

    const questions = screen.getAllByRole("button");

    expect(questions).toHaveLength(CONTENT.faqs.length);
    expect(questions.every((question) => question.getAttribute("aria-expanded") === "false")).toBe(true);
    expect(screen.getByRole("heading", { name: CONTENT.faqs[0]!.question })).toBeInTheDocument();
  });

  it("opens one answer at a time", () => {
    renderGuide();

    const questions = screen.getAllByRole("button");

    fireEvent.click(questions[0] as HTMLElement);
    fireEvent.click(questions[1] as HTMLElement);

    expect(questions[1]).toHaveAttribute("aria-expanded", "true");
    expect(questions[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("has no Show more button when there are only a few questions", () => {
    renderGuide();

    expect(screen.queryByRole("button", { name: /Show more/ })).not.toBeInTheDocument();
  });

  it("keeps every answer in the page text, even while closed, for search engines", () => {
    const text = renderGuide().textContent ?? "";

    for (const faq of CONTENT.faqs) {
      expect(text).toContain(faq.answer);
    }
  });
});
