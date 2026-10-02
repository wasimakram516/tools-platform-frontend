import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import ErrorPage from "./error";
import Loading from "./loading";
import NotFound from "./not-found";
import HomePage from "./page";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a component with the application theme used in production.
 */
function renderWithTheme(component: ReactNode): void {
  render(<AppThemeProvider>{component}</AppThemeProvider>);
}

describe("application foundation", () => {
  it("renders the platform promise and pillars", () => {
    renderWithTheme(<HomePage />);

    expect(screen.getByRole("heading", { name: /useful work/i })).toBeInTheDocument();
    expect(screen.getByText("No file retention")).toBeInTheDocument();
  });

  it("renders an accessible loading state", () => {
    renderWithTheme(<Loading />);

    expect(screen.getByRole("status", { name: /loading page/i })).toBeInTheDocument();
  });

  it("renders the not-found state", () => {
    renderWithTheme(<NotFound />);

    expect(screen.getByRole("heading", { name: /tool not found/i })).toBeInTheDocument();
  });

  it("allows retrying after a route error", () => {
    const reset = vi.fn();
    renderWithTheme(<ErrorPage error={new Error("test failure")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
