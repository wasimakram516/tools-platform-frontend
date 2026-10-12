/**
 * Length limits for the places people write most, kept in one list so the Character Counter's
 * presets and the character limits page can never disagree.
 *
 * Every row says how well it is sourced, because platforms change these numbers and some never
 * publish them:
 *   official  stated in the platform's own documentation.
 *   reported  widely reported and enforced by the app, but not stated in the platform's
 *             documentation.
 *   guide     a rule of thumb. The platform sets no fixed limit and shortens text to fit.
 */

/** The date every figure below was last checked against its source, as YYYY-MM-DD. */
export const CHARACTER_LIMITS_CHECKED_ON = "2026-10-12";

export type LimitSource = "guide" | "official" | "reported";
export type LimitGroup = "messaging" | "search" | "social" | "video";

export interface CharacterLimit {
  group: LimitGroup;
  id: string;
  /** Shown as a preset in the Character Counter. */
  inCounter: boolean;
  label: string;
  limit: number;
  /** How the limit is counted, and anything that changes it. One or two sentences. */
  note: string;
  source: LimitSource;
  /** The page the figure comes from. Absent for "reported" and "guide" rows with no page. */
  sourceName?: string;
  sourceUrl?: string;
}

export const LIMIT_GROUPS: readonly { id: LimitGroup; label: string; summary: string }[] = [
  { id: "social", label: "Social posts and profiles", summary: "The most you can write in a post or a profile field." },
  { id: "video", label: "Video", summary: "Titles and descriptions on YouTube." },
  { id: "messaging", label: "Text messages", summary: "SMS length depends on the characters you use." },
  { id: "search", label: "Search results", summary: "Rules of thumb for how much of a title or description is shown." },
];

export const CHARACTER_LIMITS: readonly CharacterLimit[] = [
  {
    group: "social",
    id: "x-post",
    inCounter: true,
    label: "X post",
    limit: 280,
    note: "Counted in weighted units, not plain characters. Emoji and Chinese, Japanese, and Korean characters count as 2, every link counts as 23 whatever its length, and attached media count as 0. Some subscribed accounts can write longer posts, which this limit does not cover.",
    source: "official",
    sourceName: "X developer documentation: counting characters",
    sourceUrl: "https://docs.x.com/fundamentals/counting-characters",
  },
  {
    group: "social",
    id: "instagram-caption",
    inCounter: true,
    label: "Instagram caption",
    limit: 2200,
    note: "Instagram's help pages do not state a caption limit, but 2,200 is the figure the app enforces and the one widely reported. Hashtags are part of the caption, and a post can carry up to 30 of them.",
    source: "reported",
  },
  {
    group: "social",
    id: "instagram-bio",
    inCounter: false,
    label: "Instagram bio",
    limit: 150,
    note: "The text under your name on your profile.",
    source: "official",
    sourceName: "Instagram Help Center: add a bio",
    sourceUrl: "https://help.instagram.com/728994388226960/",
  },
  {
    group: "social",
    id: "linkedin-post",
    inCounter: true,
    label: "LinkedIn post",
    limit: 3000,
    note: "For a post you share from the feed. Only the first few lines show before the reader taps to see more.",
    source: "official",
    sourceName: "LinkedIn Help: posting updates and publishing articles",
    sourceUrl: "https://www.linkedin.com/help/linkedin/answer/a522483/differences-between-posting-updates-and-publishing?lang=en",
  },
  {
    group: "social",
    id: "linkedin-article",
    inCounter: false,
    label: "LinkedIn article",
    limit: 125000,
    note: "For a long form article published on LinkedIn, which is separate from a post.",
    source: "official",
    sourceName: "LinkedIn Help: posting updates and publishing articles",
    sourceUrl: "https://www.linkedin.com/help/linkedin/answer/a522483/differences-between-posting-updates-and-publishing?lang=en",
  },
  {
    group: "video",
    id: "youtube-title",
    inCounter: true,
    label: "YouTube title",
    limit: 100,
    note: "Titles longer than the part that fits are cut off in search results and suggestions, so put the important words first.",
    source: "official",
    sourceName: "YouTube Help: video information",
    sourceUrl: "https://support.google.com/youtube/answer/57404",
  },
  {
    group: "video",
    id: "youtube-description",
    inCounter: false,
    label: "YouTube description",
    limit: 5000,
    note: "Only the first lines show until the viewer opens the description.",
    source: "official",
    sourceName: "YouTube Help: video information",
    sourceUrl: "https://support.google.com/youtube/answer/57404",
  },
  {
    group: "messaging",
    id: "sms",
    inCounter: true,
    label: "SMS",
    limit: 160,
    note: "For a message that uses only the standard GSM-7 character set. A longer message is split into segments of 153 characters each, which the phone joins back together.",
    source: "official",
    sourceName: "Twilio documentation: SMS character limit",
    sourceUrl: "https://www.twilio.com/docs/glossary/what-sms-character-limit",
  },
  {
    group: "messaging",
    id: "sms-unicode",
    inCounter: false,
    label: "SMS with emoji or other symbols",
    limit: 70,
    note: "A single character outside the GSM-7 set, such as an emoji or a curly quotation mark, switches the whole message to Unicode. It then allows 70 characters in one message, and a longer one is split into segments of 67.",
    source: "official",
    sourceName: "Twilio documentation: SMS character limit",
    sourceUrl: "https://www.twilio.com/docs/glossary/what-sms-character-limit",
  },
  {
    group: "search",
    id: "page-title",
    inCounter: true,
    label: "Page title",
    limit: 60,
    note: "Google sets no limit on a page title. It shortens the title link to fit the width of the device, and about 60 characters is the usual rule of thumb for the part that shows.",
    source: "guide",
    sourceName: "Google Search Central: title links",
    sourceUrl: "https://developers.google.com/search/docs/appearance/title-link",
  },
  {
    group: "search",
    id: "meta-description",
    inCounter: true,
    label: "Meta description",
    limit: 160,
    note: "Google sets no limit on a meta description either, and shortens the snippet to fit the device. About 160 characters is the usual rule of thumb, and Google may write its own snippet instead.",
    source: "guide",
    sourceName: "Google Search Central: snippets",
    sourceUrl: "https://developers.google.com/search/docs/appearance/snippet",
  },
];

/** The limits offered as presets in the Character Counter, in the order they appear here. */
export function counterPresets(): readonly { label: string; limit: number }[] {
  return CHARACTER_LIMITS.filter((entry) => entry.inCounter).map(({ label, limit }) => ({ label, limit }));
}

/** The limits of one group, in page order. */
export function limitsInGroup(group: LimitGroup): readonly CharacterLimit[] {
  return CHARACTER_LIMITS.filter((entry) => entry.group === group);
}

/** What each way of sourcing a figure means, in words a reader can use. */
export const SOURCE_LABELS: Readonly<Record<LimitSource, string>> = {
  guide: "Rule of thumb",
  official: "Official",
  reported: "Widely reported",
};
