import type { FaqEntry } from "@/lib/seo";

/**
 * One piece of a guide section. Text may hold [label](url) links; site paths start with "/".
 */
export type GuideBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: readonly string[] }
  | { kind: "code"; label: string; text: string }
  | { caption: string; columns: readonly string[]; kind: "table"; rows: readonly (readonly string[])[] };

export interface GuideSection {
  blocks: readonly GuideBlock[];
  heading: string;
  /** Unique within the guide; used for the heading's id. */
  id: string;
}

export interface GuideSource {
  label: string;
  url: string;
}

/**
 * A reference page that goes further than a tool page can: how something works, with tables,
 * examples, and sources, paired with the tool that does the job.
 */
export interface Guide {
  faqs: readonly FaqEntry[];
  /** The opening paragraph, under the heading. */
  intro: string;
  /** The page's description in search results, up to about 155 characters. */
  metaDescription: string;
  /** The heading on the page and the name in breadcrumbs. */
  name: string;
  /** The page's title in search results, without the site name. */
  seoTitle: string;
  sections: readonly GuideSection[];
  slug: string;
  /** Where the facts come from. Every guide lists at least two. */
  sources: readonly GuideSource[];
  /** The label of the button that opens the paired tool. */
  toolAction: string;
  /** The slug of the tool this guide pairs with. The tool links back here. */
  toolSlug: string;
  /** When the facts were last checked against the sources (YYYY-MM-DD). */
  updatedAt: string;
}
