/**
 * Links that carry a calculator's inputs, so a result can be shared and opened again.
 *
 * Only tools with short, non-personal inputs (numbers, dates, and choices) use this. Free text
 * is never put in a link, because a link is easy to forward and ends up in logs and histories.
 */

/** Longer values are ignored when a link is read. Real inputs are numbers, dates, and choices. */
export const MAX_SHARED_VALUE_LENGTH = 40;

/**
 * Builds a link to the current page with the given values as query parameters. Empty values are
 * left out, and anything already in the address, such as an older shared value, is replaced.
 */
export function buildShareUrl(location: { origin: string; pathname: string }, values: Readonly<Record<string, string>>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    const trimmed = value.trim();

    if (trimmed !== "") {
      params.set(key, trimmed);
    }
  }

  const query = params.toString();

  return `${location.origin}${location.pathname}${query === "" ? "" : `?${query}`}`;
}

/**
 * Reads the values a tool knows from a page's query string. Unknown keys, empty values, and values
 * that are too long are ignored, so a link can only fill in what the tool would accept typed.
 */
export function readSharedValues(search: string, keys: readonly string[]): Record<string, string> {
  const params = new URLSearchParams(search);
  const values: Record<string, string> = {};

  for (const key of keys) {
    const value = params.get(key)?.trim();

    if (value && value.length <= MAX_SHARED_VALUE_LENGTH) {
      values[key] = value;
    }
  }

  return values;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Wraps a setter for a choice so that a shared value it does not know is ignored.
 */
export function acceptChoice<T extends string>(allowed: readonly T[], set: (value: T) => void): (value: string) => void {
  return (value) => {
    if ((allowed as readonly string[]).includes(value)) {
      set(value as T);
    }
  };
}

/**
 * Wraps a setter for a date field so that only a YYYY-MM-DD value is used, as a date input needs.
 */
export function acceptIsoDate(set: (value: string) => void): (value: string) => void {
  return (value) => {
    if (ISO_DATE.test(value)) {
      set(value);
    }
  };
}
