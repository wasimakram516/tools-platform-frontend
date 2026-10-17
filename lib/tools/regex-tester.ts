export const MAX_REGEX_PATTERN_CHARACTERS = 2_000;
export const MAX_REGEX_TEXT_CHARACTERS = 200_000;
export const MAX_REGEX_REPLACEMENT_CHARACTERS = 5_000;
export const MAX_REGEX_MATCHES = 1_000;
export const REGEX_TIMEOUT_MILLISECONDS = 2_000;

export const REGEX_FLAGS = ["g", "i", "m", "s", "u"] as const;

export type RegexFlag = (typeof REGEX_FLAGS)[number];

export interface RegexRequest {
  /** The pattern between the slashes, without flags. */
  pattern: string;
  /** Any of g, i, m, s, and u, in any order. */
  flags: string;
  text: string;
  /** Optional replacement text. Empty means no replacement preview. */
  replacement: string;
}

export interface RegexMatch {
  /** The matched text. */
  value: string;
  /** Where the match starts, counted in UTF-16 code units like JavaScript string indexes. */
  index: number;
  /** Numbered groups in order. A group that did not take part is null. */
  groups: readonly (string | null)[];
  /** Named groups, with null for a group that did not take part. */
  namedGroups: Readonly<Record<string, string | null>>;
}

export interface RegexSuccess {
  ok: true;
  matches: readonly RegexMatch[];
  /** True when there were more matches than the cap, so only the first ones are listed. */
  truncated: boolean;
  /** The text with the replacement applied, or null when no replacement was asked for. */
  replaced: string | null;
}

export interface RegexFailure {
  ok: false;
  message: string;
}

export type RegexResult = RegexSuccess | RegexFailure;

/**
 * A piece of the test text, either between matches or inside one.
 */
export interface HighlightSegment {
  text: string;
  /** The position of the match this piece belongs to in the match list, or null if it is plain text. */
  matchIndex: number | null;
}

/**
 * Keeps each flag once, in the standard order, and drops anything that is not a supported flag.
 */
export function normalizeFlags(flags: string): string {
  return REGEX_FLAGS.filter((flag) => flags.includes(flag)).join("");
}

/**
 * Returns the reason the input is too large, or null when it is within the limits.
 */
function findSizeProblem(request: RegexRequest): string | null {
  if (request.pattern.length > MAX_REGEX_PATTERN_CHARACTERS) {
    return `The pattern is longer than ${MAX_REGEX_PATTERN_CHARACTERS.toLocaleString("en-US")} characters.`;
  }

  if (request.text.length > MAX_REGEX_TEXT_CHARACTERS) {
    return `The test text is longer than ${MAX_REGEX_TEXT_CHARACTERS.toLocaleString("en-US")} characters.`;
  }

  if (request.replacement.length > MAX_REGEX_REPLACEMENT_CHARACTERS) {
    return `The replacement is longer than ${MAX_REGEX_REPLACEMENT_CHARACTERS.toLocaleString("en-US")} characters.`;
  }

  return null;
}

/**
 * Turns one engine match into the shape the tool shows.
 */
function toRegexMatch(match: RegExpMatchArray): RegexMatch {
  return {
    groups: match.slice(1).map((group) => group ?? null),
    index: match.index ?? 0,
    namedGroups: Object.fromEntries(Object.entries(match.groups ?? {}).map(([name, value]) => [name, value ?? null])),
    value: match[0],
  };
}

/**
 * Runs a pattern over the text and lists every match, with an optional replacement preview.
 * Syntax errors come back as a plain message. This call can run for a very long time on some
 * patterns, so the page runs it in a worker it can stop.
 */
export function runRegex(request: RegexRequest): RegexResult {
  const sizeProblem = findSizeProblem(request);

  if (sizeProblem) {
    return { message: sizeProblem, ok: false };
  }

  if (!request.pattern) {
    return { message: "Type a pattern to test.", ok: false };
  }

  const flags = normalizeFlags(request.flags);
  const isGlobal = flags.includes("g");
  let expression: RegExp;

  try {
    expression = new RegExp(request.pattern, isGlobal ? flags : `${flags}g`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "The pattern is not valid.", ok: false };
  }

  const matches: RegexMatch[] = [];
  let truncated = false;

  for (const match of request.text.matchAll(expression)) {
    if (matches.length >= MAX_REGEX_MATCHES) {
      truncated = true;
      break;
    }

    matches.push(toRegexMatch(match));

    if (!isGlobal) {
      break;
    }
  }

  const replaced = request.replacement
    ? request.text.replace(new RegExp(request.pattern, flags), request.replacement)
    : null;

  return { matches, ok: true, replaced, truncated };
}

/**
 * Splits the text into plain pieces and matched pieces, so the matches can be highlighted in place.
 * Empty matches have nothing to highlight and are skipped.
 */
export function buildHighlightSegments(text: string, matches: readonly RegexMatch[]): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  matches.forEach((match, matchIndex) => {
    if (match.value.length === 0 || match.index < cursor) {
      return;
    }

    if (match.index > cursor) {
      segments.push({ matchIndex: null, text: text.slice(cursor, match.index) });
    }

    segments.push({ matchIndex, text: match.value });
    cursor = match.index + match.value.length;
  });

  if (cursor < text.length) {
    segments.push({ matchIndex: null, text: text.slice(cursor) });
  }

  return segments;
}
