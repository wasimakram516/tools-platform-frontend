// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildMetaTags,
  checkMetaTags,
  displayUrl,
  escapeAttribute,
  escapeText,
  isAbsoluteHttpUrl,
  truncateAtWord,
  type MetaTagInput,
} from "@/lib/tools/seo/meta-tags";

const BASE: MetaTagInput = {
  description: "Free online tools for everyday tasks. Simple, clear, and no signup required, with every tool in your browser.",
  followLinks: true,
  imageAlt: "The QuicklySorted logo",
  imageUrl: "https://www.quicklysorted.com/og.png",
  indexable: true,
  locale: "en_US",
  ogType: "website",
  siteName: "QuicklySorted",
  themeColor: "#1F7A5A",
  title: "QuicklySorted: free online tools for everyday tasks",
  twitterCard: "summary_large_image",
  twitterHandle: "@quicklysorted",
  url: "https://www.quicklysorted.com/",
};

describe("escaping", () => {
  it("makes text safe for an attribute and for the page body", () => {
    expect(escapeAttribute('Say "hi" & <go>')).toBe("Say &quot;hi&quot; &amp; &lt;go&gt;");
    expect(escapeText('A & B <c> "d"')).toBe('A &amp; B &lt;c&gt; "d"');
  });
});

describe("isAbsoluteHttpUrl", () => {
  it("accepts only full http and https addresses", () => {
    expect(isAbsoluteHttpUrl("https://example.com/a")).toBe(true);
    expect(isAbsoluteHttpUrl("http://example.com")).toBe(true);
    expect(isAbsoluteHttpUrl("/relative/path")).toBe(false);
    expect(isAbsoluteHttpUrl("example.com")).toBe(false);
    expect(isAbsoluteHttpUrl("ftp://example.com")).toBe(false);
    expect(isAbsoluteHttpUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("truncateAtWord and displayUrl", () => {
  it("leaves short text alone and cuts long text at a word with an ellipsis", () => {
    expect(truncateAtWord("A short title", 60)).toBe("A short title");
    expect(truncateAtWord("one two three four five six", 15)).toBe("one two three…");
    expect(truncateAtWord("  spaced   out  ", 60)).toBe("spaced out");
  });

  it("cuts a very long word without a space at the limit", () => {
    expect(truncateAtWord("abcdefghijklmnopqrstuvwxyz", 10)).toBe("abcdefghi…");
  });

  it("writes an address the way search results do", () => {
    expect(displayUrl("https://www.example.com/blog/my-post")).toBe("www.example.com › blog › my-post");
    expect(displayUrl("https://example.com/")).toBe("example.com");
    expect(displayUrl("not a url")).toBe("not a url");
  });
});

describe("buildMetaTags", () => {
  it("writes the title, description, canonical link, Open Graph, and card tags", () => {
    expect(buildMetaTags(BASE).html).toBe(
      [
        "<title>QuicklySorted: free online tools for everyday tasks</title>",
        '<meta name="description" content="Free online tools for everyday tasks. Simple, clear, and no signup required, with every tool in your browser.">',
        '<link rel="canonical" href="https://www.quicklysorted.com/">',
        '<meta name="theme-color" content="#1F7A5A">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="QuicklySorted: free online tools for everyday tasks">',
        '<meta property="og:description" content="Free online tools for everyday tasks. Simple, clear, and no signup required, with every tool in your browser.">',
        '<meta property="og:url" content="https://www.quicklysorted.com/">',
        '<meta property="og:site_name" content="QuicklySorted">',
        '<meta property="og:locale" content="en_US">',
        '<meta property="og:image" content="https://www.quicklysorted.com/og.png">',
        '<meta property="og:image:alt" content="The QuicklySorted logo">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@quicklysorted">',
      ].join("\n"),
    );
    expect(buildMetaTags(BASE).issues).toEqual([]);
  });

  it("escapes text so that a quote or an ampersand cannot break a tag", () => {
    const { html } = buildMetaTags({ ...BASE, description: 'Tom & Jerry say "hi"', title: "A <b>bold</b> title" });

    expect(html).toContain("<title>A &lt;b&gt;bold&lt;/b&gt; title</title>");
    expect(html).toContain('content="Tom &amp; Jerry say &quot;hi&quot;"');
  });

  it("adds a robots tag only when the page should not be indexed or followed", () => {
    expect(buildMetaTags(BASE).html).not.toContain('name="robots"');
    expect(buildMetaTags({ ...BASE, indexable: false }).html).toContain('<meta name="robots" content="noindex, follow">');
    expect(buildMetaTags({ ...BASE, followLinks: false }).html).toContain('<meta name="robots" content="index, nofollow">');
    expect(buildMetaTags({ ...BASE, followLinks: false, indexable: false }).html).toContain('content="noindex, nofollow"');
  });

  it("uses the small card when there is no image, and adds the @ to a handle", () => {
    const { html } = buildMetaTags({ ...BASE, imageAlt: "", imageUrl: "", twitterHandle: "quicklysorted" });

    expect(html).toContain('<meta name="twitter:card" content="summary">');
    expect(html).toContain('<meta name="twitter:site" content="@quicklysorted">');
    expect(html).not.toContain("og:image");
  });

  it("leaves out tags for fields that are empty", () => {
    const { html } = buildMetaTags({ ...BASE, description: "", siteName: "", themeColor: "", twitterHandle: "" });

    expect(html).not.toContain('name="description"');
    expect(html).not.toContain("og:site_name");
    expect(html).not.toContain("theme-color");
    expect(html).not.toContain("twitter:site");
  });
});

describe("checkMetaTags", () => {
  const messages = (input: Partial<MetaTagInput>): string[] => checkMetaTags({ ...BASE, ...input }).map((issue) => `${issue.level}: ${issue.message}`);

  it("says nothing when everything is in good shape", () => {
    expect(checkMetaTags(BASE)).toEqual([]);
  });

  it("asks for a title, and warns about one that is too long or too short", () => {
    expect(messages({ title: "" })[0]).toContain("error: Add a page title");
    expect(messages({ title: "x".repeat(61) })[0]).toContain("61 characters");
    expect(messages({ title: "Short" })[0]).toContain("short at 5 characters");
  });

  it("warns about a description that is missing, long, or short", () => {
    expect(messages({ description: "" })[0]).toContain("Add a description");
    expect(messages({ description: "x".repeat(161) })[0]).toContain("161 characters");
    expect(messages({ description: "Too short" })[0]).toContain("short at 9 characters");
  });

  it("reports addresses that are not full web addresses", () => {
    expect(messages({ url: "/home" })[0]).toContain("error: The page address must be a full web address");
    expect(messages({ imageUrl: "/og.png" })[0]).toContain("error: The image address must be a full web address");
  });

  it("suggests an image, and a description of it", () => {
    expect(messages({ imageAlt: "", imageUrl: "" })[0]).toContain("Add an image");
    expect(messages({ imageAlt: "" })[0]).toContain("Describe the image");
  });

  it("checks the handle, colour, and locale formats", () => {
    expect(messages({ twitterHandle: "not a handle!" })[0]).toContain("error");
    expect(messages({ themeColor: "green" })[0]).toContain("hex colour");
    expect(messages({ locale: "english" })[0]).toContain("en_US");
    expect(messages({ twitterHandle: "@ok_name1", themeColor: "#fff", locale: "pt" })).toEqual([]);
  });

  it("warns when the page asks not to be shown in search", () => {
    expect(messages({ indexable: false })[0]).toContain("not to show it in results");
  });
});
