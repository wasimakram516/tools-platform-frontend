import type { UrlTransformMode, UrlTransformResult } from "@/lib/tools/url-encoder";
import type { UrlWorkerRequest, UrlWorkerResponse } from "@/types/url-worker";

export type UrlTransformRunner = (
  input: string,
  mode: UrlTransformMode,
) => Promise<UrlTransformResult>;

const WORKER_FAILURE_MESSAGE =
  "The browser could not start local URL processing. Reload the page and try again.";

/**
 * Runs a URL component conversion in a disposable browser worker.
 */
export function transformUrlInWorker(
  input: string,
  mode: UrlTransformMode,
): Promise<UrlTransformResult> {
  return new Promise<UrlTransformResult>((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/url-encoder.worker.ts", import.meta.url), {
      type: "module",
    });

    /** Stops the worker after a successful response. */
    function handleMessage(event: MessageEvent<UrlWorkerResponse>): void {
      worker.terminate();
      resolve(event.data);
    }

    /** Stops the worker and returns a safe browser-facing error. */
    function handleError(): void {
      worker.terminate();
      reject(new Error(WORKER_FAILURE_MESSAGE));
    }

    worker.addEventListener("message", handleMessage, { once: true });
    worker.addEventListener("error", handleError, { once: true });

    const request: UrlWorkerRequest = { input, mode };
    worker.postMessage(request);
  });
}
