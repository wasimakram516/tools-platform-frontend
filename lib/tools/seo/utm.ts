import type { MetaTagIssue } from "@/lib/tools/seo/meta-tags";

/** The campaign tags Google Analytics reads. */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export type SpaceStyle = "dash" | "underscore" | "keep";

export interface UtmInput {
  campaign: string;
  content: string;
  id: string;
  medium: string;
  source: string;
  term: string;
  url: string;
}

export interface UtmOptions {
  /** Write every value in lower case, so Email and email do not become two rows in reports. */
  lowercase: boolean;
  /** What to do with spaces inside a value. */
  spaces: SpaceStyle;
}

export interface UtmResult {
  issues: MetaTagIssue[];
  /** The finished link, or an empty string when something must be fixed first. */
  url: string;
}

/** Common pairs of source and medium that analytics reports group correctly. */
export const UTM_PRESETS: readonly { label: string; medium: string; source: string }[] = [
  { label: "Newsletter email", medium: "email", source: "newsletter" },
  { label: "Google ads", medium: "cpc", source: "google" },
  { label: "Facebook post", medium: "social", source: "facebook" },
  { label: "Instagram post", medium: "social", source: "instagram" },
  { label: "LinkedIn post", medium: "social", source: "linkedin" },
  { label: "X post", medium: "social", source: "x" },
  { label: "YouTube video", medium: "video", source: "youtube" },
  { label: "WhatsApp message", medium: "message", source: "whatsapp" },
];

/**
 * Writes a value the way the options ask: spaces replaced and the letters changed to lower case.
 */
export function tidyValue(value: string, { lowercase, spaces }: UtmOptions): string {
  const trimmed = value.trim();
  const spaced = spaces === "keep" ? trimmed : trimmed.replace(/\s+/g, spaces === "dash" ? "-" : "_");

  return lowercase ? spaced.toLowerCase() : spaced;
}

/**
 * Reads a typed address, adding https:// when no scheme was typed, as people usually leave it out.
 */
function parseTyped(text: string): URL | null {
  const trimmed = text.trim();

  if (trimmed === "") {
    return null;
  }

  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

/**
 * Adds the campaign tags to a link. A query that is already in the link is kept, and any
 * utm_ tags that were there are replaced. A part after # stays at the end. Values are encoded so
 * that spaces become %20 and symbols cannot break the link.
 */
export function buildUtmUrl(input: UtmInput, options: UtmOptions): UtmResult {
  const issues: MetaTagIssue[] = [];
  const parsed = parseTyped(input.url);

  if (parsed === null) {
    return { issues: [{ level: "error", message: "Enter the page you want to link to, such as example.com/offer." }], url: "" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { issues: [{ level: "error", message: "Campaign links are for web pages, so they start with http or https." }], url: "" };
  }

  const values: Record<UtmKey, string> = {
    utm_campaign: tidyValue(input.campaign, options),
    utm_content: tidyValue(input.content, options),
    utm_id: tidyValue(input.id, options),
    utm_medium: tidyValue(input.medium, options),
    utm_source: tidyValue(input.source, options),
    utm_term: tidyValue(input.term, options),
  };

  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    if (values[key] === "") {
      issues.push({ level: "error", message: `Add the ${key.replace("utm_", "")}. Google Analytics expects a source, a medium, and a campaign name.` });
    }
  }

  if (!options.lowercase) {
    for (const [key, value] of Object.entries(values)) {
      if (value !== value.toLowerCase()) {
        issues.push({ level: "warning", message: `${key} has capital letters. Analytics treats Email and email as different, so reports split. Turn on lower case.` });
        break;
      }
    }
  }

  if (options.spaces === "keep" && Object.values(values).some((value) => /\s/.test(value))) {
    issues.push({ level: "warning", message: "A value has a space. It works, but dashes or underscores are easier to read and to match in reports." });
  }

  if (issues.some((issue) => issue.level === "error")) {
    return { issues, url: "" };
  }

  const kept = parsed.search
    .replace(/^\?/, "")
    .split("&")
    .filter((pair) => pair !== "" && !/^utm_(source|medium|campaign|id|term|content)(=|$)/i.test(pair));
  const added = UTM_KEYS.filter((key) => values[key] !== "").map((key) => `${key}=${encodeURIComponent(values[key])}`);

  if (kept.length !== parsed.search.replace(/^\?/, "").split("&").filter(Boolean).length) {
    issues.push({ level: "warning", message: "The link already had campaign tags. They were replaced with the ones you entered." });
  }

  parsed.search = [...kept, ...added].join("&");

  return { issues, url: parsed.toString() };
}

export interface ParsedUrl {
  hash: string;
  host: string;
  /** The part of the address after the site name and before the query. */
  path: string;
  port: string;
  protocol: string;
  query: { key: string; value: string }[];
  /** The query pairs whose names start with utm_. */
  utm: { key: string; value: string }[];
  username: string;
}

export type ParseUrlResult = { ok: true; parts: ParsedUrl; issues: MetaTagIssue[] } | { ok: false; message: string };

/**
 * Safely decodes a part of an address, leaving it as it was if it is not valid encoding.
 */
function decodePart(text: string): string {
  try {
    return decodeURIComponent(text.replaceAll("+", " "));
  } catch {
    return text;
  }
}

/**
 * Breaks a link into its parts: the scheme, site, port, path, each query value decoded, and the
 * part after #. It also points out things that often cause trouble, such as a repeated query name.
 */
export function parseUrl(text: string): ParseUrlResult {
  const parsed = parseTyped(text);

  if (parsed === null) {
    return { message: "Enter a web address to take apart.", ok: false };
  }

  const query = parsed.search
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .map((pair) => {
      const separator = pair.indexOf("=");

      return separator === -1
        ? { key: decodePart(pair), value: "" }
        : { key: decodePart(pair.slice(0, separator)), value: decodePart(pair.slice(separator + 1)) };
    });
  const issues: MetaTagIssue[] = [];
  const names = query.map((pair) => pair.key);
  const repeated = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];

  if (repeated.length > 0) {
    issues.push({ level: "warning", message: `The query repeats ${repeated.join(", ")}. Some sites read only the first or the last one.` });
  }

  if (parsed.protocol === "http:") {
    issues.push({ level: "warning", message: "This link uses http, which is not secure. Most sites now use https." });
  }

  if (parsed.username !== "") {
    issues.push({ level: "warning", message: "This link holds a user name. Do not share links that contain a password." });
  }

  return {
    issues,
    ok: true,
    parts: {
      hash: parsed.hash.replace(/^#/, ""),
      host: parsed.hostname,
      path: decodePart(parsed.pathname),
      port: parsed.port,
      protocol: parsed.protocol.replace(":", ""),
      query,
      username: parsed.username,
      utm: query.filter((pair) => pair.key.toLowerCase().startsWith("utm_")),
    },
  };
}
