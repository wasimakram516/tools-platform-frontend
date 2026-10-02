import type { Base64TransformMode, Base64TransformResult } from "@/lib/tools/base64";
import type { Base64WorkerRequest, Base64WorkerResponse } from "@/types/base64-worker";

export type Base64TransformRunner = (
  input: string,
  mode: Base64TransformMode,
) => Promise<Base64TransformResult>;

const WORKER_FAILURE_MESSAGE =
  "The browser could not start local Base64 processing. Reload the page and try again.";

/**
 * Runs a Base64 conversion in a disposable browser worker.
 */
export function transformBase64InWorker(
  input: string,
  mode: Base64TransformMode,
): Promise<Base64TransformResult> {
  return new Promise<Base64TransformResult>((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/base64.worker.ts", import.meta.url), {
      type: "module",
    });

    /**
     * Stops the worker after a successful response.
     */
    function handleMessage(event: MessageEvent<Base64WorkerResponse>): void {
      worker.terminate();
      resolve(event.data);
    }

    /**
     * Stops the worker and returns a safe browser-facing error.
     */
    function handleError(): void {
      worker.terminate();
      reject(new Error(WORKER_FAILURE_MESSAGE));
    }

    worker.addEventListener("message", handleMessage, { once: true });
    worker.addEventListener("error", handleError, { once: true });

    const request: Base64WorkerRequest = { input, mode };
    worker.postMessage(request);
  });
}
