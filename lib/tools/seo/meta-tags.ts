/** Search results show about this much of a page title and description before cutting them off. */
export const TITLE_SHOWN_CHARACTERS = 60;
export const DESCRIPTION_SHOWN_CHARACTERS = 160;
/** Lengths that tend to work well, used for gentle advice and never as hard limits. */
export const TITLE_MIN_GOOD = 30;
export const DESCRIPTION_MIN_GOOD = 70;

const HANDLE_PATTERN = /^@?[A-Za-z0-9_]{1,15}$/;
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const LOCALE_PATTERN = /^[a-z]{2}(_[A-Z]{2})?$/;

export type OpenGraphType = "website" | "article";
export type TwitterCardType = "summary" | "summary_large_image";

export interface MetaTagInput {
  description: string;
  /** Let search engines follow the links on the page. */
  followLinks: boolean;
  imageAlt: string;
  imageUrl: string;
  /** Let search engines show the page in results. */
  indexable: boolean;
  locale: string;
  ogType: OpenGraphType;
  siteName: string;
  themeColor: string;
  title: string;
  twitterCard: TwitterCardType;
  twitterHandle: string;
  /** The page's own address, used for the canonical link and for Open Graph. */
  url: string;
}

export interface MetaTagIssue {
  /** An error stops the tags being useful. A warning is advice. */
  level: "error" | "warning";
  message: string;
}

export interface MetaTagResult {
  html: string;
  issues: MetaTagIssue[];
}

/**
 * Makes text safe to put inside an HTML attribute that is wrapped in double quotes.
 */
export function escapeAttribute(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * Makes text safe to put between HTML tags.
 */
export function escapeText(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * Tells whether text is an absolute web address that starts with http or https.
 */
export function isAbsoluteHttpUrl(text: string): boolean {
  try {
    const { protocol } = new URL(text);

    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Shortens text to a length, cutting at a word where it can and adding an ellipsis.
 */
export function truncateAtWord(text: string, maxCharacters: number): string {
  const clean = text.trim().replace(/\s+/g, " ");

  if (clean.length <= maxCharacters) {
    return clean;
  }

  const cut = clean.slice(0, maxCharacters - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxCharacters * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${base.trimEnd()}…`;
}

/**
 * Describes how a web address is shown in a search result: the site, then the path split into
 * steps, for example "example.com › blog › post".
 */
export function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const steps = parsed.pathname.split("/").filter(Boolean);

    return [parsed.host, ...steps].join(" › ");
  } catch {
    return url;
  }
}

/**
 * Checks the fields and returns advice. Errors are things that make the tags wrong, such as an
 * address that is not absolute. Warnings are advice about length and format.
 */
export function checkMetaTags(input: MetaTagInput): MetaTagIssue[] {
  const issues: MetaTagIssue[] = [];
  const title = input.title.trim();
  const description = input.description.trim();

  if (title === "") {
    issues.push({ level: "error", message: "Add a page title. It is the most important tag on the page." });
  } else if (title.length > TITLE_SHOWN_CHARACTERS) {
    issues.push({ level: "warning", message: `The title is ${title.length} characters. Search results show about ${TITLE_SHOWN_CHARACTERS}, so the end may be cut off.` });
  } else if (title.length < TITLE_MIN_GOOD) {
    issues.push({ level: "warning", message: `The title is short at ${title.length} characters. Around ${TITLE_MIN_GOOD} to ${TITLE_SHOWN_CHARACTERS} lets you say more.` });
  }

  if (description === "") {
    issues.push({ level: "warning", message: "Add a description. Search results often show it under the title." });
  } else if (description.length > DESCRIPTION_SHOWN_CHARACTERS) {
    issues.push({ level: "warning", message: `The description is ${description.length} characters. Search results show about ${DESCRIPTION_SHOWN_CHARACTERS}, so the end may be cut off.` });
  } else if (description.length < DESCRIPTION_MIN_GOOD) {
    issues.push({ level: "warning", message: `The description is short at ${description.length} characters. Around ${DESCRIPTION_MIN_GOOD} to ${DESCRIPTION_SHOWN_CHARACTERS} reads better in results.` });
  }

  if (input.url.trim() !== "" && !isAbsoluteHttpUrl(input.url.trim())) {
    issues.push({ level: "error", message: "The page address must be a full web address that starts with https://." });
  }

  if (input.imageUrl.trim() !== "" && !isAbsoluteHttpUrl(input.imageUrl.trim())) {
    issues.push({ level: "error", message: "The image address must be a full web address that starts with https://. Social sites cannot load a relative path." });
  }

  if (input.imageUrl.trim() === "") {
    issues.push({ level: "warning", message: "Add an image. Links with a picture get noticed far more often when shared. 1200 by 630 pixels works well." });
  } else if (input.imageAlt.trim() === "") {
    issues.push({ level: "warning", message: "Describe the image in the image text, so it can be read aloud." });
  }

  if (input.twitterHandle.trim() !== "" && !HANDLE_PATTERN.test(input.twitterHandle.trim())) {
    issues.push({ level: "error", message: "An X handle has up to 15 letters, digits, or underscores, such as @example." });
  }

  if (input.themeColor.trim() !== "" && !HEX_COLOR_PATTERN.test(input.themeColor.trim())) {
    issues.push({ level: "error", message: "The theme colour must be a hex colour such as #1F7A5A." });
  }

  if (input.locale.trim() !== "" && !LOCALE_PATTERN.test(input.locale.trim())) {
    issues.push({ level: "error", message: "The locale is a language and country with an underscore, such as en_US." });
  }

  if (!input.indexable) {
    issues.push({ level: "warning", message: "This page will ask search engines not to show it in results. Leave that off for a page you want people to find." });
  }

  return issues;
}

/**
 * Builds the HTML tags for the head of a page: the title and description, the canonical link,
 * Open Graph tags for Facebook, LinkedIn, and chat apps, and the card tags for X. X reads the
 * Open Graph tags for the rest, so only the card type and the site handle are added for it.
 */
export function buildMetaTags(input: MetaTagInput): MetaTagResult {
  const issues = checkMetaTags(input);
  const title = input.title.trim();
  const description = input.description.trim();
  const url = input.url.trim();
  const image = input.imageUrl.trim();
  const lines: string[] = [];
  const meta = (attribute: "name" | "property", key: string, value: string): void => {
    lines.push(`<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`);
  };

  if (title !== "") {
    lines.push(`<title>${escapeText(title)}</title>`);
  }

  if (description !== "") {
    meta("name", "description", description);
  }

  if (url !== "") {
    lines.push(`<link rel="canonical" href="${escapeAttribute(url)}">`);
  }

  if (!input.indexable || !input.followLinks) {
    meta("name", "robots", `${input.indexable ? "index" : "noindex"}, ${input.followLinks ? "follow" : "nofollow"}`);
  }

  if (input.themeColor.trim() !== "") {
    meta("name", "theme-color", input.themeColor.trim());
  }

  meta("property", "og:type", input.ogType);

  if (title !== "") {
    meta("property", "og:title", title);
  }

  if (description !== "") {
    meta("property", "og:description", description);
  }

  if (url !== "") {
    meta("property", "og:url", url);
  }

  if (input.siteName.trim() !== "") {
    meta("property", "og:site_name", input.siteName.trim());
  }

  if (input.locale.trim() !== "") {
    meta("property", "og:locale", input.locale.trim());
  }

  if (image !== "") {
    meta("property", "og:image", image);

    if (input.imageAlt.trim() !== "") {
      meta("property", "og:image:alt", input.imageAlt.trim());
    }
  }

  meta("name", "twitter:card", image === "" ? "summary" : input.twitterCard);

  if (input.twitterHandle.trim() !== "") {
    const handle = input.twitterHandle.trim();

    meta("name", "twitter:site", handle.startsWith("@") ? handle : `@${handle}`);
  }

  return { html: lines.join("\n"), issues };
}
