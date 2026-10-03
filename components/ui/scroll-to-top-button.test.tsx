import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Moves the simulated scroll position and notifies listeners.
 */
function scrollTo(position: number): void {
  Object.defineProperty(window, "pageYOffset", { configurable: true, value: position });
  act(() => {
    fireEvent.scroll(window);
  });
}

describe("ScrollToTopButton", () => {
  afterEach(() => {
    scrollTo(0);
    vi.restoreAllMocks();
  });

  it("stays hidden at the top and appears after scrolling", () => {
    render(
      <AppThemeProvider>
        <ScrollToTopButton />
      </AppThemeProvider>,
    );

    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();

    scrollTo(800);

    expect(screen.getByRole("button", { name: "Back to top" })).toBeInTheDocument();
  });

  it("scrolls back to the top when clicked", async () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(
      <AppThemeProvider>
        <ScrollToTopButton />
      </AppThemeProvider>,
    );

    scrollTo(800);
    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
