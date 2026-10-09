// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildProductSchema,
  toScriptTag,
  type ArticleInput,
  type LocalBusinessInput,
  type OrganizationInput,
  type ProductInput,
} from "@/lib/tools/seo/schema";

const errors = (result: { issues: { level: string; message: string }[] }): string[] =>
  result.issues.filter((issue) => issue.level === "error").map((issue) => issue.message);

describe("toScriptTag", () => {
  it("wraps the data in a script tag and escapes < so text cannot close it early", () => {
    const script = toScriptTag({ name: "</script><b>x" });

    expect(script.startsWith('<script type="application/ld+json">\n')).toBe(true);
    expect(script.endsWith("\n</script>")).toBe(true);
    expect(script.slice(0, -"</script>".length)).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>");
    expect(JSON.parse(script.replace(/^<script[^>]*>|<\/script>$/g, ""))).toEqual({ name: "</script><b>x" });
  });
});

describe("buildFaqSchema", () => {
  it("builds FAQ markup from complete questions and says how Google uses it", () => {
    const result = buildFaqSchema({ items: [{ answer: "Yes.", question: "Is it free?" }, { answer: "", question: "Skipped?" }] });

    expect(result.data).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", acceptedAnswer: { "@type": "Answer", text: "Yes." }, name: "Is it free?" }],
    });
    expect(result.issues.map((issue) => issue.message).join(" ")).toContain("government and health");
    expect(result.issues.some((issue) => issue.message.includes("was left empty"))).toBe(true);
  });

  it("needs at least one complete question", () => {
    expect(errors(buildFaqSchema({ items: [{ answer: "", question: "" }] }))).toEqual(["Add at least one question with its answer."]);
    expect(buildFaqSchema({ items: [] }).script).toBe("");
  });
});

const ARTICLE: ArticleInput = {
  articleType: "BlogPosting",
  authorName: "Ann Lee",
  authorUrl: "https://example.com/team/ann",
  dateModified: "2026-10-10",
  datePublished: "2026-10-09T08:30:00+05:00",
  headline: "How to shrink an image",
  imageUrl: "https://example.com/img.png",
  publisherLogoUrl: "https://example.com/logo.png",
  publisherName: "Example",
  url: "https://example.com/blog/shrink",
};

describe("buildArticleSchema", () => {
  it("builds article markup", () => {
    expect(buildArticleSchema(ARTICLE).data).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      author: { "@type": "Person", name: "Ann Lee", url: "https://example.com/team/ann" },
      dateModified: "2026-10-10",
      datePublished: "2026-10-09T08:30:00+05:00",
      headline: "How to shrink an image",
      image: ["https://example.com/img.png"],
      mainEntityOfPage: { "@id": "https://example.com/blog/shrink", "@type": "WebPage" },
      publisher: { "@type": "Organization", logo: { "@type": "ImageObject", url: "https://example.com/logo.png" }, name: "Example" },
    });
    expect(buildArticleSchema(ARTICLE).issues).toEqual([]);
  });

  it("leaves out what was not filled in", () => {
    const data = buildArticleSchema({ ...ARTICLE, authorUrl: "", dateModified: "", publisherLogoUrl: "", publisherName: "", url: "" }).data;

    expect(data).not.toHaveProperty("dateModified");
    expect(data).not.toHaveProperty("mainEntityOfPage");
    expect(data).not.toHaveProperty("publisher");
    expect(data?.author).toEqual({ "@type": "Person", name: "Ann Lee" });
  });

  it("requires a headline, an author, a date, and a picture, and checks the formats", () => {
    expect(errors(buildArticleSchema({ ...ARTICLE, authorName: "", headline: "", imageUrl: "" }))).toEqual([
      "Add the headline of the article.",
      "Add the name of the author.",
      "Add the image address.",
    ]);
    expect(errors(buildArticleSchema({ ...ARTICLE, datePublished: "9 Oct 2026" }))[0]).toContain("published date");
    expect(errors(buildArticleSchema({ ...ARTICLE, imageUrl: "/img.png" }))[0]).toContain("full web address");
  });

  it("warns about a long headline and a missing publisher", () => {
    const long = buildArticleSchema({ ...ARTICLE, headline: "x".repeat(111), publisherName: "" });

    expect(long.issues.map((issue) => issue.message)).toEqual([
      "The headline is 111 characters. Google may cut it after about 110.",
      "Add the publisher, usually the name of your site.",
    ]);
  });
});

const PRODUCT: ProductInput = {
  availability: "InStock",
  brand: "Acme",
  currency: "USD",
  description: "A very good notebook.",
  imageUrl: "https://example.com/n.png",
  name: "Notebook",
  price: "9.50",
  sku: "NB-1",
  url: "https://example.com/notebook",
};

describe("buildProductSchema", () => {
  it("builds product markup with one offer, and no ratings", () => {
    const result = buildProductSchema(PRODUCT);

    expect(result.data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      brand: { "@type": "Brand", name: "Acme" },
      description: "A very good notebook.",
      image: ["https://example.com/n.png"],
      name: "Notebook",
      offers: { "@type": "Offer", availability: "https://schema.org/InStock", price: "9.50", priceCurrency: "USD", url: "https://example.com/notebook" },
      sku: "NB-1",
    });
    expect(JSON.stringify(result.data)).not.toMatch(/rating|review/i);
  });

  it("maps availability to the schema.org address", () => {
    expect(JSON.stringify(buildProductSchema({ ...PRODUCT, availability: "PreOrder" }).data)).toContain("https://schema.org/PreOrder");
  });

  it("checks the price and the currency", () => {
    expect(errors(buildProductSchema({ ...PRODUCT, price: "$9.50" }))[0]).toContain("price is a number");
    expect(errors(buildProductSchema({ ...PRODUCT, price: "9,50" }))[0]).toContain("price is a number");
    expect(errors(buildProductSchema({ ...PRODUCT, currency: "usd" }))[0]).toContain("three-letter code");
    expect(errors(buildProductSchema({ ...PRODUCT, name: "", imageUrl: "" }))).toEqual(["Add the name of the product.", "Add the image address."]);
  });
});

const BUSINESS: LocalBusinessInput = {
  businessType: "Restaurant",
  city: "Sargodha",
  country: "PK",
  imageUrl: "",
  name: "Chai House",
  openingHours: "Mo-Sa 09:00-23:00\nSu 12:00-22:00",
  postalCode: "40100",
  priceRange: "$$",
  region: "Punjab",
  street: "12 Main Road",
  telephone: "+92 300 1234567",
  url: "https://chaihouse.example",
};

describe("buildLocalBusinessSchema", () => {
  it("builds local business markup with address and hours", () => {
    expect(buildLocalBusinessSchema(BUSINESS).data).toEqual({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      address: { "@type": "PostalAddress", addressCountry: "PK", addressLocality: "Sargodha", addressRegion: "Punjab", postalCode: "40100", streetAddress: "12 Main Road" },
      name: "Chai House",
      openingHours: ["Mo-Sa 09:00-23:00", "Su 12:00-22:00"],
      priceRange: "$$",
      telephone: "+92 300 1234567",
      url: "https://chaihouse.example",
    });
  });

  it("accepts the different ways of writing opening days, and rejects the rest", () => {
    for (const good of ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00", "Mo,We,Fr 08:00-12:00", "Mo-Tu,Th 08:00-12:00"]) {
      expect(errors(buildLocalBusinessSchema({ ...BUSINESS, openingHours: good })), good).toEqual([]);
    }

    for (const bad of ["Monday 9-5", "Mo-Fr 9:00-17:00", "Mo-Fr 09:00 to 17:00", "09:00-17:00"]) {
      expect(errors(buildLocalBusinessSchema({ ...BUSINESS, openingHours: bad }))[0], bad).toContain("not a valid opening time");
    }
  });

  it("requires a name, a street, a city, and a two-letter country, and checks the phone number", () => {
    expect(errors(buildLocalBusinessSchema({ ...BUSINESS, city: "", name: "", street: "" }))).toEqual([
      "Add the name of the business.",
      "Add the street address.",
      "Add the city.",
    ]);
    expect(errors(buildLocalBusinessSchema({ ...BUSINESS, country: "Pakistan" }))[0]).toContain("two-letter code");
    expect(errors(buildLocalBusinessSchema({ ...BUSINESS, telephone: "call me" }))[0]).toContain("country code");
  });

  it("omits empty hours instead of writing an empty list", () => {
    expect(buildLocalBusinessSchema({ ...BUSINESS, openingHours: "" }).data).not.toHaveProperty("openingHours");
  });
});

const ORGANIZATION: OrganizationInput = {
  description: "Software company",
  email: "hello@example.com",
  logoUrl: "https://example.com/logo.png",
  name: "Example Ltd",
  profiles: "https://x.com/example\nhttps://www.linkedin.com/company/example",
  telephone: "",
  url: "https://example.com",
};

describe("buildOrganizationSchema", () => {
  it("builds organization markup with profile links", () => {
    expect(buildOrganizationSchema(ORGANIZATION).data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      description: "Software company",
      email: "hello@example.com",
      logo: "https://example.com/logo.png",
      name: "Example Ltd",
      sameAs: ["https://x.com/example", "https://www.linkedin.com/company/example"],
      url: "https://example.com",
    });
  });

  it("requires a name and a website, and checks profiles and the email", () => {
    expect(errors(buildOrganizationSchema({ ...ORGANIZATION, name: "", url: "" }))).toEqual(["Add the name of the organization.", "Add the website address."]);
    expect(errors(buildOrganizationSchema({ ...ORGANIZATION, profiles: "twitter.com/example" }))[0]).toContain("not a full web address");
    expect(errors(buildOrganizationSchema({ ...ORGANIZATION, email: "nope" }))[0]).toContain("email address");
  });
});

describe("buildBreadcrumbSchema", () => {
  it("numbers the steps and lets the last one leave out its address", () => {
    expect(
      buildBreadcrumbSchema({
        items: [
          { name: "Home", url: "https://example.com/" },
          { name: "Blog", url: "https://example.com/blog" },
          { name: "This post", url: "" },
        ],
      }).data,
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", item: "https://example.com/", name: "Home", position: 1 },
        { "@type": "ListItem", item: "https://example.com/blog", name: "Blog", position: 2 },
        { "@type": "ListItem", name: "This post", position: 3 },
      ],
    });
  });

  it("needs two steps, a name on each, and an address on all but the last", () => {
    expect(errors(buildBreadcrumbSchema({ items: [{ name: "Home", url: "https://example.com/" }] }))[0]).toContain("at least two steps");
    expect(errors(buildBreadcrumbSchema({ items: [{ name: "Home", url: "" }, { name: "Page", url: "" }] }))).toEqual(["Step 1 needs an address. Only the last step may leave it out."]);
    expect(errors(buildBreadcrumbSchema({ items: [{ name: "", url: "https://example.com/" }, { name: "Page", url: "" }] }))).toEqual(["Step 1 needs a name."]);
    expect(errors(buildBreadcrumbSchema({ items: [{ name: "Home", url: "/" }, { name: "Page", url: "" }] }))[0]).toContain("full web address");
  });

  it("ignores rows that are completely empty", () => {
    expect(buildBreadcrumbSchema({ items: [{ name: "Home", url: "https://example.com/" }, { name: "", url: "" }, { name: "Page", url: "" }] }).data).not.toBeNull();
  });
});
