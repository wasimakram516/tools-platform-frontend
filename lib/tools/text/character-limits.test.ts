// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CHARACTER_LIMITS,
  CHARACTER_LIMITS_CHECKED_ON,
  counterPresets,
  LIMIT_GROUPS,
  limitsInGroup,
} from "@/lib/tools/text/character-limits";

describe("character limits", () => {
  it("gives every row a unique id, a real number, and a note", () => {
    const ids = new Set<string>();

    for (const entry of CHARACTER_LIMITS) {
      expect(ids.has(entry.id), `duplicate id ${entry.id}`).toBe(false);
      ids.add(entry.id);
      expect(Number.isInteger(entry.limit) && entry.limit > 0, entry.id).toBe(true);
      expect(entry.note.endsWith("."), `${entry.id} note should be a sentence`).toBe(true);
      expect(entry.note, entry.id).not.toMatch(/[–—]/);
    }
  });

  it("names a source page for every figure that claims to be official, and for rules of thumb", () => {
    for (const entry of CHARACTER_LIMITS.filter((row) => row.source === "official" || row.source === "guide")) {
      expect(entry.sourceUrl, `${entry.id} needs a source link`).toMatch(/^https:\/\//);
      expect(entry.sourceName?.length ?? 0, `${entry.id} needs a source name`).toBeGreaterThan(3);
    }
  });

  it("keeps a reported figure honest: it names no source page, and says it is not documented", () => {
    for (const entry of CHARACTER_LIMITS.filter((row) => row.source === "reported")) {
      expect(entry.sourceUrl, entry.id).toBeUndefined();
      expect(entry.note, entry.id).toMatch(/do not state|not state|not documented|widely reported/i);
    }
  });

  it("puts every row in a group that the page lists, and every group has rows", () => {
    const groupIds = new Set(LIMIT_GROUPS.map((group) => group.id));

    for (const entry of CHARACTER_LIMITS) {
      expect(groupIds.has(entry.group), entry.id).toBe(true);
    }

    for (const group of LIMIT_GROUPS) {
      expect(limitsInGroup(group.id).length, group.id).toBeGreaterThan(0);
    }
  });

  it("offers the Character Counter the same limits it always had, in the page's order", () => {
    expect(counterPresets()).toEqual([
      { label: "X post", limit: 280 },
      { label: "Instagram caption", limit: 2200 },
      { label: "LinkedIn post", limit: 3000 },
      { label: "YouTube title", limit: 100 },
      { label: "SMS", limit: 160 },
      { label: "Page title", limit: 60 },
      { label: "Meta description", limit: 160 },
    ]);
  });

  it("carries a real check date", () => {
    expect(CHARACTER_LIMITS_CHECKED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(CHARACTER_LIMITS_CHECKED_ON))).toBe(false);
  });
});
