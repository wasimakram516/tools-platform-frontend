import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { transformJson } from "@/lib/tools/json-formatter";
import type { JsonTransformRunner } from "@/lib/tools/json-formatter-worker";
import { JsonFormatterTool } from "./json-formatter-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders the JSON tool with the production Material UI theme.
 */
async function testTransform(
  input: Parameters<JsonTransformRunner>[0],
  mode: Parameters<JsonTransformRunner>[1],
  indentation: Parameters<JsonTransformRunner>[2],
): Promise<ReturnType<typeof transformJson>> {
  return transformJson(input, mode, indentation);
}

/**
 * Renders the formatter with a deterministic test transformation runner.
 */
function renderJsonFormatter(
  transform: JsonTransformRunner = testTransform,
  maxCharacters?: number,
): void {
  render(
    <AppThemeProvider>
      <JsonFormatterTool transform={transform} maxCharacters={maxCharacters} />
    </AppThemeProvider>,
  );
}

describe("JsonFormatterTool", () => {
  it("shows live character counts for the input and output", async () => {
    const user = userEvent.setup();
    renderJsonFormatter();
    const input = screen.getByLabelText("Input");

    await user.type(input, "a");
    expect(screen.getByText("1 character · 4,999,999 remaining")).toBeInTheDocument();

    await user.type(input, "bc");
    expect(screen.getByText("3 characters · 4,999,997 remaining")).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: '{"ready":true}' },
    });

    expect(screen.getByText("14 characters · 4,999,986 remaining")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    await waitFor(() => expect(screen.getByText("19 characters")).toBeInTheDocument());
  });

  it("explains the overage and prevents processing above the character limit", () => {
    const transform = vi.fn(testTransform);
    renderJsonFormatter(transform, 10);

    fireEvent.change(screen.getByLabelText("Input"), {
      target: { value: '{"tooLong":true}' },
    });

    expect(screen.getByText("16 characters · 6 over limit")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Input is 6 characters over the 10-character limit",
    );
    expect(screen.getByRole("button", { name: "Format JSON" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Minify" })).toBeDisabled();
    expect(transform).not.toHaveBeenCalled();
  });

  it("formats valid JSON and reports success", async () => {
    const user = userEvent.setup();
    renderJsonFormatter();

    fireEvent.change(screen.getByLabelText("Input"), {
      target: { value: '{"name":"Wisemen","ready":true}' },
    });
    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Output")).toHaveValue(
        '{\n  "name": "Wisemen",\n  "ready": true\n}',
      ),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Valid JSON");
  });

  it("minifies valid JSON", async () => {
    const user = userEvent.setup();
    renderJsonFormatter();

    fireEvent.change(screen.getByLabelText("Input"), {
      target: { value: '{\n  "items": [1, 2]\n}' },
    });
    await user.click(screen.getByRole("button", { name: "Minify" }));

    await waitFor(() => expect(screen.getByLabelText("Output")).toHaveValue('{"items":[1,2]}'));
  });

  it("shows an actionable validation error and clears stale output", async () => {
    const user = userEvent.setup();
    renderJsonFormatter();

    fireEvent.change(screen.getByLabelText("Input"), {
      target: { value: '{"broken": }' },
    });
    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Output")).toHaveValue("");
  });

  it("shows progress while a worker transformation is pending", async () => {
    let resolveTransform: ((result: ReturnType<typeof transformJson>) => void) | undefined;
    const pendingTransform: JsonTransformRunner = vi.fn(
      () =>
        new Promise<ReturnType<typeof transformJson>>((resolve) => {
          resolveTransform = resolve;
        }),
    );
    const user = userEvent.setup();
    renderJsonFormatter(pendingTransform);

    fireEvent.change(screen.getByLabelText("Input"), {
      target: { value: '{"large":true}' },
    });
    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(screen.getByRole("progressbar", { name: "Processing JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Processing…" })).toBeDisabled();

    resolveTransform?.(transformJson('{"large":true}', "format", 2));
    await waitFor(() =>
      expect(screen.queryByRole("progressbar", { name: "Processing JSON" })).not.toBeInTheDocument(),
    );
  });

  it("loads an example, clears the workspace, and copies a result", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderJsonFormatter();

    await user.click(screen.getByRole("button", { name: "Load example" }));
    expect(screen.getByLabelText("Input")).toHaveValue(
      '{"project":"QuicklySorted","private":true,"categories":["developer","image"]}',
    );

    await user.click(screen.getByRole("button", { name: "Format JSON" }));
    await user.click(screen.getByRole("button", { name: "Copy result" }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("copied");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Input")).toHaveValue("");
    expect(screen.getByLabelText("Output")).toHaveValue("");
  });
});
