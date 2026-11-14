import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { getGuides, getMoreGuides, guidePath } from "@/lib/guides/guides";
import GuidePage, { generateMetadata, generateStaticParams } from "./[guideSlug]/page";
import GuidesPage, { metadata } from "./page";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("next/navigation", () => ({ notFound }));

/**
 * Reads the JSON-LD types a rendered page declares.
 */
function jsonLdTypes(container: HTMLElement): string[] {
  return [...container.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap((script) => JSON.parse(script.textContent ?? "[]") as { "@type": string }[])
    .map((entry) => entry["@type"]);
}

describe("guides index", () => {
  it("fits in search results and links to every guide and the character limits", () => {
    expect(String(metadata.title).length + " | QuicklySorted".length).toBeLessThanOrEqual(62);
    expect(String(metadata.description).length).toBeLessThanOrEqual(155);

    render(
      <AppThemeProvider>
        <GuidesPage />
      </AppThemeProvider>,
    );

    const main = within(screen.getByRole("main"));

    for (const guide of getGuides()) {
      expect(main.getByRole("link", { name: guide.name })).toHaveAttribute("href", guidePath(guide));
    }

    expect(main.getByRole("link", { name: "Character limits" })).toHaveAttribute("href", "/character-limits");
  });
});

describe("guide page", () => {
  it("prebuilds every guide", () => {
    expect(generateStaticParams().map((entry) => entry.guideSlug)).toEqual(getGuides().map((guide) => guide.slug));
  });

  it("uses the guide's own title, description, and address", async () => {
    const [guide] = getGuides();
    const metadataForGuide = await generateMetadata({ params: Promise.resolve({ guideSlug: guide?.slug ?? "" }) });

    expect(metadataForGuide.title).toBe(guide?.seoTitle);
    expect(metadataForGuide.alternates?.canonical).toBe(guidePath(guide ?? { slug: "" }));
    expect(await generateMetadata({ params: Promise.resolve({ guideSlug: "missing" }) })).toEqual({});
  });

  it.each(getGuides().map((guide) => [guide.slug, guide] as const))(
    "renders %s with its sections, tool, sources, and structured data",
    async (_slug, guide) => {
      const page = await GuidePage({ params: Promise.resolve({ guideSlug: guide.slug }) });
      const { container } = render(<AppThemeProvider>{page}</AppThemeProvider>);

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      guide.sections.forEach((section) => expect(screen.getByRole("heading", { level: 2, name: section.heading })).toBeInTheDocument());
      expect(screen.getByRole("link", { name: guide.toolAction })).toHaveAttribute("href", `/tools/${guide.toolSlug}`);
      guide.sources.forEach((source) => expect(screen.getByRole("link", { name: source.label })).toHaveAttribute("href", source.url));
      expect(jsonLdTypes(container)).toEqual(expect.arrayContaining(["Organization", "TechArticle", "BreadcrumbList", "FAQPage"]));

      const related = within(screen.getByRole("navigation", { name: "Related tools" })).getAllByRole("link");

      expect(related.map((link) => link.getAttribute("href"))).toEqual(guide.relatedTools.map((slug) => `/tools/${slug}`));

      const more = within(screen.getByRole("navigation", { name: "More guides" }));

      expect(more.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(
        [...getMoreGuides(guide).map(guidePath), "/guides"],
      );
    },
  );

  it("is not found for an unknown guide", async () => {
    await expect(GuidePage({ params: Promise.resolve({ guideSlug: "missing" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
