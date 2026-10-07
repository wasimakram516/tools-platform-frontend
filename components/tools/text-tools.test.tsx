import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { CaseConverterTool } from "@/components/tools/case-converter-tool";
import { CharacterCounterTool } from "@/components/tools/character-counter-tool";
import { RemoveDuplicateLinesTool } from "@/components/tools/remove-duplicate-lines-tool";
import { SortLinesTool } from "@/components/tools/sort-lines-tool";
import { WordCounterTool } from "@/components/tools/word-counter-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * Types into a labelled text box.
 */
function type(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * Reads the text of a labelled text box.
 */
function valueOf(label: string | RegExp): string {
  return (screen.getByLabelText(label) as HTMLTextAreaElement).value;
}

/**
 * Reads the value shown for a statistic, such as "Words".
 */
function stat(label: string): string {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent ?? "";
}

/**
 * Picks an option from a labelled dropdown.
 */
function choose(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
}

describe("WordCounterTool", () => {
  it("counts words, characters, sentences, paragraphs, and lines as you type", async () => {
    renderTool(<WordCounterTool />);

    type("Your text", "Hello world. How are you?\n\nFine, thanks!");

    await waitFor(() => expect(stat("Words")).toBe("7"));
    expect(stat("Characters")).toBe("40");
    expect(stat("Sentences")).toBe("3");
    expect(stat("Paragraphs")).toBe("2");
    expect(stat("Lines")).toBe("3");
  });

  it("shows the most used words, lengths, and estimated times", async () => {
    renderTool(<WordCounterTool />);

    type("Your text", "the cat and the dog and the bird");

    await waitFor(() => expect(stat("Words")).toBe("8"));
    expect(stat("Reading time (estimate)")).toBe("2 sec");
    expect(stat("Average word length")).toBe("3.1 letters");
    expect(stat("Average sentence length")).toBe("8 words");
    expect(screen.getByText("Longest words: bird, and, cat")).toBeInTheDocument();

    const table = screen.getByRole("table");

    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("the3");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("37.5%");
  });

  it("can leave common words out of the keyword table", async () => {
    renderTool(<WordCounterTool />);

    type("Your text", "the cat and the dog and the bird");
    await waitFor(() => expect(stat("Words")).toBe("8"));

    fireEvent.click(screen.getByLabelText("Ignore common words in the keyword table"));

    const table = screen.getByRole("table");

    expect(within(table).queryByText("the")).not.toBeInTheDocument();
    expect(within(table).getByText("cat")).toBeInTheDocument();
  });

  it("starts at zero and returns there after Clear", async () => {
    renderTool(<WordCounterTool />);

    expect(stat("Words")).toBe("0");
    expect(screen.getByText("The most used words appear here once you add text.")).toBeInTheDocument();

    type("Your text", "one two three");
    await waitFor(() => expect(stat("Words")).toBe("3"));

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => expect(stat("Words")).toBe("0"));
    expect(valueOf("Your text")).toBe("");
  });
});

describe("CharacterCounterTool", () => {
  it("counts characters with and without spaces", async () => {
    renderTool(<CharacterCounterTool />);

    type("Your text", "a b c");

    await waitFor(() => expect(stat("Characters")).toBe("5"));
    expect(stat("Without spaces")).toBe("3");
    expect(stat("Size in UTF-8 bytes")).toBe("5");
  });

  it("breaks the text down by kind of character", async () => {
    renderTool(<CharacterCounterTool />);

    type("Your text", "Hello, World 123!");

    await waitFor(() => expect(stat("Letters")).toBe("10"));
    expect(stat("Capital letters")).toBe("2");
    expect(stat("Lower case letters")).toBe("8");
    expect(stat("Digits")).toBe("3");
    expect(stat("Spaces and line breaks")).toBe("2");
    expect(stat("Punctuation")).toBe("2");
    expect(stat("Symbols and emoji")).toBe("0");
  });

  it("shows how much room is left under a preset limit, and how far over it is", async () => {
    renderTool(<CharacterCounterTool />);

    type("Your text", "x".repeat(200));
    fireEvent.click(screen.getByRole("button", { name: "SMS 160" }));

    expect(await screen.findByText("40 characters over the limit")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "X post 280" }));

    expect(await screen.findByText("80 characters left")).toBeInTheDocument();
  });

  it("offers presets for common platforms and accepts a limit typed in", async () => {
    renderTool(<CharacterCounterTool />);

    expect(screen.getByRole("button", { name: "LinkedIn post 3,000" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Instagram caption 2,200" })).toBeInTheDocument();

    type("Your text", "hello");
    type("Character limit", "6");

    expect(await screen.findByText("1 character left")).toBeInTheDocument();
  });

  it("has no progress bar above the editor", () => {
    renderTool(<CharacterCounterTool />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("CaseConverterTool", () => {
  it("converts to title case by default and updates as you type", () => {
    renderTool(<CaseConverterTool />);

    type("Your text", "the lord of the rings");

    expect(valueOf(/Result in Title Case/)).toBe("The Lord of the Rings");
  });

  it("switches style", () => {
    renderTool(<CaseConverterTool />);

    type("Your text", "the quick brown fox");
    choose("Convert to", "snake_case");

    expect(valueOf(/Result in snake_case/)).toBe("the_quick_brown_fox");
  });

  it("lists the text in every style at once, each with its own copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTool(<CaseConverterTool />);

    expect(screen.queryByText("Every style at once")).not.toBeInTheDocument();

    type("Your text", "hello big world");

    expect(screen.getByText("Every style at once")).toBeInTheDocument();
    expect(screen.getByTestId("value-camel")).toHaveTextContent("helloBigWorld");
    expect(screen.getByTestId("value-train")).toHaveTextContent("Hello-Big-World");
    expect(screen.getByTestId("value-slug")).toHaveTextContent("hello-big-world");

    fireEvent.click(screen.getByRole("button", { name: "Copy CONSTANT_CASE" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("HELLO_BIG_WORLD"));
    expect(await screen.findByText("CONSTANT_CASE copied.")).toBeInTheDocument();
  });

  it("copies the main result", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTool(<CaseConverterTool />);

    expect(screen.getByRole("button", { name: "Copy result" })).toBeDisabled();

    type("Your text", "hello world");
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Hello World"));
    expect(await screen.findByText("Result copied.")).toBeInTheDocument();
  });

  it("loads an example", () => {
    renderTool(<CaseConverterTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(valueOf("Your text")).toContain("quick brown fox");
    expect(valueOf(/Result in/)).toContain("Quick Brown Fox");
  });
});

describe("SortLinesTool", () => {
  it("sorts a list A to Z by default and says how many lines", () => {
    renderTool(<SortLinesTool />);

    type("Your list", "banana\nApple\ncherry");

    expect(valueOf("Sorted list")).toBe("Apple\nbanana\ncherry");
    expect(screen.getByText("3 lines sorted: A to Z.")).toBeInTheDocument();
  });

  it("sorts Z to A, by length, and in reverse", () => {
    renderTool(<SortLinesTool />);

    type("Your list", "bb\nccc\na");

    choose("Sort by", "Z to A");
    expect(valueOf("Sorted list")).toBe("ccc\nbb\na");

    choose("Sort by", "Shortest line first");
    expect(valueOf("Sorted list")).toBe("a\nbb\nccc");

    choose("Sort by", "Longest line first");
    expect(valueOf("Sorted list")).toBe("ccc\nbb\na");

    choose("Sort by", "Reverse the current order");
    expect(valueOf("Sorted list")).toBe("a\nccc\nbb");
  });

  it("keeps a shuffle steady until you shuffle again", () => {
    renderTool(<SortLinesTool />);

    type("Your list", Array.from({ length: 30 }, (_, index) => `line ${index}`).join("\n"));
    choose("Sort by", "Shuffle randomly");

    const first = valueOf("Sorted list");

    // An unrelated re-render, such as pressing Clear then loading again, must not reshuffle.
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));
    expect(valueOf("Sorted list")).toBe(first);
    expect(first.split("\n").sort()).toEqual(Array.from({ length: 30 }, (_, index) => `line ${index}`).sort());

    fireEvent.click(screen.getByRole("button", { name: "Shuffle again" }));
    expect(valueOf("Sorted list")).not.toBe(first);
  });

  it("puts numbers in order, trims, and removes duplicates when asked", () => {
    renderTool(<SortLinesTool />);

    type("Your list", "item 10\n item 2\nitem 1\nitem 1");
    expect(valueOf("Sorted list")).toBe("item 1\nitem 1\nitem 10\n item 2".split("\n").sort((a, b) => a.localeCompare(b)).join("\n"));

    fireEvent.click(screen.getByLabelText("Numbers in order"));
    fireEvent.click(screen.getByLabelText("Trim lines"));
    fireEvent.click(screen.getByLabelText("Remove duplicates"));

    expect(valueOf("Sorted list")).toBe("item 1\nitem 2\nitem 10");
  });
});

describe("RemoveDuplicateLinesTool", () => {
  it("removes repeated lines and reports what changed", () => {
    renderTool(<RemoveDuplicateLinesTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(valueOf("List without duplicates")).toBe("apple\nbanana\ncherry\n cherry");
    expect(screen.getByText("3 lines removed, 4 lines kept.")).toBeInTheDocument();
  });

  it("lists the most repeated lines with their counts", () => {
    renderTool(<RemoveDuplicateLinesTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(rows[1]).toHaveTextContent("apple3");
    expect(rows[2]).toHaveTextContent("banana2");
  });

  it("says when no line repeats", () => {
    renderTool(<RemoveDuplicateLinesTool />);

    type("Your list", "a\nb\nc");

    expect(screen.getByText("No line appears more than once.")).toBeInTheDocument();
  });

  it("can keep only unique lines, or only the repeated ones", () => {
    renderTool(<RemoveDuplicateLinesTool />);

    type("Your list", "a\nb\na\nc\nb\nd");

    fireEvent.click(screen.getByRole("button", { name: "Keep only unique lines" }));
    expect(valueOf("Resulting list")).toBe("c\nd");

    fireEvent.click(screen.getByRole("button", { name: "Keep only repeated lines" }));
    expect(valueOf("Resulting list")).toBe("a\nb");
  });

  it("can ignore spaces at the ends and tell upper and lower case apart", () => {
    renderTool(<RemoveDuplicateLinesTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    fireEvent.click(screen.getByLabelText("Ignore spaces at the ends"));

    expect(valueOf("List without duplicates")).toBe("apple\nbanana\ncherry");

    fireEvent.click(screen.getByLabelText("Match case"));

    expect(valueOf("List without duplicates")).toBe("apple\nbanana\nApple\ncherry");
  });
});
