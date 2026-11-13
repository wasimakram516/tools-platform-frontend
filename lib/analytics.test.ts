import { beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();

vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => track(...args) }));

const { trackToolAction } = await import("@/lib/analytics");

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
