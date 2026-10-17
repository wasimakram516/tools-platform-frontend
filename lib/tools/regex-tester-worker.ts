import { REGEX_TIMEOUT_MILLISECONDS, type RegexRequest, type RegexResult } from "@/lib/tools/regex-tester";
import type { RegexWorkerResponse } from "@/types/regex-worker";

export type RegexRunner = (request: RegexRequest) => Promise<RegexResult>;

const WORKER_FAILURE_MESSAGE =
  "The browser could not start local pattern testing. Reload the page and try again.";

const TIMEOUT_MESSAGE =
  "This pattern took too long and was stopped. It may backtrack without end on this text. Try a more specific pattern, such as one with fewer nested repeats.";

/**
 * Runs a pattern in a disposable browser worker and stops it if it does not finish in time, so a
 * pattern that backtracks without end cannot freeze the page.
 */
export function runRegexInWorker(
  request: RegexRequest,
  timeoutMilliseconds: number = REGEX_TIMEOUT_MILLISECONDS,
): Promise<RegexResult> {
  return new Promise<RegexResult>((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/regex-tester.worker.ts", import.meta.url), {
      type: "module",
    });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ message: TIMEOUT_MESSAGE, ok: false });
    }, timeoutMilliseconds);

    /**
     * Stops the worker and the timer after a response.
     */
    function handleMessage(event: MessageEvent<RegexWorkerResponse>): void {
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    }

    /**
     * Stops the worker and returns a safe browser-facing error.
     */
    function handleError(): void {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(WORKER_FAILURE_MESSAGE));
    }

    worker.addEventListener("message", handleMessage, { once: true });
    worker.addEventListener("error", handleError, { once: true });
    worker.postMessage(request);
  });
}
