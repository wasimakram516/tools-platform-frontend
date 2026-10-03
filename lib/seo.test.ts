import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  toolJsonLd,
  toolListJsonLd,
} from "@/lib/seo";
import {
  getToolBySlug,
  getToolCategoryBySlug,
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
    expect(metadata.twitter).toMatchObject({ card: "summary", title: "JSON Formatter" });
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
    expect(urls).not.toContain("http://localhost:3000/categories/image-tools");
    expect(urls).toContain("http://localhost:3000/privacy");
    expect(urls).toContain("http://localhost:3000/terms");
    expect(urls.filter((url) => url.includes("/tools/"))).toHaveLength(availableTools.length);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("allows crawling and links the sitemap", () => {
    expect(robots()).toEqual({
      rules: { allow: "/", userAgent: "*" },
      sitemap: "http://localhost:3000/sitemap.xml",
    });
  });
});
