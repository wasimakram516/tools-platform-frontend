import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolSearch, type ToolSearchProps } from "@/components/search/tool-search";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockClear();
});

const INLINE: ToolSearchProps = {
  clearOnEscape: true,
  hint: "/",
  idPrefix: "test-search",
  label: "Search all tools",
  layout: "dropdown",
  placeholder: "What do you need to do?",
  showPopularWhenEmpty: false,
  tone: "onLight",
};

/**
 * Renders the search inside the production theme.
 */
function renderSearch(props: Partial<ToolSearchProps> = {}, onNavigate?: () => void): HTMLInputElement {
  render(
    <AppThemeProvider>
      <ToolSearch {...INLINE} {...props} onNavigate={onNavigate} />
    </AppThemeProvider>,
  );

  return screen.getByRole("combobox", { name: props.label ?? INLINE.label }) as HTMLInputElement;
}

describe("ToolSearch on a page", () => {
  it("lists nothing until something is typed, when it is told not to show popular tools", () => {
    const box = renderSearch();

    fireEvent.focus(box);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("finds a tool from its name and from a plain description of the job", () => {
    const box = renderSearch();

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: "sha256" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("href", "/tools/hash-generator");

    fireEvent.change(box, { target: { value: "how do I make a photo smaller" } });
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("href", "/tools/image-compressor-converter");
    expect(screen.getByRole("status")).toHaveTextContent(/tools? found\./);
  });

  it("marks closest matches, and says when nothing matches", () => {
    const box = renderSearch();

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: "excel hash" } });
    expect(screen.getByText("Closest matches")).toBeInTheDocument();

    fireEvent.change(box, { target: { value: "zzzz" } });
    expect(screen.getByText(/No tools match this search/)).toBeInTheDocument();
  });

  it("moves through the results with the arrow keys and opens the chosen one with Enter", () => {
    const onNavigate = vi.fn();
    const box = renderSearch({}, onNavigate);

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: "date" } });

    const options = screen.getAllByRole("option");

    expect(options[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    expect(box).toHaveAttribute("aria-activedescendant", options[1]?.id);

    fireEvent.keyDown(box, { key: "Enter" });

    expect(push).toHaveBeenCalledWith(options[1]?.getAttribute("href"));
    expect(onNavigate).toHaveBeenCalled();
  });

  it("clears the text with Escape, and with the clear button", () => {
    const box = renderSearch();

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: "json" } });
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);

    fireEvent.keyDown(box, { key: "Escape" });
    expect(box).toHaveValue("");
    expect(screen.queryAllByRole("option")).toHaveLength(0);

    fireEvent.change(box, { target: { value: "json" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(box).toHaveValue("");
  });

  it("does not claim a list is open when nothing is listed", () => {
    const box = renderSearch();

    fireEvent.focus(box);
    expect(box).toHaveAttribute("aria-expanded", "false");
    expect(box).not.toHaveAttribute("aria-controls");

    fireEvent.change(box, { target: { value: "json" } });
    expect(box).toHaveAttribute("aria-expanded", "true");
    expect(box).toHaveAttribute("aria-controls", "test-search-results");
  });
});

describe("ToolSearch as a dropdown with popular tools", () => {
  it("shows the popular tools when the box is focused, and hides them when focus leaves", () => {
    const box = renderSearch({ showPopularWhenEmpty: true });

    expect(screen.queryAllByRole("option")).toHaveLength(0);

    fireEvent.focus(box);
    expect(screen.getByText("Popular tools")).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);

    fireEvent.change(box, { target: { value: "json" } });
    expect(screen.queryByText("Popular tools")).not.toBeInTheDocument();

    fireEvent.blur(box);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});

describe("ToolSearch in the floating dialog", () => {
  it("offers the popular tools before anything is typed", () => {
    renderSearch({ hint: "Esc", layout: "flow", showPopularWhenEmpty: true, tone: "onDark" });

    expect(screen.getByText("Popular tools")).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
  });
});
