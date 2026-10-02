import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { JwtDecoderTool } from "./jwt-decoder-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders the JWT decoder inside the application theme.
 */
function renderJwtTool(maxCharacters?: number): void {
  render(
    <AppThemeProvider>
      <JwtDecoderTool maxCharacters={maxCharacters} />
    </AppThemeProvider>,
  );
}

describe("JwtDecoderTool", () => {
  it("warns that decoding is not verification and reports input characters", async () => {
    renderJwtTool();

    expect(screen.getByText(/decoding does not verify/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("JWT input"), { target: { value: "abc.def.ghi" } });
    expect(screen.getByText(/11 characters/)).toBeInTheDocument();
  });

  it("decodes the example into separate header and payload outputs", async () => {
    const user = userEvent.setup();
    renderJwtTool();

    await user.click(screen.getByRole("button", { name: "Load example" }));
    await user.click(screen.getByRole("button", { name: "Decode token" }));

    expect(screen.getByLabelText("Decoded header")).toHaveValue(
      '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
    );
    expect(screen.getByLabelText("Decoded payload")).toHaveValue(
      '{\n  "sub": "demo-user",\n  "role": "developer"\n}',
    );
    expect(screen.getByText("Algorithm: HS256")).toBeInTheDocument();
    expect(screen.getByText("Signature present")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Signature not verified");
  });

  it("shows actionable errors and clears stale decoded output when input changes", async () => {
    const user = userEvent.setup();
    renderJwtTool();

    await user.click(screen.getByRole("button", { name: "Load example" }));
    await user.click(screen.getByRole("button", { name: "Decode token" }));
    fireEvent.change(screen.getByLabelText("JWT input"), { target: { value: "invalid" } });

    expect(screen.getByLabelText("Decoded header")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Decode token" }));
    expect(screen.getAllByRole("alert").at(-1)).toHaveTextContent("three dot-separated parts");
  });

  it("copies decoded sections independently and clears the workspace", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderJwtTool();

    await user.click(screen.getByRole("button", { name: "Load example" }));
    await user.click(screen.getByRole("button", { name: "Decode token" }));
    await user.click(screen.getByRole("button", { name: "Copy header" }));
    await user.click(screen.getByRole("button", { name: "Copy payload" }));

    expect(writeText).toHaveBeenNthCalledWith(1, expect.stringContaining('"alg": "HS256"'));
    expect(writeText).toHaveBeenNthCalledWith(2, expect.stringContaining('"role": "developer"'));

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("JWT input")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Copy header" })).toBeDisabled();
  });

  it("blocks decoding when the configured character limit is exceeded", () => {
    renderJwtTool(5);

    fireEvent.change(screen.getByLabelText("JWT input"), { target: { value: "abcdef" } });

    expect(screen.getByRole("button", { name: "Decode token" })).toBeDisabled();
    const errorAlert = screen.getAllByRole("alert").at(-1);
    expect(errorAlert).toHaveTextContent("exceeds the 5 character");
    expect(within(errorAlert as HTMLElement).getByText(/local-processing limit/)).toBeInTheDocument();
  });
});
