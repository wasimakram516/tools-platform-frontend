import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { SiteNav } from "@/components/layout/site-nav";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import type { NavData } from "@/lib/nav-data";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const DATA: NavData = {
  categories: [
    {
      href: "/categories/developer-tools",
      id: "developer",
      name: "Developer tools",
      tools: [
        { href: "/tools/json-formatter", icon: "json", label: "JSON Formatter" },
        { href: "/tools/jwt-decoder", icon: "jwt", label: "JWT Decoder" },
      ],
    },
    {
      href: "/categories/calculators",
      id: "calculator",
      name: "Calculators",
      tools: [{ href: "/tools/loan-calculator", icon: "loan", label: "Loan Calculator" }],
    },
  ],
  popular: [
    { href: "/tools/json-formatter", icon: "json", label: "JSON Formatter" },
    { href: "/tools/image-compressor-converter", icon: "imageCompress", label: "Image Compressor and Converter" },
  ],
};

/**
 * Renders the navigation inside a header, as it sits on the site, because the menus open below
 * the header.
 */
function renderNav(): void {
  render(
    <AppThemeProvider>
      <header>
        <SiteNav data={DATA} />
      </header>
    </AppThemeProvider>,
  );
}

describe("SiteNav", () => {
  it("offers Popular and All tools menus, closed to start with", () => {
    renderNav();

    const nav = screen.getByRole("navigation", { name: "Primary" });

    expect(within(nav).getByRole("button", { name: "Popular" })).toHaveAttribute("aria-expanded", "false");
    expect(within(nav).getByRole("button", { name: "All tools" })).toHaveAttribute("aria-expanded", "false");
  });

  it("lists the popular tools from its data in a menu, and closes it when one is chosen", () => {
    renderNav();

    fireEvent.click(screen.getByRole("button", { name: "Popular" }));

    const menu = screen.getByRole("menu");

    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    expect(within(menu).getByRole("menuitem", { name: "Image Compressor and Converter" })).toHaveAttribute(
      "href",
      "/tools/image-compressor-converter",
    );

    fireEvent.click(within(menu).getByRole("menuitem", { name: "JSON Formatter" }));

    expect(screen.getByRole("button", { expanded: false, hidden: true, name: "Popular" })).toBeInTheDocument();
  });

  it("opens a mega menu of every category and tool, and closes it when a tool is chosen", () => {
    renderNav();

    fireEvent.click(screen.getByRole("button", { name: "All tools" }));

    const menu = screen.getByRole("presentation");

    expect(screen.getByRole("button", { hidden: true, name: "All tools" })).toHaveAttribute("aria-expanded", "true");
    expect(within(menu).getByRole("link", { name: "Developer tools" })).toHaveAttribute("href", "/categories/developer-tools");
    expect(within(menu).getByRole("link", { name: "JWT Decoder" })).toHaveAttribute("href", "/tools/jwt-decoder");
    expect(within(menu).getByRole("link", { name: "Loan Calculator" })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "Browse all categories" })).toHaveAttribute("href", "/categories");

    fireEvent.click(within(menu).getByRole("link", { name: "JWT Decoder" }));

    expect(screen.getByRole("button", { expanded: false, hidden: true, name: "All tools" })).toBeInTheDocument();
  });

  it("opens the search menu from the search button, on any page", async () => {
    renderNav();

    fireEvent.click(screen.getByRole("button", { name: "Search tools" }));

    const box = await screen.findByRole("combobox", { name: "Search tools" }, { timeout: 15_000 });

    await waitFor(() => expect(box).toHaveFocus());
  });

  it("opens the search menu with the / key, but not while typing in a field", async () => {
    renderNav();

    const field = document.createElement("input");

    document.body.append(field);
    fireEvent.keyDown(field, { key: "/" });
    expect(screen.queryByRole("combobox", { name: "Search tools" })).not.toBeInTheDocument();
    field.remove();

    fireEvent.keyDown(document.body, { key: "/" });

    expect(await screen.findByRole("combobox", { name: "Search tools" }, { timeout: 15_000 })).toBeInTheDocument();
  });

  it("opens the search menu with Ctrl+K", async () => {
    renderNav();

    fireEvent.keyDown(document.body, { ctrlKey: true, key: "k" });

    expect(await screen.findByRole("combobox", { name: "Search tools" }, { timeout: 15_000 })).toBeInTheDocument();
  });

  it("folds everything into a drawer with an expandable list for Popular and each category", () => {
    renderNav();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const drawer = screen.getByRole("navigation", { name: "Mobile" });

    fireEvent.click(within(drawer).getByRole("button", { name: "Calculators" }));
    expect(within(drawer).getByRole("link", { name: "Loan Calculator" })).toHaveAttribute("href", "/tools/loan-calculator");
    fireEvent.click(within(drawer).getByRole("button", { name: "Popular" }));
    expect(within(drawer).getAllByRole("link", { name: "JSON Formatter" }).length).toBeGreaterThan(0);
    expect(within(drawer).getByRole("link", { name: "Browse all categories" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
  });
});
