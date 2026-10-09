import type { Metadata } from "next";
import { env } from "@/lib/env";
import { BRAND_NAME, COMPANY_NAME, COMPANY_URL } from "@/lib/site-config";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

export const SITE_NAME = BRAND_NAME;
export const SITE_DESCRIPTION = "Free online tools for everyday tasks. Simple, clear, and no signup required.";

type JsonLdObject = Record<string, unknown>;

const SCHEMA_CATEGORY_BY_CATEGORY_ID: Readonly<Record<string, string>> = {
  developer: "DeveloperApplication",
};
const DEFAULT_SCHEMA_CATEGORY = "UtilitiesApplication";

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

interface PageMetadataInput {
  description: string;
  keywords?: readonly string[];
  path: string;
  title?: string;
}

/**
 * Resolves a site-relative path to an absolute URL on the configured site origin.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();
}

/**
 * Builds the metadata every page needs: canonical URL, Open Graph, and Twitter card values.
 * Omit `title` to inherit the site default title.
 */
export function buildPageMetadata({
  description,
  keywords,
  path,
  title,
}: PageMetadataInput): Metadata {
  const socialTitle = title ?? SITE_NAME;

  return {
    ...(title ? { title } : {}),
    description,
    ...(keywords ? { keywords: [...keywords] } : {}),
    alternates: { canonical: path },
    openGraph: {
      description,
      siteName: SITE_NAME,
      title: socialTitle,
      locale: "en_US",
      type: "website",
      url: path,
    },
    twitter: { card: "summary_large_image", description, title: socialTitle },
  };
}

/** The identifier other entries use to point at the organization, so it is described once. */
function organizationId(): string {
  return `${absoluteUrl("/")}#organization`;
}

/**
 * Describes who is behind the site: QuicklySorted, a product of Wisemen Soft. The logo is a
 * square image large enough for search engines to show.
 */
export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@id": organizationId(),
    "@type": "Organization",
    description: SITE_DESCRIPTION,
    logo: absoluteUrl("/apple-icon.png"),
    name: SITE_NAME,
    parentOrganization: { "@type": "Organization", name: COMPANY_NAME, url: COMPANY_URL },
    url: absoluteUrl("/"),
  };
}

/**
 * Describes the site itself for search engines, and links it to its organization.
 */
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    name: SITE_NAME,
    publisher: { "@id": organizationId() },
    url: absoluteUrl("/"),
  };
}

export interface FaqEntry {
  answer: string;
  question: string;
}

/**
 * Describes a list of questions and answers, enabling FAQ rich results.
 */
export function faqJsonLd(entries: readonly FaqEntry[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
      name: entry.question,
    })),
  };
}

/**
 * Describes the page's position in the site hierarchy, enabling breadcrumb rich results.
 */
export function breadcrumbJsonLd(entries: readonly BreadcrumbEntry[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(entry.path),
      name: entry.name,
      position: index + 1,
    })),
  };
}

/**
 * Describes a category page as an ordered list of the tools it contains.
 */
export function toolListJsonLd(
  category: ToolCategory,
  tools: readonly ToolDefinition[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      name: tool.name,
      position: index + 1,
      url: absoluteUrl(`/tools/${tool.slug}`),
    })),
    name: category.name,
    url: absoluteUrl(`/categories/${category.slug}`),
  };
}

/**
 * Describes a tool as a free web application.
 */
export function toolJsonLd(tool: ToolDefinition): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    applicationCategory:
      SCHEMA_CATEGORY_BY_CATEGORY_ID[tool.categoryId] ?? DEFAULT_SCHEMA_CATEGORY,
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    dateModified: tool.updatedAt,
    description: tool.description,
    inLanguage: "en",
    isAccessibleForFree: true,
    name: tool.name,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "Any",
    publisher: { "@id": organizationId() },
    url: absoluteUrl(`/tools/${tool.slug}`),
  };
}
