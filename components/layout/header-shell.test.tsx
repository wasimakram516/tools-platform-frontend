import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderShell } from "@/components/layout/header-shell";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

import type { PropsWithChildren } from "react";

const SCREEN_HEIGHT = 800;

/**
 * Pretends the page is a given size and scrolled to a given place.
 */
function setViewport(width: number, scrollY: number): void {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", SCREEN_HEIGHT);
  vi.stubGlobal("scrollY", scrollY);
}

beforeEach(() => {
  setViewport(1280, 0);
  render(
    <AppThemeProvider>
      <HeaderShell>
        <span>Header content</span>
      </HeaderShell>
    </AppThemeProvider>,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HeaderShell", () => {
  it("starts as a plain bar and shows its content", () => {
    expect(screen.getByRole("banner")).toHaveAttribute("data-floating", "false");
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("floats into a pill once the page is scrolled past the first screen, and back at the top", () => {
    act(() => {
      setViewport(1280, 600);
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("banner")).toHaveAttribute("data-floating", "true");

    act(() => {
      setViewport(1280, 10);
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("banner")).toHaveAttribute("data-floating", "false");
  });

  it("stays a plain bar on a phone, however far the page is scrolled", () => {
    act(() => {
      setViewport(390, 2000);
      fireEvent.scroll(window);
    });

    expect(screen.getByRole("banner")).toHaveAttribute("data-floating", "false");
  });

  it("does not float for a small scroll", () => {
    act(() => {
      setViewport(1280, 200);
      fireEvent.scroll(window);
    });

    expect(screen.getByRole("banner")).toHaveAttribute("data-floating", "false");
  });
});
