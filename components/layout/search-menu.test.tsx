import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchMenu } from "@/components/layout/search-menu";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { getFeaturedTools } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockClear();
});

/**
 * Renders the open search box, and returns the close handler.
 */
function renderMenu(): () => void {
  const onClose = vi.fn();

  render(
    <AppThemeProvider>
      <SearchMenu onClose={onClose} />
    </AppThemeProvider>,
  );

  return onClose;
}

/**
 * Types into the search box.
 */
function type(value: string): void {
  fireEvent.change(screen.getByRole("combobox", { name: "Search tools" }), { target: { value } });
}

describe("SearchMenu", () => {
  it("focuses the box and offers the popular tools before anything is typed", async () => {
    renderMenu();

    const options = screen.getAllByRole("option");

    await waitFor(() => expect(screen.getByRole("combobox", { name: "Search tools" })).toHaveFocus());
    expect(screen.getByText("Popular tools")).toBeInTheDocument();
    expect(options).toHaveLength(getFeaturedTools().length);
  });

  it("lists matching tools as menu items while typing, each linking to its tool", () => {
    renderMenu();

    type("sha256");

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAccessibleName(/Hash Generator/);
    expect(options[0]).toHaveAttribute("href", "/tools/hash-generator");
    expect(screen.getByRole("status")).toHaveTextContent("1 tool found.");
  });

  it("understands a description of the job, not only a tool's name", () => {
    renderMenu();

    type("how do I make my photo smaller");

    expect(within(screen.getByRole("listbox")).getAllByRole("option")[0]).toHaveAttribute(
      "href",
      "/tools/image-compressor-converter",
    );
  });

  it("says the results are the closest matches when no tool fits every word", () => {
    renderMenu();

    type("excel hash");

    expect(screen.getByText("Closest matches")).toBeInTheDocument();
  });

  it("says when nothing matches", () => {
    renderMenu();

    type("zzzz");

    expect(screen.getByText(/No tools match this search/)).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("moves through the results with the arrow keys and opens the chosen one with Enter", () => {
    const onClose = renderMenu();

    type("date");

    const box = screen.getByRole("combobox", { name: "Search tools" });
    const options = screen.getAllByRole("option");

    expect(options.length).toBeGreaterThan(1);
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    expect(box).toHaveAttribute("aria-activedescendant", options[1]?.id);

    fireEvent.keyDown(box, { key: "ArrowUp" });
    fireEvent.keyDown(box, { key: "ArrowUp" });
    expect(screen.getAllByRole("option").at(-1)).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(box, { key: "Enter" });

    expect(push).toHaveBeenCalledWith((screen.getAllByRole("option").at(-1) as HTMLAnchorElement).getAttribute("href"));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when a result is clicked", () => {
    const onClose = renderMenu();

    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);

    expect(onClose).toHaveBeenCalled();
  });

  it("clears the search with the clear button", () => {
    renderMenu();

    type("sha256");
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByRole("combobox", { name: "Search tools" })).toHaveValue("");
    expect(screen.getByText("Popular tools")).toBeInTheDocument();
  });
});
