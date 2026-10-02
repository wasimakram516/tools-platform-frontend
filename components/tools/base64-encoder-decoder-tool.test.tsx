import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { transformBase64 } from "@/lib/tools/base64";
import type { Base64TransformRunner } from "@/lib/tools/base64-worker";
import { Base64EncoderDecoderTool } from "./base64-encoder-decoder-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Runs Base64 transforms synchronously behind the component's async contract.
 */
async function testTransform(
  input: Parameters<Base64TransformRunner>[0],
  mode: Parameters<Base64TransformRunner>[1],
): Promise<ReturnType<typeof transformBase64>> {
  return transformBase64(input, mode);
}

/**
 * Renders the Base64 workspace with deterministic local processing.
 */
function renderBase64Tool(
  transform: Base64TransformRunner = testTransform,
  maxCharacters?: number,
): void {
  render(
    <AppThemeProvider>
      <Base64EncoderDecoderTool transform={transform} maxCharacters={maxCharacters} />
    </AppThemeProvider>,
  );
}

describe("Base64EncoderDecoderTool", () => {
  it("updates the character count on each input change and encodes text", async () => {
    const user = userEvent.setup();
    renderBase64Tool();
    const input = screen.getByLabelText("Plain text");

    fireEvent.change(input, { target: { value: "H" } });
    expect(screen.getByText("1 character · 4,999,999 remaining")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Hi" } });

    expect(screen.getByText("2 characters · 4,999,998 remaining")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Encode text" }));

    await waitFor(() => expect(screen.getByLabelText("Base64 output")).toHaveValue("SGk="));
    expect(screen.getByRole("status")).toHaveTextContent("Encoded successfully");
  });

  it("switches modes and shows an actionable decode error", async () => {
    const user = userEvent.setup();
    renderBase64Tool();

    await user.click(screen.getByRole("button", { name: "Decode" }));
    fireEvent.change(screen.getByLabelText("Base64 input"), {
      target: { value: "not base64!" },
    });
    await user.click(screen.getByRole("button", { name: "Decode Base64" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter valid Base64 text");
    expect(screen.getByLabelText("Decoded text")).toHaveValue("");
  });

  it("moves an encoded result into decode mode", async () => {
    const user = userEvent.setup();
    renderBase64Tool();

    fireEvent.change(screen.getByLabelText("Plain text"), { target: { value: "Hello" } });
    await user.click(screen.getByRole("button", { name: "Encode text" }));
    await user.click(screen.getByRole("button", { name: "Use result as input" }));

    expect(screen.getByLabelText("Base64 input")).toHaveValue("SGVsbG8=");
    expect(screen.getByRole("button", { name: "Decode Base64" })).toBeInTheDocument();
  });

  it("loads examples, copies output, and clears the workspace", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderBase64Tool();

    await user.click(screen.getByRole("button", { name: "Load example" }));
    await user.click(screen.getByRole("button", { name: "Encode text" }));
    await user.click(screen.getByRole("button", { name: "Copy result" }));

    expect(writeText).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Plain text")).toHaveValue("");
    expect(screen.getByLabelText("Base64 output")).toHaveValue("");
  });

  it("prevents processing above the configured character limit", () => {
    const transform = vi.fn(testTransform);
    renderBase64Tool(transform, 3);

    fireEvent.change(screen.getByLabelText("Plain text"), { target: { value: "Tools" } });

    expect(screen.getByText("5 characters · 2 over limit")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("2 characters over the 3-character limit");
    expect(screen.getByRole("button", { name: "Encode text" })).toBeDisabled();
    expect(transform).not.toHaveBeenCalled();
  });
});
