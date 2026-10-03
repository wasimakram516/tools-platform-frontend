import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ColorModeToggle } from "@/components/ui/color-mode-toggle";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

describe("ColorModeToggle", () => {
  it("starts in light mode and switches to dark and back", async () => {
    const user = userEvent.setup();
    render(
      <AppThemeProvider>
        <ColorModeToggle />
      </AppThemeProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "Switch to dark mode" }));
    await user.click(await screen.findByRole("button", { name: "Switch to light mode" }));

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("names the new mode in a pill while the theme switches", async () => {
    const user = userEvent.setup();
    render(
      <AppThemeProvider>
        <ColorModeToggle />
      </AppThemeProvider>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Switch to dark mode" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Dark mode");
  });
});
