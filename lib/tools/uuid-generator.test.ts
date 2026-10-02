import { describe, expect, it, vi } from "vitest";
import { generateUuidBatch } from "./uuid-generator";

const LOWERCASE_UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("generateUuidBatch", () => {
  it("generates the requested number of lowercase UUIDs", () => {
    const uuidFactory = vi.fn(() => LOWERCASE_UUID.toUpperCase());

    expect(generateUuidBatch(2, false, uuidFactory)).toEqual({
      ok: true,
      uuids: [LOWERCASE_UUID, LOWERCASE_UUID],
    });
    expect(uuidFactory).toHaveBeenCalledTimes(2);
  });

  it("formats generated UUIDs as uppercase when requested", () => {
    expect(generateUuidBatch(1, true, () => LOWERCASE_UUID)).toEqual({
      ok: true,
      uuids: [LOWERCASE_UUID.toUpperCase()],
    });
  });

  it("rejects non-integer and out-of-range quantities", () => {
    for (const count of [0, 1.5, 101, Number.NaN]) {
      expect(generateUuidBatch(count, false, () => LOWERCASE_UUID)).toMatchObject({
        ok: false,
        message: "Choose a whole number between 1 and 100.",
      });
    }
  });

  it("returns a safe error when secure generation is unavailable", () => {
    expect(
      generateUuidBatch(1, false, () => {
        throw new Error("Secure UUID generation is unavailable.");
      }),
    ).toEqual({
      ok: false,
      message: "Secure UUID generation is unavailable.",
    });
  });
});
