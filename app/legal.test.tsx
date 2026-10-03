import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/privacy/page";
import TermsPage, { metadata as termsMetadata } from "@/app/terms/page";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { LEGAL_DOCUMENTS } from "@/lib/legal/legal-content";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a page with the production Material UI theme.
 */
function renderPage(page: ReactNode): void {
  render(<AppThemeProvider>{page}</AppThemeProvider>);
}

describe("legal pages", () => {
  it("renders the privacy policy with numbered sections and one h1", () => {
    renderPage(<PrivacyPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. Your tool input" })).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it("renders the terms of use", () => {
    renderPage(<TermsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /governing law/i })).toBeInTheDocument();
  });

  it("links both documents from the footer", () => {
    renderPage(<PrivacyPage />);

    const footer = screen.getByRole("contentinfo");
    const hrefs = Array.from(footer.querySelectorAll("a")).map((link) => link.getAttribute("href"));

    for (const document of LEGAL_DOCUMENTS) {
      expect(hrefs).toContain(`/${document.slug}`);
    }
  });

  it("renders contact and cross-reference text as real links", () => {
    renderPage(<PrivacyPage />);

    const contact = screen.getByRole("link", { name: "wisemensoft.com" });
    expect(contact).toHaveAttribute("href", "https://wisemensoft.com");
    expect(screen.getByRole("link", { name: "company site" })).toHaveAttribute(
      "href",
      "https://wisemensoft.com",
    );
  });

  it("links the terms back to the privacy policy", () => {
    renderPage(<TermsPage />);

    expect(
      within(screen.getByRole("main")).getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("never leaves a raw link marker or template placeholder in the text", () => {
    for (const document of LEGAL_DOCUMENTS) {
      const text = document.sections.flatMap((section) => section.paragraphs).join(" ");
      expect(text).not.toContain("${");
    }
  });

  it("sets canonical metadata for each document", () => {
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
    expect(termsMetadata.alternates?.canonical).toBe("/terms");
  });
});
