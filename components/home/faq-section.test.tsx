import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { FAQ_VISIBLE_COUNT, FaqSection } from "@/components/home/faq-section";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { FAQ_ITEMS } from "@/lib/home-content";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders the FAQ section alone, which is much faster than rendering the whole home page.
 */
function renderFaq(): HTMLElement {
  const { container } = render(
    <AppThemeProvider>
      <FaqSection />
    </AppThemeProvider>,
  );

  return container;
}

/**
 * The question buttons in the FAQ, leaving out the "Show more" button.
 */
function questionButtons(faq: HTMLElement): HTMLElement[] {
  return within(faq)
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-controls")?.startsWith("faq-") && button.id.endsWith("-header"));
}

describe("FaqSection", () => {
  it("shows the first questions, then the rest on request, and hides them again", () => {
    renderFaq();

    const faq = screen.getByRole("region", { name: "Frequently asked questions" });
    const toggle = within(faq).getByRole("button", { name: /Show more questions/ });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(questionButtons(faq)).toHaveLength(FAQ_VISIBLE_COUNT);

    fireEvent.click(toggle);
    expect(within(faq).getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
    expect(questionButtons(faq)).toHaveLength(FAQ_ITEMS.length);

    fireEvent.click(within(faq).getByRole("button", { name: "Show less" }));
    expect(within(faq).getByRole("button", { name: /Show more questions/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes an open answer that would be hidden along with the extra questions", () => {
    renderFaq();

    const faq = screen.getByRole("region", { name: "Frequently asked questions" });

    fireEvent.click(within(faq).getByRole("button", { name: /Show more questions/ }));
    fireEvent.click(questionButtons(faq)[FAQ_VISIBLE_COUNT] as HTMLElement);
    expect(questionButtons(faq)[FAQ_VISIBLE_COUNT]).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(within(faq).getByRole("button", { name: "Show less" }));
    fireEvent.click(within(faq).getByRole("button", { name: /Show more questions/ }));

    expect(questionButtons(faq)[FAQ_VISIBLE_COUNT]).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps every answer in the page for search engines, even while folded away", () => {
    const text = renderFaq().textContent ?? "";

    for (const item of FAQ_ITEMS) {
      expect(text, item.id).toContain(item.answer);
    }
  });
});
