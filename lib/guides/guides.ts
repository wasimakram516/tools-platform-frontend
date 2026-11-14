import { EXCEL_DATE_GUIDE } from "@/lib/guides/excel-date-serial-numbers";
import type { Guide } from "@/lib/guides/guide-types";
import { REGEX_CHEAT_SHEET_GUIDE } from "@/lib/guides/javascript-regex-cheat-sheet";
import { JWT_CLAIMS_GUIDE } from "@/lib/guides/jwt-claims";
import { QR_ERROR_CORRECTION_GUIDE } from "@/lib/guides/qr-code-error-correction";
import { SHA_COMPARISON_GUIDE } from "@/lib/guides/sha-1-vs-sha-256-vs-sha-512";
import { UTM_PARAMETERS_GUIDE } from "@/lib/guides/utm-parameters";

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
