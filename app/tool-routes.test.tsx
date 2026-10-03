import { render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
  generateStaticParams as generateCategoryParams,
} from "@/app/categories/[categorySlug]/page";
import CategoriesPage from "@/app/categories/page";
import ToolPage, {
  generateMetadata as generateToolMetadata,
  generateStaticParams as generateToolParams,
} from "@/app/tools/[toolSlug]/page";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { RouteError } from "@/components/states/route-error";
import { ToolPageLoading } from "@/components/states/tool-page-loading";
import { getToolCategories, getTools, getToolsByCategory } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

/**
 * Renders route output with the production Material UI theme.
 */
function renderRoute(component: ReactNode): void {
  render(<AppThemeProvider>{component}</AppThemeProvider>);
}

describe("registry-backed routes", () => {
  it("renders the complete initial developer tool category", async () => {
    const page = await CategoryPage({
      params: Promise.resolve({ categorySlug: "developer-tools" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "Developer tools" })).toBeInTheDocument();
    const toolLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/tools/"));

    expect(toolLinks).toHaveLength(getToolsByCategory("developer").length);
    expect(screen.queryByText("Planned")).not.toBeInTheDocument();
  });

  it("renders the categories hub with live and planned categories", () => {
    renderRoute(<CategoriesPage />);

    expect(screen.getByRole("heading", { level: 1, name: "All categories" })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/categories/developer-tools"),
    ).toBe(true);
    expect(screen.getAllByText("Coming soon")).toHaveLength(
      getToolCategories().filter((category) => category.status === "planned").length,
    );
    expect(screen.getByText(`${getToolsByCategory("developer").length} tools`)).toBeInTheDocument();
  });

  it("does not render a page for a planned category", async () => {
    await expect(
      CategoryPage({ params: Promise.resolve({ categorySlug: "image-tools" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the JSON tool inside the reusable tool shell", async () => {
    const page = await ToolPage({
      params: Promise.resolve({ toolSlug: "json-formatter" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "JSON Formatter" })).toBeInTheDocument();
    expect(screen.getByLabelText("JSON formatter workspace")).toBeInTheDocument();
    expect(screen.getByText("On this device · background worker")).toBeInTheDocument();
  });

  it("renders the Base64 tool inside the reusable tool shell", async () => {
    const page = await ToolPage({
      params: Promise.resolve({ toolSlug: "base64-encoder-decoder" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "Base64 Encoder / Decoder" })).toBeInTheDocument();
    expect(screen.getByLabelText("Base64 encoder and decoder workspace")).toBeInTheDocument();
  });

  it("renders the URL tool inside the reusable tool shell", async () => {
    const page = await ToolPage({
      params: Promise.resolve({ toolSlug: "url-encoder-decoder" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "URL Encoder / Decoder" })).toBeInTheDocument();
    expect(screen.getByLabelText("URL encoder and decoder workspace")).toBeInTheDocument();
  });

  it("renders the UUID tool inside the reusable tool shell", async () => {
    const page = await ToolPage({
      params: Promise.resolve({ toolSlug: "uuid-generator" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "UUID Generator" })).toBeInTheDocument();
    expect(screen.getByLabelText("UUID generator workspace")).toBeInTheDocument();
  });

  it("renders the JWT tool inside the reusable tool shell", async () => {
    const page = await ToolPage({
      params: Promise.resolve({ toolSlug: "jwt-decoder" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "JWT Decoder" })).toBeInTheDocument();
    expect(screen.getByLabelText("JWT decoder workspace")).toBeInTheDocument();
  });

  it("generates route params and metadata from the registry", async () => {
    expect(generateCategoryParams()).toEqual([{ categorySlug: "developer-tools" }]);
    expect(generateToolParams()).toEqual(
      getTools()
        .filter((tool) => tool.status === "available")
        .map((tool) => ({ toolSlug: tool.slug })),
    );
    await expect(
      generateCategoryMetadata({
        params: Promise.resolve({ categorySlug: "developer-tools" }),
      }),
    ).resolves.toMatchObject({ title: "Developer tools" });
    await expect(
      generateToolMetadata({
        params: Promise.resolve({ toolSlug: "json-formatter" }),
      }),
    ).resolves.toMatchObject({ title: "JSON Formatter" });
  });

  it("renders reusable loading and recovery states", async () => {
    const reset = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();

    renderRoute(
      <>
        <ToolPageLoading />
        <RouteError reset={reset} />
      </>,
    );

    expect(screen.getAllByRole("main")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
