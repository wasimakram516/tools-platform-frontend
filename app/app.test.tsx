import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { FAQ_ITEMS } from "@/lib/home-content";
import { CONTACT_URL } from "@/lib/site-config";
import ErrorPage from "./error";
import Loading from "./loading";
import NotFound from "./not-found";
import HomePage from "./page";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a component with the application theme used in production.
 */
function renderWithTheme(component: ReactNode): void {
  render(<AppThemeProvider>{component}</AppThemeProvider>);
}

describe("application foundation", () => {
  it("renders the platform promise and pillars", () => {
    renderWithTheme(<HomePage />);

    expect(screen.getByRole("heading", { name: /get it quick\. ?get it sorted/i })).toBeInTheDocument();
    expect(screen.getByText(/every tool shows how it handles your data/i)).toBeInTheDocument();
    const browse = screen.getByRole("region", { name: "Browse by category" });

    expect(within(browse).getByRole("link", { name: /all categories/i })).toHaveAttribute("href", "/categories");
  });

  it("explains what the site is, who it is for, why to use it, and answers common questions", () => {
    renderWithTheme(<HomePage />);

    for (const name of [
      "What is QuicklySorted?",
      "What people use it for",
      "Why use QuicklySorted?",
      "Frequently asked questions",
      "Missing a tool?",
    ]) {
      expect(screen.getAllByRole("heading", { name }).length).toBeGreaterThan(0);
    }

    const faq = screen.getByRole("region", { name: "Frequently asked questions" });

    const questions = within(faq).getAllByRole("button");

    expect(questions).toHaveLength(FAQ_ITEMS.length);
    expect(within(faq).getByRole("link", { name: "Ask us a question" })).toHaveAttribute("href", CONTACT_URL);
    expect(screen.getByRole("link", { name: "Suggest a tool" })).toHaveAttribute("href", CONTACT_URL);
  });

  it("opens one answer at a time in the FAQ", () => {
    renderWithTheme(<HomePage />);

    const faq = screen.getByRole("region", { name: "Frequently asked questions" });
    const questions = within(faq).getAllByRole("button");

    expect(questions.every((question) => question.getAttribute("aria-expanded") === "false")).toBe(true);

    fireEvent.click(questions[0] as HTMLElement);
    expect(questions[0]).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(questions[1] as HTMLElement);
    expect(questions[1]).toHaveAttribute("aria-expanded", "true");
    expect(questions[0]).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(questions[1] as HTMLElement);
    expect(questions[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("puts structured data for the site and its FAQ in the page", () => {
    const { container } = render(
      <AppThemeProvider>
        <HomePage />
      </AppThemeProvider>,
    );
    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    const data = scripts.flatMap((script) => JSON.parse(script.textContent ?? "[]") as { "@type": string }[]);

    expect(data.map((entry) => entry["@type"])).toEqual(expect.arrayContaining(["WebSite", "FAQPage"]));
  });

  it("renders an accessible loading state", () => {
    renderWithTheme(<Loading />);

    expect(screen.getByRole("status", { name: /loading page/i })).toBeInTheDocument();
  });

  it("renders the not-found state", () => {
    renderWithTheme(<NotFound />);

    expect(screen.getByRole("heading", { name: /tool not found/i })).toBeInTheDocument();
  });

  it("allows retrying after a route error", () => {
    const reset = vi.fn();
    renderWithTheme(<ErrorPage error={new Error("test failure")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
