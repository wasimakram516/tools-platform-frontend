import { MAX_SHIFTS, type WeekShift } from "@/lib/tools/dates/week-hours";

/** The version is part of the key, so a later change to the shape can start fresh. */
export const WEEK_STORAGE_KEY = "quicklysorted.hours-week.v1";

const TIME_PATTERN = /^\d{2}:\d{2}$/;
const MAX_MINUTES = 1440;

/** The part of the browser's storage this needs, so tests can supply a stand-in. */
export interface WeekStorage {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
}

/**
 * Tells whether a stored value is a shift this tool could have made. Stored text can be edited
 * or left over from another version, so nothing is trusted until it is checked.
 */
function isWeekShift(value: unknown): value is WeekShift {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { breakMinutes, endTime, netMinutes, startTime } = value as Record<string, unknown>;

  return (
    typeof startTime === "string" &&
    TIME_PATTERN.test(startTime) &&
    typeof endTime === "string" &&
    TIME_PATTERN.test(endTime) &&
    Number.isInteger(breakMinutes) &&
    (breakMinutes as number) >= 0 &&
    (breakMinutes as number) <= MAX_MINUTES &&
    Number.isInteger(netMinutes) &&
    (netMinutes as number) >= 0 &&
    (netMinutes as number) <= MAX_MINUTES
  );
}

/**
 * Reads the saved week. Anything missing, unreadable, or not shaped like shifts gives an empty
 * week, and storage that throws (a private window, blocked site data) is treated the same.
 */
export function loadWeek(storage: Pick<WeekStorage, "getItem"> | null): WeekShift[] {
  try {
    const text = storage?.getItem(WEEK_STORAGE_KEY);

    if (!text) {
      return [];
    }

    const parsed: unknown = JSON.parse(text);

    return Array.isArray(parsed) ? parsed.filter(isWeekShift).slice(0, MAX_SHIFTS) : [];
  } catch {
    return [];
  }
}

/**
 * Saves the week, or removes the saved copy when it is empty. A failure to save is ignored,
 * because the week still works on the page without it.
 */
export function saveWeek(storage: Pick<WeekStorage, "removeItem" | "setItem"> | null, shifts: readonly WeekShift[]): void {
  try {
    if (shifts.length === 0) {
      storage?.removeItem(WEEK_STORAGE_KEY);
    } else {
      storage?.setItem(WEEK_STORAGE_KEY, JSON.stringify(shifts));
    }
  } catch {
    // Storage can be full or blocked. The week simply is not remembered.
  }
}

/**
 * The browser's local storage, or null where it cannot be used.
 */
export function browserWeekStorage(): WeekStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
