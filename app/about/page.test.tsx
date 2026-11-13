import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ABOUT_SECTIONS } from "@/lib/about-content";
import AboutPage, { metadata } from "./page";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const BRAND_SUFFIX_LENGTH = " | QuicklySorted".length;

describe("about page", () => {
  it("has a title and description that fit in search results", () => {
    const description = String(metadata.description);

    expect(String(metadata.title).length + BRAND_SUFFIX_LENGTH).toBeLessThanOrEqual(62);
    expect(description.length).toBeGreaterThanOrEqual(80);
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it("has one h1, a heading for every section, and links to the privacy policy", () => {
    const { container } = render(
      <AppThemeProvider>
        <AboutPage />
      </AppThemeProvider>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

    for (const section of ABOUT_SECTIONS) {
      expect(screen.getByRole("heading", { level: 2, name: section.heading })).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");

    const types = [...container.querySelectorAll('script[type="application/ld+json"]')].flatMap(
      (script) => JSON.parse(script.textContent ?? "[]") as { "@type": string }[],
    );

    expect(types.map((entry) => entry["@type"])).toEqual(expect.arrayContaining(["Organization", "AboutPage", "BreadcrumbList"]));
  });
});
