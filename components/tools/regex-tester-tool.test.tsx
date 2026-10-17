import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { RegexTesterTool } from "@/components/tools/regex-tester-tool";
import { runRegex, type RegexRequest } from "@/lib/tools/regex-tester";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Runs the real matching logic without a worker.
 */
function directRunner() {
  return vi.fn((request: RegexRequest) => Promise.resolve(runRegex(request)));
}

/**
 * Renders the tool with a stand-in runner so no browser worker is needed.
 */
function renderTool(run = directRunner()) {
  render(
    <AppThemeProvider>
      <RegexTesterTool run={run} />
    </AppThemeProvider>,
  );

  return run;
}

describe("RegexTesterTool", () => {
  it("highlights and lists matches with their groups", async () => {
    renderTool();

    fireEvent.change(screen.getByLabelText("Pattern"), { target: { value: "(\\d)(\\d)" } });
    fireEvent.change(screen.getByLabelText("Text to test"), { target: { value: "a12 b34" } });

    expect(await screen.findByTestId("regex-match-2")).toHaveTextContent("Match 2 at position 5");
    expect(screen.getByTestId("regex-match-1")).toHaveTextContent('Group 1: "1"');
    expect(screen.getByTestId("regex-highlight").querySelectorAll("mark")).toHaveLength(2);
    expect(screen.getByText("2 matches found.")).toBeInTheDocument();
  });

  it("shows a syntax error in plain words", async () => {
    renderTool();

    fireEvent.change(screen.getByLabelText("Pattern"), { target: { value: "(oops" } });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("previews a replacement", async () => {
    renderTool();

    fireEvent.change(screen.getByLabelText("Pattern"), { target: { value: "cat" } });
    fireEvent.change(screen.getByLabelText("Text to test"), { target: { value: "a cat" } });
    fireEvent.change(screen.getByLabelText("Replace with (optional)"), { target: { value: "dog" } });

    await waitFor(() => expect(screen.getByTestId("value-replaced")).toHaveTextContent("a dog"));
  });

  it("turns off the first-match-only behaviour when the global flag is switched off", async () => {
    const run = renderTool();

    fireEvent.change(screen.getByLabelText("Pattern"), { target: { value: "a" } });
    fireEvent.change(screen.getByLabelText("Text to test"), { target: { value: "aaa" } });
    await screen.findByTestId("regex-match-3");

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Global (g)"));
    });

    await waitFor(() => expect(run).toHaveBeenLastCalledWith(expect.objectContaining({ flags: "" })));
    await waitFor(() => expect(screen.queryByTestId("regex-match-2")).not.toBeInTheDocument());
  });

  it("loads an example and clears it again", async () => {
    renderTool();

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(await screen.findByTestId("regex-match-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Pattern")).toHaveValue("");
    expect(screen.getByText("The matches appear here as you type.")).toBeInTheDocument();
  });

  it("reports a worker that could not start", async () => {
    renderTool(vi.fn().mockRejectedValue(new Error("Worker unavailable.")));

    fireEvent.change(screen.getByLabelText("Pattern"), { target: { value: "a" } });

    expect(await screen.findByText("Worker unavailable.")).toBeInTheDocument();
  });
});
