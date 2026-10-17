import { afterEach, describe, expect, it, vi } from "vitest";
import { runRegexInWorker } from "./regex-tester-worker";

class FakeWorker {
  static latest: FakeWorker | undefined;
  static behaviour: "reply" | "error" | "hang" = "reply";

  readonly postMessageSpy = vi.fn();
  readonly terminate = vi.fn();
  private readonly listeners = new Map<string, EventListenerOrEventListenerObject>();

  /**
   * Records the latest disposable worker used by the client.
   */
  constructor() {
    FakeWorker.latest = this;
  }

  /**
   * Stores the event handlers registered by the worker client.
   */
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (listener) {
      this.listeners.set(type, listener);
    }
  }

  /**
   * Simulates the worker replying, failing, or never finishing.
   */
  postMessage(request: unknown): void {
    this.postMessageSpy(request);

    if (FakeWorker.behaviour === "hang") {
      return;
    }

    queueMicrotask(() => {
      const isReply = FakeWorker.behaviour === "reply";
      const listener = this.listeners.get(isReply ? "message" : "error");
      const event = isReply
        ? new MessageEvent("message", { data: { matches: [], ok: true, replaced: null, truncated: false } })
        : new Event("error");

      if (typeof listener === "function") {
        listener(event);
      }
    });
  }
}

const REQUEST = { flags: "g", pattern: "a", replacement: "", text: "aaa" };

describe("runRegexInWorker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    FakeWorker.latest = undefined;
    FakeWorker.behaviour = "reply";
  });

  it("posts the request, resolves the result, and terminates the worker", async () => {
    vi.stubGlobal("Worker", FakeWorker);

    await expect(runRegexInWorker(REQUEST)).resolves.toEqual({
      matches: [],
      ok: true,
      replaced: null,
      truncated: false,
    });
    expect(FakeWorker.latest?.postMessageSpy).toHaveBeenCalledWith(REQUEST);
    expect(FakeWorker.latest?.terminate).toHaveBeenCalledOnce();
  });

  it("rejects safely and terminates when the worker fails", async () => {
    FakeWorker.behaviour = "error";
    vi.stubGlobal("Worker", FakeWorker);

    await expect(runRegexInWorker(REQUEST)).rejects.toThrow("could not start local pattern testing");
    expect(FakeWorker.latest?.terminate).toHaveBeenCalledOnce();
  });

  it("stops a pattern that never finishes and says it took too long", async () => {
    vi.useFakeTimers();
    FakeWorker.behaviour = "hang";
    vi.stubGlobal("Worker", FakeWorker);

    const pending = runRegexInWorker(REQUEST, 500);

    await vi.advanceTimersByTimeAsync(500);

    const result = await pending;

    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain("took too long");
    expect(FakeWorker.latest?.terminate).toHaveBeenCalledOnce();
  });
});
