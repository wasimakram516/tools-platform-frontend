import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { transformUrlComponent } from "@/lib/tools/url-encoder";
import type { UrlTransformRunner } from "@/lib/tools/url-encoder-worker";
import { UrlEncoderDecoderTool } from "./url-encoder-decoder-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/** Runs URL transforms synchronously behind the component's async contract. */
async function testTransform(
  input: Parameters<UrlTransformRunner>[0],
  mode: Parameters<UrlTransformRunner>[1],
): Promise<ReturnType<typeof transformUrlComponent>> {
  return transformUrlComponent(input, mode);
}

/** Renders the URL tool with deterministic local processing. */
function renderUrlTool(
  transform: UrlTransformRunner = testTransform,
  maxCharacters?: number,
): void {
  render(
    <AppThemeProvider>
      <UrlEncoderDecoderTool transform={transform} maxCharacters={maxCharacters} />
    </AppThemeProvider>,
  );
}

describe("UrlEncoderDecoderTool", () => {
  it("encodes a URL component and updates character counts", async () => {
    const user = userEvent.setup();
    renderUrlTool();

    fireEvent.change(screen.getByLabelText("Plain text"), { target: { value: "hello world" } });
    expect(screen.getByText("11 characters · 4,999,989 remaining")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Encode component" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Encoded component")).toHaveValue("hello%20world"),
    );
  });

  it("decodes a result after reversing direction", async () => {
    const user = userEvent.setup();
    renderUrlTool();

    fireEvent.change(screen.getByLabelText("Plain text"), { target: { value: "a/b" } });
    await user.click(screen.getByRole("button", { name: "Encode component" }));
    await user.click(screen.getByRole("button", { name: "Use result as input" }));
    await user.click(screen.getByRole("button", { name: "Decode component" }));

    await waitFor(() => expect(screen.getByLabelText("Decoded text")).toHaveValue("a/b"));
  });

  it("shows malformed percent-encoding and input-limit errors", async () => {
    const user = userEvent.setup();
    renderUrlTool(testTransform, 4);

    await user.click(screen.getByRole("button", { name: "Decode" }));
    fireEvent.change(screen.getByLabelText("Encoded component"), { target: { value: "%ZZ" } });
    await user.click(screen.getByRole("button", { name: "Decode component" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Every % must be followed");

    fireEvent.change(screen.getByLabelText("Encoded component"), { target: { value: "12345" } });
    expect(screen.getByRole("alert")).toHaveTextContent("1 character over the 4-character limit");
    expect(screen.getByRole("button", { name: "Decode component" })).toBeDisabled();
  });
});
