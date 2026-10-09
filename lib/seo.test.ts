import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  organizationJsonLd,
  toolJsonLd,
  toolListJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { LEGAL_LAST_UPDATED, LEGAL_LAST_UPDATED_ISO } from "@/lib/legal/legal-content";
import {
  getToolBySlug,
  getToolCategoryBySlug,
  getToolCategories,
  getTools,
  getToolsByCategory,
} from "@/lib/tools/tool-registry";

describe("page metadata", () => {
  it("sets canonical, Open Graph, and Twitter values from one input", () => {
    const metadata = buildPageMetadata({
      description: "Format JSON locally.",
      keywords: ["json"],
      path: "/tools/json-formatter",
      title: "JSON Formatter",
    });

    expect(metadata.title).toBe("JSON Formatter");
    expect(metadata.alternates?.canonical).toBe("/tools/json-formatter");
    expect(metadata.openGraph).toMatchObject({ title: "JSON Formatter", type: "website" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "JSON Formatter" });
    expect(metadata.keywords).toEqual(["json"]);
  });

  it("inherits the site title when none is given", () => {
    const metadata = buildPageMetadata({ description: "Home.", path: "/" });

    expect(metadata).not.toHaveProperty("title");
    expect(metadata.openGraph).toMatchObject({ title: "QuicklySorted" });
  });

  it("resolves absolute URLs on the configured site origin", () => {
    expect(absoluteUrl("/categories")).toBe("http://localhost:3000/categories");
  });
});

describe("structured data", () => {
  it("numbers breadcrumb items from one and uses absolute URLs", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Categories", path: "/categories" },
    ]);

    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toEqual([
      { "@type": "ListItem", item: "http://localhost:3000/", name: "Home", position: 1 },
      {
        "@type": "ListItem",
        item: "http://localhost:3000/categories",
        name: "Categories",
        position: 2,
      },
    ]);
  });

  it("describes a tool as a free web application", () => {
    const tool = getToolBySlug("json-formatter");

    expect(tool).toBeDefined();
    expect(toolJsonLd(tool!)).toMatchObject({
      "@type": "WebApplication",
      applicationCategory: "DeveloperApplication",
      isAccessibleForFree: true,
      offers: { price: "0" },
      url: "http://localhost:3000/tools/json-formatter",
    });
  });

  it("describes the organization with an absolute logo address and its parent company", () => {
    expect(organizationJsonLd()).toMatchObject({
      "@id": "http://localhost:3000/#organization",
      "@type": "Organization",
      logo: "http://localhost:3000/apple-icon.png",
      name: "QuicklySorted",
      parentOrganization: { "@type": "Organization", name: "Wisemen Soft (SMC-Private) Limited" },
      url: "http://localhost:3000/",
    });
  });

  it("links the website to its organization instead of describing it twice", () => {
    expect(websiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      inLanguage: "en",
      publisher: { "@id": organizationJsonLd()["@id"] },
    });
  });

  it("gives a tool the date it last changed, and links it to the organization", () => {
    const tool = getToolBySlug("loan-calculator");

    expect(toolJsonLd(tool!)).toMatchObject({
      dateModified: tool!.updatedAt,
      inLanguage: "en",
      publisher: { "@id": organizationJsonLd()["@id"] },
    });
  });

  it("lists every tool in a category", () => {
    const category = getToolCategoryBySlug("developer-tools");
    const tools = getToolsByCategory("developer");
    const data = toolListJsonLd(category!, tools);

    expect(data["@type"]).toBe("ItemList");
    expect(data.itemListElement).toHaveLength(tools.length);
  });
});

describe("crawler files", () => {
  it("lists only live pages in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    const availableTools = getTools().filter((tool) => tool.status === "available");

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/categories");
    expect(urls).toContain("http://localhost:3000/categories/developer-tools");
    // A category that is still planned must stay out of the sitemap, whichever one that is today.
    for (const category of getToolCategories().filter((entry) => entry.status === "planned")) {
      expect(urls).not.toContain(`http://localhost:3000/categories/${category.slug}`);
    }
    expect(urls).toContain("http://localhost:3000/privacy");
    expect(urls).toContain("http://localhost:3000/terms");
    expect(urls.filter((url) => url.includes("/tools/"))).toHaveLength(availableTools.length);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("gives every page a real date it last changed, never the time of the build", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry.lastModified]));

    for (const entry of entries) {
      expect(String(entry.lastModified), entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    for (const tool of getTools().filter((entry) => entry.status === "available")) {
      expect(byUrl.get(`http://localhost:3000/tools/${tool.slug}`), tool.slug).toBe(tool.updatedAt);
    }

    expect(byUrl.get("http://localhost:3000/privacy")).toBe(LEGAL_LAST_UPDATED_ISO);
  });

  it("writes the legal page date in the sitemap the same way as on the page", () => {
    const shown = new Date(`${LEGAL_LAST_UPDATED} UTC`);

    expect(shown.toISOString().slice(0, 10)).toBe(LEGAL_LAST_UPDATED_ISO);
  });

  it("allows crawling and links the sitemap", () => {
    expect(robots()).toEqual({
      rules: { allow: "/", userAgent: "*" },
      sitemap: "http://localhost:3000/sitemap.xml",
    });
  });

  it("blocks every crawler on a preview deployment, so previews never reach search results", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.resetModules();

    const { default: previewRobots } = await import("@/app/robots");

    expect(previewRobots()).toEqual({ rules: { disallow: "/", userAgent: "*" } });
  });

  it("allows crawling on the production deployment", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.quicklysorted.com");
    vi.resetModules();

    const { default: productionRobots } = await import("@/app/robots");

    expect(productionRobots()).toEqual({
      rules: { allow: "/", userAgent: "*" },
      sitemap: "https://www.quicklysorted.com/sitemap.xml",
    });
  });

  it("refuses to start in production with a local site address", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.resetModules();

    await expect(import("@/lib/env")).rejects.toThrow(/local address/);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
