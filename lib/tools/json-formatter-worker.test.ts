import { afterEach, describe, expect, it, vi } from "vitest";
import { transformJsonInWorker } from "./json-formatter-worker";

type WorkerOutcome = "success" | "error";

class FakeWorker {
  static outcome: WorkerOutcome = "success";
  static latest: FakeWorker | undefined;

  readonly postMessageSpy = vi.fn();
  readonly terminate = vi.fn();
  private readonly listeners = new Map<string, EventListenerOrEventListenerObject>();

  /**
   * Records the latest disposable worker used by the client.
   */
  constructor(url: URL, options?: WorkerOptions) {
    void url;
    void options;
    FakeWorker.latest = this;
  }

  /**
   * Stores the event handlers registered by the worker client.
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): void {
    if (listener) {
      this.listeners.set(type, listener);
    }
  }

  /**
   * Simulates posting work and asynchronously returns the configured outcome.
   */
  postResult(request: unknown): void {
    this.postMessageSpy(request);

    queueMicrotask(() => {
      const type = FakeWorker.outcome === "success" ? "message" : "error";
      const listener = this.listeners.get(type);
      const event =
        type === "message"
          ? new MessageEvent("message", {
              data: { ok: true, output: "{}", characterCount: 2 },
            })
          : new Event("error");

      if (typeof listener === "function") {
        listener(event);
      } else {
        listener?.handleEvent(event);
      }
    });
  }
}

describe("transformJsonInWorker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeWorker.latest = undefined;
    FakeWorker.outcome = "success";
  });

  it("posts a typed request, resolves the result, and terminates the worker", async () => {
    vi.stubGlobal(
      "Worker",
      class extends FakeWorker {
        /**
         * Forwards browser postMessage calls into the deterministic fake.
         */
        postMessage(request: unknown): void {
          this.postResult(request);
        }
      },
    );

    await expect(transformJsonInWorker("{}", "format", 2)).resolves.toEqual({
      ok: true,
      output: "{}",
      characterCount: 2,
    });
    expect(FakeWorker.latest?.postMessageSpy).toHaveBeenCalledWith({
      input: "{}",
      mode: "format",
      indentation: 2,
    });
    expect(FakeWorker.latest?.terminate).toHaveBeenCalledOnce();
  });

  it("rejects safely and terminates when the worker fails", async () => {
    FakeWorker.outcome = "error";
    vi.stubGlobal(
      "Worker",
      class extends FakeWorker {
        /**
         * Forwards browser postMessage calls into the deterministic fake.
         */
        postMessage(request: unknown): void {
          this.postResult(request);
        }
      },
    );

    await expect(transformJsonInWorker("{}", "format", 2)).rejects.toThrow(
      "The browser could not start local JSON processing",
    );
    expect(FakeWorker.latest?.terminate).toHaveBeenCalledOnce();
  });
});
