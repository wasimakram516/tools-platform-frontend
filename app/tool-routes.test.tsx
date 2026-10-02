import { render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
  generateStaticParams as generateCategoryParams,
} from "@/app/categories/[categorySlug]/page";
import ToolPage, {
  generateMetadata as generateToolMetadata,
  generateStaticParams as generateToolParams,
} from "@/app/tools/[toolSlug]/page";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { RouteError } from "@/components/states/route-error";
import { ToolPageLoading } from "@/components/states/tool-page-loading";

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
  it("renders the developer category and its planned states", async () => {
    const page = await CategoryPage({
      params: Promise.resolve({ categorySlug: "developer-tools" }),
    });

    renderRoute(page);

    expect(screen.getByRole("heading", { name: "Developer tools" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open tool" })).toHaveLength(4);
    expect(screen.getAllByText("Planned")).toHaveLength(1);
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

  it("generates route params and metadata from the registry", async () => {
    expect(generateCategoryParams()).toEqual([{ categorySlug: "developer-tools" }]);
    expect(generateToolParams()).toEqual([
      { toolSlug: "json-formatter" },
      { toolSlug: "base64-encoder-decoder" },
      { toolSlug: "url-encoder-decoder" },
      { toolSlug: "uuid-generator" },
    ]);
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
