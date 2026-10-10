// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadWeek, saveWeek, WEEK_STORAGE_KEY, type WeekStorage } from "@/lib/tools/dates/week-storage";
import type { WeekShift } from "@/lib/tools/dates/week-hours";

const SHIFT: WeekShift = { breakMinutes: 30, endTime: "17:30", netMinutes: 480, startTime: "09:00" };

/**
 * A stand-in for the browser's storage that keeps its values in a map.
 */
function memoryStorage(initial: Record<string, string> = {}): WeekStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));

  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
    values,
  };
}

describe("week storage", () => {
  it("gives back what was saved", () => {
    const storage = memoryStorage();

    saveWeek(storage, [SHIFT, { ...SHIFT, startTime: "22:00", endTime: "06:00", netMinutes: 450 }]);

    expect(loadWeek(storage)).toHaveLength(2);
    expect(loadWeek(storage)[0]).toEqual(SHIFT);
  });

  it("removes the saved copy when the week is emptied", () => {
    const storage = memoryStorage();

    saveWeek(storage, [SHIFT]);
    saveWeek(storage, []);

    expect(storage.values.has(WEEK_STORAGE_KEY)).toBe(false);
  });

  it("starts with an empty week when nothing is saved, or the text is damaged", () => {
    expect(loadWeek(memoryStorage())).toEqual([]);
    expect(loadWeek(memoryStorage({ [WEEK_STORAGE_KEY]: "{not json" }))).toEqual([]);
    expect(loadWeek(memoryStorage({ [WEEK_STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
  });

  it("drops entries that are not valid shifts, and keeps the valid ones", () => {
    const stored = JSON.stringify([
      SHIFT,
      { breakMinutes: -5, endTime: "17:30", netMinutes: 480, startTime: "09:00" },
      { breakMinutes: 0, endTime: "later", netMinutes: 10, startTime: "09:00" },
      { breakMinutes: 0, endTime: "10:00", netMinutes: 99999, startTime: "09:00" },
      "text",
      null,
    ]);

    expect(loadWeek(memoryStorage({ [WEEK_STORAGE_KEY]: stored }))).toEqual([SHIFT]);
  });

  it("works when storage is unavailable or throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadWeek(null)).toEqual([]);
    expect(loadWeek(blocked)).toEqual([]);
    expect(() => saveWeek(null, [SHIFT])).not.toThrow();
    expect(() => saveWeek(blocked, [SHIFT])).not.toThrow();
  });
});
