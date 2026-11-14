import { beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();

vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => track(...args) }));

const { trackToolAction, withoutQuery } = await import("@/lib/analytics");

describe("trackToolAction", () => {
  beforeEach(() => {
    track.mockReset();
    window.history.pushState({}, "", "/tools/json-formatter");
  });

  it("sends only the action and the page address", () => {
    trackToolAction("copy");

    expect(track).toHaveBeenCalledWith("tool_copy", { path: "/tools/json-formatter" });
  });

  it("never throws when counting fails", () => {
    track.mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => trackToolAction("download")).not.toThrow();
  });
});

describe("withoutQuery", () => {
  it("removes the query string and the fragment, keeping the rest of the event", () => {
    expect(withoutQuery({ type: "pageview", url: "https://www.quicklysorted.com/tools/loan-calculator?amount=10000&rate=6#result" })).toEqual({
      type: "pageview",
      url: "https://www.quicklysorted.com/tools/loan-calculator",
    });
  });

  it("leaves an address without a query as it is", () => {
    expect(withoutQuery({ url: "https://www.quicklysorted.com/" }).url).toBe("https://www.quicklysorted.com/");
  });
});

