import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { MetaTagTool } from "@/components/tools/meta-tag-tool";
import { RobotsSitemapTool } from "@/components/tools/robots-sitemap-tool";
import { SchemaTool } from "@/components/tools/schema-tool";
import { UtmTool } from "@/components/tools/utm-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const downloadBlob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/tools/download", () => ({ downloadBlob }));

beforeEach(() => {
  downloadBlob.mockClear();
});

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * Types into a labelled field.
 */
function type(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * Chooses an option in a drop-down, the way a person would.
 */
function choose(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
}

/**
 * Reads what a read-only output box holds.
 */
function pane(label: string): string {
  return (screen.getByLabelText(label) as HTMLTextAreaElement).value;
}

describe("MetaTagTool", () => {
  it("guides a first-time visitor with what is missing, before anything is typed", () => {
    renderTool(<MetaTagTool />);

    expect(screen.getByText(/Add a page title/)).toBeInTheDocument();
    // The placeholder shows in both previews, the search result and the shared link.
    expect(screen.getAllByText("Your page title appears here")).toHaveLength(2);
  });

  it("writes the tags and updates the previews as you type", () => {
    renderTool(<MetaTagTool />);

    type("Page title", "Free tools for everyday tasks, all in your browser");
    type("Description", "Compress images, convert data, count words, and more, with nothing uploaded and no signup.");
    type("Page address", "https://www.example.com/tools");

    expect(pane("HTML tags")).toContain("<title>Free tools for everyday tasks, all in your browser</title>");
    expect(pane("HTML tags")).toContain('<link rel="canonical" href="https://www.example.com/tools">');
    expect(within(screen.getByLabelText("Search result preview")).getByText("www.example.com › tools", { exact: false })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Shared link preview")).getByText("Free tools for everyday tasks, all in your browser")).toBeInTheDocument();
  });

  it("counts the title against what search results show", () => {
    renderTool(<MetaTagTool />);

    type("Page title", "A".repeat(75));

    expect(screen.getByText("75 of about 60 characters shown in search results.")).toBeInTheDocument();
    expect(screen.getByText(/The title is 75 characters/)).toBeInTheDocument();
  });

  it("loads a complete example that raises no problems, and clears it again", () => {
    renderTool(<MetaTagTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(pane("HTML tags")).toContain('<meta property="og:image" content="https://www.example.com/images/share.png">');
    expect(screen.queryByText(/must be a full web address/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Page title")).toHaveValue("");
  });

  it("reports a page address that is not complete, and adds a robots tag when told", () => {
    renderTool(<MetaTagTool />);

    type("Page address", "/relative");
    expect(screen.getByText(/The page address must be a full web address/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Let search engines show this page" }));
    expect(pane("HTML tags")).toContain('<meta name="robots" content="noindex, follow">');
  });

  it("switches to the small card and says the picture is not loaded", () => {
    renderTool(<MetaTagTool />);

    choose("Card on X", "Small image");

    expect(pane("HTML tags")).toContain('<meta name="twitter:card" content="summary">');
    expect(screen.getByText(/The picture itself is not loaded here/)).toBeInTheDocument();
  });
});

describe("RobotsSitemapTool", () => {
  it("starts with a robots.txt that allows everything", () => {
    renderTool(<RobotsSitemapTool />);

    expect(pane("robots.txt")).toBe("User-agent: *\nDisallow:");
  });

  it("writes the block and allow rules and the sitemap line", () => {
    renderTool(<RobotsSitemapTool />);

    type("Block these paths", "/admin/\n/cart/");
    type("Allow these paths", "/admin/help/");
    type("Sitemap addresses", "https://www.example.com/sitemap.xml");

    expect(pane("robots.txt")).toBe("User-agent: *\nDisallow: /admin/\nDisallow: /cart/\nAllow: /admin/help/\n\nSitemap: https://www.example.com/sitemap.xml");
  });

  it("blocks AI crawlers when asked, and says robots.txt is only a request", () => {
    renderTool(<RobotsSitemapTool />);

    fireEvent.click(screen.getByRole("switch", { name: "Block AI training crawlers" }));

    expect(pane("robots.txt")).toContain("User-agent: GPTBot\nDisallow: /");
    expect(pane("robots.txt")).toContain("User-agent: ClaudeBot\nDisallow: /");
    expect(pane("robots.txt")).not.toContain("OAI-SearchBot");
    expect(screen.getByText(/a request, not a lock/)).toBeInTheDocument();
  });

  it("reports a path that is not valid", () => {
    renderTool(<RobotsSitemapTool />);

    type("Block these paths", "admin");

    expect(screen.getByText(/"admin" is not a valid path/)).toBeInTheDocument();
  });

  it("offers robots.txt as a file", () => {
    renderTool(<RobotsSitemapTool />);

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(downloadBlob.mock.calls[0]?.[1]).toBe("robots.txt");
  });

  it("builds a sitemap from a list of addresses", () => {
    renderTool(<RobotsSitemapTool />);

    fireEvent.click(screen.getByRole("button", { name: "XML sitemap" }));
    type("Page addresses", "https://www.example.com/\nhttps://www.example.com/about");

    expect(pane("sitemap.xml")).toContain("<loc>https://www.example.com/about</loc>");
    expect(screen.getByText("2 addresses in this sitemap.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(downloadBlob.mock.calls[0]?.[1]).toBe("sitemap.xml");
  });

  it("explains a sitemap list that has a problem, and makes no file", () => {
    renderTool(<RobotsSitemapTool />);

    fireEvent.click(screen.getByRole("button", { name: "XML sitemap" }));
    type("Page addresses", "https://www.example.com/\n/relative");

    expect(screen.getByText(/Line 2: "\/relative" is not a full web address/)).toBeInTheDocument();
    expect(pane("sitemap.xml")).toBe("");
  });
});

describe("UtmTool", () => {
  it("asks for the missing pieces before building anything", () => {
    renderTool(<UtmTool />);

    expect(screen.getByText(/Fill in the address, a source, a medium, and a campaign/)).toBeInTheDocument();
  });

  it("builds the link as you type, tidying the values", () => {
    renderTool(<UtmTool />);

    type("Website address", "www.example.com/offers?ref=home");
    type("Source", "newsletter");
    type("Medium", "email");
    type("Campaign", "Spring Sale");

    expect(screen.getByTestId("value-utm-link")).toHaveTextContent(
      "https://www.example.com/offers?ref=home&utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale",
    );
  });

  it("fills the source and medium from a quick start", () => {
    renderTool(<UtmTool />);

    choose("Quick start", "Google ads");

    expect(screen.getByLabelText("Source")).toHaveValue("google");
    expect(screen.getByLabelText("Medium")).toHaveValue("cpc");
  });

  it("warns about capital letters when lower case is switched off", () => {
    renderTool(<UtmTool />);

    type("Website address", "example.com");
    type("Source", "Newsletter");
    type("Medium", "email");
    type("Campaign", "launch");
    fireEvent.click(screen.getByRole("switch", { name: "Lower case" }));

    expect(screen.getByText(/has capital letters/)).toBeInTheDocument();
  });

  it("takes a link apart and picks out the campaign tags", () => {
    renderTool(<UtmTool />);

    fireEvent.click(screen.getByRole("button", { name: "Take a link apart" }));
    type("Link to take apart", "https://www.example.com:8080/a/b?ref=home&utm_source=news#top");

    expect(screen.getByText("www.example.com")).toBeInTheDocument();
    expect(screen.getByText("8080")).toBeInTheDocument();
    expect(screen.getByText("/a/b")).toBeInTheDocument();
    expect(screen.getByText("utm_source")).toBeInTheDocument();
    expect(screen.getByText("Query (2)")).toBeInTheDocument();
  });

  it("points out things worth a second look in a link", () => {
    renderTool(<UtmTool />);

    fireEvent.click(screen.getByRole("button", { name: "Take a link apart" }));
    type("Link to take apart", "http://example.com/?a=1&a=2");

    expect(screen.getByText(/The query repeats a/)).toBeInTheDocument();
    expect(screen.getByText(/uses http, which is not secure/)).toBeInTheDocument();
  });

  it("loads examples in both modes", () => {
    renderTool(<UtmTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    expect(screen.getByTestId("value-utm-link")).toHaveTextContent("utm_campaign=spring-sale");

    fireEvent.click(screen.getByRole("button", { name: "Take a link apart" }));
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    expect(screen.getByText("Query (4)")).toBeInTheDocument();
  });
});

describe("SchemaTool", () => {
  it("starts on FAQ markup and asks for a question, with no tag yet", () => {
    renderTool(<SchemaTool />);

    expect(screen.getByText("Add at least one question with its answer.")).toBeInTheDocument();
    expect(pane("Script tag")).toBe("");
  });

  it("makes FAQ markup and says what Google does with it", () => {
    renderTool(<SchemaTool />);

    type("Question 1", "Is it free?");
    type("Answer 1", "Yes, every tool is free.");

    const script = pane("Script tag");

    expect(script.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(JSON.parse(script.replace(/^<script[^>]*>|<\/script>$/g, ""))).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [{ acceptedAnswer: { text: "Yes, every tool is free." }, name: "Is it free?" }],
    });
    expect(screen.getByText(/government and health/)).toBeInTheDocument();
  });

  it("adds and removes questions, keeping at least one", () => {
    renderTool(<SchemaTool />);

    fireEvent.click(screen.getByRole("button", { name: "Add a question" }));
    expect(screen.getByLabelText("Question 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove question 2" }));
    expect(screen.queryByLabelText("Question 2")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove question 1" })).toBeDisabled();
  });

  it("makes product markup, with the price and the currency checked", () => {
    renderTool(<SchemaTool />);

    choose("Type of markup", "Product");
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    expect(JSON.parse(pane("Script tag").replace(/^<script[^>]*>|<\/script>$/g, ""))).toMatchObject({
      "@type": "Product",
      offers: { availability: "https://schema.org/InStock", price: "9.50", priceCurrency: "USD" },
    });

    type("Price", "$9.50");
    expect(screen.getByText(/The price is a number/)).toBeInTheDocument();
    expect(pane("Script tag")).toBe("");
  });

  it("makes local business markup with opening hours", () => {
    renderTool(<SchemaTool />);

    choose("Type of markup", "Local business");
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(pane("Script tag")).toContain('"@type": "CafeOrCoffeeShop"');
    expect(pane("Script tag")).toContain("Mo-Sa 09:00-23:00");

    type("Opening hours", "Monday 9-5");
    expect(screen.getByText(/not a valid opening time/)).toBeInTheDocument();
  });

  it("makes organization, article, and breadcrumb markup from the examples", () => {
    renderTool(<SchemaTool />);

    for (const [option, expected] of [
      ["Organization", '"@type": "Organization"'],
      ["Article or blog post", '"@type": "BlogPosting"'],
      ["Breadcrumbs", '"@type": "BreadcrumbList"'],
    ] as const) {
      choose("Type of markup", option);
      fireEvent.click(screen.getByRole("button", { name: "Load example" }));

      expect(pane("Script tag"), option).toContain(expected);
    }
  });

  it("keeps what you typed for each type when you switch away and back", () => {
    renderTool(<SchemaTool />);

    type("Question 1", "Is it free?");
    choose("Type of markup", "Product");
    choose("Type of markup", "FAQ page");

    expect(screen.getByLabelText("Question 1")).toHaveValue("Is it free?");
  });
});
