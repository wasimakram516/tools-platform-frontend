import { EXCEL_DATE_GUIDE } from "@/lib/guides/excel-date-serial-numbers";
import type { SearchableGuide } from "@/lib/guides/guide-search";
import type { Guide } from "@/lib/guides/guide-types";
import { REGEX_CHEAT_SHEET_GUIDE } from "@/lib/guides/javascript-regex-cheat-sheet";
import { JWT_CLAIMS_GUIDE } from "@/lib/guides/jwt-claims";
import { QR_ERROR_CORRECTION_GUIDE } from "@/lib/guides/qr-code-error-correction";
import { SHA_COMPARISON_GUIDE } from "@/lib/guides/sha-1-vs-sha-256-vs-sha-512";
import { UTM_PARAMETERS_GUIDE } from "@/lib/guides/utm-parameters";
import { CHARACTER_LIMITS } from "@/lib/tools/text/character-limits";

/**
 * Every guide, in the order the guides page lists them. A guide pairs with one tool, and the
 * tool's page links back to it; a test keeps both links in place.
 */
const GUIDES: readonly Guide[] = [
  EXCEL_DATE_GUIDE,
  JWT_CLAIMS_GUIDE,
  UTM_PARAMETERS_GUIDE,
  QR_ERROR_CORRECTION_GUIDE,
  SHA_COMPARISON_GUIDE,
  REGEX_CHEAT_SHEET_GUIDE,
];

const guideBySlug = new Map(GUIDES.map((guide) => [guide.slug, guide]));

/**
 * The character limits page is a reference page like a guide, built from its own data, so the
 * guides page and the site search list it alongside the guides.
 */
export const CHARACTER_LIMITS_LINK: SearchableGuide = {
  description: "How much you can write in a post, a title, a description, or a text message, and where each figure comes from.",
  href: "/character-limits",
  name: "Character limits",
  // The page's own rows, such as "Instagram caption", so the search finds it by platform.
  terms: ["twitter", "text message", "length", ...CHARACTER_LIMITS.map((entry) => entry.label)].join(" "),
};

/** The address of a guide's page. */
export function guidePath(guide: Pick<Guide, "slug">): string {
  return `/guides/${guide.slug}`;
}

/**
 * Returns every guide.
 */
export function getGuides(): readonly Guide[] {
  return GUIDES;
}

/**
 * Finds a guide by its URL slug.
 */
export function getGuideBySlug(slug: string): Guide | undefined {
  return guideBySlug.get(slug);
}

/**
 * Returns the most recent date any guide was checked, for the guides page in the sitemap.
 */
export function latestGuideUpdate(): string {
  return GUIDES.map((guide) => guide.updatedAt).sort().at(-1) ?? "";
}

/**
 * The guides a tool's page links to: the guide it pairs with first, then guides that list it as
 * a related tool.
 */
export function getGuidesForTool(toolSlug: string): Guide[] {
  return [
    ...GUIDES.filter((guide) => guide.toolSlug === toolSlug),
    ...GUIDES.filter((guide) => guide.toolSlug !== toolSlug && guide.relatedTools.includes(toolSlug)),
  ];
}

/**
 * Every other guide, for the "More guides" list at the end of a guide: the related ones first,
 * then the rest in the usual order, so each guide links to all the others.
 */
export function getMoreGuides(guide: Guide): Guide[] {
  const related = guide.relatedGuides.map(getGuideBySlug).filter((other): other is Guide => other !== undefined);

  return [...related, ...GUIDES.filter((other) => other !== guide && !related.includes(other))];
}

/**
 * Every guide and the character limits page, in the small form the site search uses in the
 * browser.
 */
export function getSearchableGuides(): SearchableGuide[] {
  return [
    ...GUIDES.map((guide) => ({
      description: guide.metaDescription,
      href: guidePath(guide),
      name: guide.name,
      terms: [guide.seoTitle, ...guide.searchTerms, ...guide.sections.map((section) => section.heading)].join(" "),
    })),
    CHARACTER_LIMITS_LINK,
  ];
}
