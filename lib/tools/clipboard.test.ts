import { afterEach, describe, expect, it, vi } from "vitest";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";

/**
 * Replaces navigator.clipboard with a stub whose writeText behaviour the test controls.
 */
function stubClipboard(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
}

describe("clipboard helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports success and passes the text to the clipboard", async () => {
    const writeText = vi.fn(async () => undefined);
    stubClipboard(writeText);

    await expect(copyToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("reports failure instead of throwing when the browser blocks copying", async () => {
    stubClipboard(async () => {
      throw new Error("blocked");
    });

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });

  it("names the thing to copy by hand, singular or plural", () => {
    expect(copyBlockedMessage("result")).toBe(
      "Copy was blocked by the browser. Select the result and copy it manually.",
    );
    expect(copyBlockedMessage("UUIDs", true)).toBe(
      "Copy was blocked by the browser. Select the UUIDs and copy them manually.",
    );
  });
});
