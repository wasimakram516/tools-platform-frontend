import { isAbsoluteHttpUrl, type MetaTagIssue } from "@/lib/tools/seo/meta-tags";

export type SchemaType = "faq" | "article" | "product" | "localBusiness" | "organization" | "breadcrumbs";

export interface SchemaResult {
  /** The structured data as an object, or null while something must be fixed. */
  data: Record<string, unknown> | null;
  issues: MetaTagIssue[];
  /** The tag to paste into a page: a script of type application/ld+json. Empty while something must be fixed. */
  script: string;
}

/** Google shows article headlines up to about this long. */
const MAX_HEADLINE = 110;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})?)?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{5,18}$/;
const DAY = "(Mo|Tu|We|Th|Fr|Sa|Su)";
const OPENING_HOURS_PATTERN = new RegExp(`^${DAY}(-${DAY})?(,${DAY}(-${DAY})?)*\\s\\d{2}:\\d{2}-\\d{2}:\\d{2}$`);

/**
 * Removes empty values, so the data holds only what was filled in.
 */
function clean<Value extends Record<string, unknown>>(data: Value): Value {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === "" || value === undefined || value === null) {
        return false;
      }

      return !(typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length <= 1 && Object.keys(value as object).every((key) => key === "@type"));
    }),
  ) as Value;
}

/**
 * Wraps structured data in the script tag that goes in a page. A "<" is escaped so that text in
 * the data can never close the tag early.
 */
export function toScriptTag(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2).replaceAll("<", "\\u003c")}\n</script>`;
}

/**
 * Builds a result from the data and its problems. With any error there is no tag.
 */
function finish(data: Record<string, unknown>, issues: MetaTagIssue[]): SchemaResult {
  const failed = issues.some((issue) => issue.level === "error");

  return failed ? { data: null, issues, script: "" } : { data, issues, script: toScriptTag(data) };
}

/**
 * Adds an error when a required text field is empty.
 */
function requireText(value: string, message: string, issues: MetaTagIssue[]): void {
  if (value.trim() === "") {
    issues.push({ level: "error", message });
  }
}

/**
 * Adds an error when a field is filled in but is not a full web address.
 */
function checkUrl(value: string, label: string, issues: MetaTagIssue[], required = false): void {
  if (value.trim() === "") {
    if (required) {
      issues.push({ level: "error", message: `Add ${label}.` });
    }

    return;
  }

  if (!isAbsoluteHttpUrl(value.trim())) {
    issues.push({ level: "error", message: `${label[0]?.toUpperCase()}${label.slice(1)} must be a full web address that starts with https://.` });
  }
}

export interface FaqInput {
  items: { answer: string; question: string }[];
}

/**
 * Builds FAQ markup from questions and answers. A question with no answer is skipped. Google now
 * shows FAQ results only for well-known government and health sites, so for most sites the markup
 * is valid but changes nothing in search.
 */
export function buildFaqSchema({ items }: FaqInput): SchemaResult {
  const issues: MetaTagIssue[] = [];
  const complete = items.filter((item) => item.question.trim() !== "" && item.answer.trim() !== "");

  if (complete.length === 0) {
    issues.push({ level: "error", message: "Add at least one question with its answer." });
  }

  if (complete.length < items.length && complete.length > 0) {
    issues.push({ level: "warning", message: "A question or an answer was left empty, so that item was skipped." });
  }

  issues.push({
    level: "warning",
    message: "Since 2023 Google shows FAQ results in search only for well-known government and health websites. The markup is still valid, and the questions must also appear on the page.",
  });

  return finish(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: complete.map((item) => ({
        "@type": "Question",
        acceptedAnswer: { "@type": "Answer", text: item.answer.trim() },
        name: item.question.trim(),
      })),
    },
    issues,
  );
}

export interface ArticleInput {
  articleType: "Article" | "BlogPosting" | "NewsArticle";
  authorName: string;
  authorUrl: string;
  dateModified: string;
  datePublished: string;
  headline: string;
  imageUrl: string;
  publisherLogoUrl: string;
  publisherName: string;
  url: string;
}

/**
 * Builds article markup, with the headline, picture, dates, author, and publisher that Google
 * asks for.
 */
export function buildArticleSchema(input: ArticleInput): SchemaResult {
  const issues: MetaTagIssue[] = [];

  requireText(input.headline, "Add the headline of the article.", issues);
  requireText(input.authorName, "Add the name of the author.", issues);
  requireText(input.datePublished, "Add the date it was published, written as 2026-10-09.", issues);
  checkUrl(input.imageUrl, "the image address", issues, true);
  checkUrl(input.url, "the article address", issues);
  checkUrl(input.authorUrl, "the author page address", issues);
  checkUrl(input.publisherLogoUrl, "the logo address", issues);

  if (input.headline.trim().length > MAX_HEADLINE) {
    issues.push({ level: "warning", message: `The headline is ${input.headline.trim().length} characters. Google may cut it after about ${MAX_HEADLINE}.` });
  }

  for (const [label, value] of [["published", input.datePublished], ["modified", input.dateModified]] as const) {
    if (value.trim() !== "" && !ISO_DATE_PATTERN.test(value.trim())) {
      issues.push({ level: "error", message: `The ${label} date must look like 2026-10-09 or 2026-10-09T08:30:00+05:00.` });
    }
  }

  if (input.publisherName.trim() === "") {
    issues.push({ level: "warning", message: "Add the publisher, usually the name of your site." });
  }

  return finish(
    clean({
      "@context": "https://schema.org",
      "@type": input.articleType,
      author: clean({ "@type": "Person", name: input.authorName.trim(), url: input.authorUrl.trim() }),
      dateModified: input.dateModified.trim(),
      datePublished: input.datePublished.trim(),
      headline: input.headline.trim(),
      image: [input.imageUrl.trim()],
      mainEntityOfPage: input.url.trim() === "" ? "" : { "@id": input.url.trim(), "@type": "WebPage" },
      publisher:
        input.publisherName.trim() === ""
          ? ""
          : clean({
              "@type": "Organization",
              logo: input.publisherLogoUrl.trim() === "" ? "" : { "@type": "ImageObject", url: input.publisherLogoUrl.trim() },
              name: input.publisherName.trim(),
            }),
    }),
    issues,
  );
}

export const AVAILABILITY_OPTIONS = [
  { label: "In stock", value: "InStock" },
  { label: "Out of stock", value: "OutOfStock" },
  { label: "Pre-order", value: "PreOrder" },
  { label: "Limited availability", value: "LimitedAvailability" },
  { label: "Discontinued", value: "Discontinued" },
] as const;

export interface ProductInput {
  availability: (typeof AVAILABILITY_OPTIONS)[number]["value"];
  brand: string;
  currency: string;
  description: string;
  imageUrl: string;
  name: string;
  price: string;
  sku: string;
  url: string;
}

/**
 * Builds product markup with one offer. It has no rating or review fields on purpose: those must
 * come from real customers, and made-up ones break Google's rules.
 */
export function buildProductSchema(input: ProductInput): SchemaResult {
  const issues: MetaTagIssue[] = [];

  requireText(input.name, "Add the name of the product.", issues);
  checkUrl(input.imageUrl, "the image address", issues, true);
  checkUrl(input.url, "the product page address", issues);

  if (!PRICE_PATTERN.test(input.price.trim())) {
    issues.push({ level: "error", message: "The price is a number with a dot for decimals and no symbol, such as 19.99." });
  }

  if (!CURRENCY_PATTERN.test(input.currency.trim())) {
    issues.push({ level: "error", message: "The currency is a three-letter code in capitals, such as USD, EUR, or PKR." });
  }

  if (input.description.trim() === "") {
    issues.push({ level: "warning", message: "Add a description. It helps search engines understand the product." });
  }

  return finish(
    clean({
      "@context": "https://schema.org",
      "@type": "Product",
      brand: input.brand.trim() === "" ? "" : { "@type": "Brand", name: input.brand.trim() },
      description: input.description.trim(),
      image: [input.imageUrl.trim()],
      name: input.name.trim(),
      offers: clean({
        "@type": "Offer",
        availability: `https://schema.org/${input.availability}`,
        price: input.price.trim(),
        priceCurrency: input.currency.trim(),
        url: input.url.trim(),
      }),
      sku: input.sku.trim(),
    }),
    issues,
  );
}

export const BUSINESS_TYPES = [
  "LocalBusiness",
  "Restaurant",
  "CafeOrCoffeeShop",
  "Store",
  "HairSalon",
  "Dentist",
  "AutoRepair",
  "LegalService",
  "RealEstateAgent",
] as const;

export interface LocalBusinessInput {
  businessType: (typeof BUSINESS_TYPES)[number];
  city: string;
  country: string;
  imageUrl: string;
  name: string;
  /** One line each, such as "Mo-Fr 09:00-17:00". */
  openingHours: string;
  postalCode: string;
  priceRange: string;
  region: string;
  street: string;
  telephone: string;
  url: string;
}

/**
 * Builds local business markup: the name, address, phone number, and opening hours.
 */
export function buildLocalBusinessSchema(input: LocalBusinessInput): SchemaResult {
  const issues: MetaTagIssue[] = [];
  const hours = input.openingHours.split(/\r\n|\r|\n/).map((line) => line.trim()).filter(Boolean);

  requireText(input.name, "Add the name of the business.", issues);
  requireText(input.street, "Add the street address.", issues);
  requireText(input.city, "Add the city.", issues);
  checkUrl(input.url, "the website address", issues);
  checkUrl(input.imageUrl, "the image address", issues);

  if (!COUNTRY_PATTERN.test(input.country.trim())) {
    issues.push({ level: "error", message: "The country is a two-letter code in capitals, such as PK, AE, or US." });
  }

  if (input.telephone.trim() !== "" && !PHONE_PATTERN.test(input.telephone.trim())) {
    issues.push({ level: "error", message: "The phone number should include the country code, such as +92 300 1234567." });
  }

  for (const line of hours) {
    if (!OPENING_HOURS_PATTERN.test(line)) {
      issues.push({ level: "error", message: `"${line}" is not a valid opening time. Write it like Mo-Fr 09:00-17:00, or Sa 10:00-14:00.` });
    }
  }

  if (input.telephone.trim() === "") {
    issues.push({ level: "warning", message: "Add a phone number. Customers look for it first." });
  }

  return finish(
    clean({
      "@context": "https://schema.org",
      "@type": input.businessType,
      address: clean({
        "@type": "PostalAddress",
        addressCountry: input.country.trim(),
        addressLocality: input.city.trim(),
        addressRegion: input.region.trim(),
        postalCode: input.postalCode.trim(),
        streetAddress: input.street.trim(),
      }),
      image: input.imageUrl.trim(),
      name: input.name.trim(),
      openingHours: hours.length === 0 ? "" : hours,
      priceRange: input.priceRange.trim(),
      telephone: input.telephone.trim(),
      url: input.url.trim(),
    }),
    issues,
  );
}

export interface OrganizationInput {
  description: string;
  email: string;
  logoUrl: string;
  name: string;
  /** Addresses of the organization's pages elsewhere, such as social profiles, one for each line. */
  profiles: string;
  telephone: string;
  url: string;
}

/**
 * Builds organization markup: the name, website, logo, and links to its other profiles.
 */
export function buildOrganizationSchema(input: OrganizationInput): SchemaResult {
  const issues: MetaTagIssue[] = [];
  const profiles = input.profiles.split(/\r\n|\r|\n/).map((line) => line.trim()).filter(Boolean);

  requireText(input.name, "Add the name of the organization.", issues);
  checkUrl(input.url, "the website address", issues, true);
  checkUrl(input.logoUrl, "the logo address", issues);

  for (const profile of profiles) {
    if (!isAbsoluteHttpUrl(profile)) {
      issues.push({ level: "error", message: `"${profile}" is not a full web address. A profile link starts with https://.` });
    }
  }

  if (input.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    issues.push({ level: "error", message: "The email address does not look right." });
  }

  if (input.logoUrl.trim() === "") {
    issues.push({ level: "warning", message: "Add a logo. Search engines may show it beside your name." });
  }

  return finish(
    clean({
      "@context": "https://schema.org",
      "@type": "Organization",
      description: input.description.trim(),
      email: input.email.trim(),
      logo: input.logoUrl.trim(),
      name: input.name.trim(),
      sameAs: profiles.length === 0 ? "" : profiles,
      telephone: input.telephone.trim(),
      url: input.url.trim(),
    }),
    issues,
  );
}

export interface BreadcrumbInput {
  items: { name: string; url: string }[];
}

/**
 * Builds breadcrumb markup, which shows the path to a page in search results. The last step is
 * the page itself and may leave out its address.
 */
export function buildBreadcrumbSchema({ items }: BreadcrumbInput): SchemaResult {
  const issues: MetaTagIssue[] = [];
  const steps = items.filter((item) => item.name.trim() !== "" || item.url.trim() !== "");

  if (steps.length < 2) {
    issues.push({ level: "error", message: "A breadcrumb trail needs at least two steps, such as Home and the page itself." });
  }

  steps.forEach((step, index) => {
    const isLast = index === steps.length - 1;

    if (step.name.trim() === "") {
      issues.push({ level: "error", message: `Step ${index + 1} needs a name.` });
    }

    if (step.url.trim() === "" && !isLast) {
      issues.push({ level: "error", message: `Step ${index + 1} needs an address. Only the last step may leave it out.` });
    } else if (step.url.trim() !== "" && !isAbsoluteHttpUrl(step.url.trim())) {
      issues.push({ level: "error", message: `Step ${index + 1}: the address must be a full web address that starts with https://.` });
    }
  });

  return finish(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: steps.map((step, index) =>
        clean({ "@type": "ListItem", item: step.url.trim(), name: step.name.trim(), position: index + 1 }),
      ),
    },
    issues,
  );
}
