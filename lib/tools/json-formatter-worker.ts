import type {
  JsonIndentation,
  JsonTransformMode,
  JsonTransformResult,
} from "@/lib/tools/json-formatter";
import type { JsonWorkerRequest, JsonWorkerResponse } from "@/types/json-worker";

export type JsonTransformRunner = (
  input: string,
  mode: JsonTransformMode,
  indentation: JsonIndentation,
) => Promise<JsonTransformResult>;

const WORKER_FAILURE_MESSAGE =
  "The browser could not start local JSON processing. Reload the page and try again.";

/**
 * Runs a JSON transformation in a disposable browser worker.
 */
export function transformJsonInWorker(
  input: string,
  mode: JsonTransformMode,
  indentation: JsonIndentation,
): Promise<JsonTransformResult> {
  return new Promise<JsonTransformResult>((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/json-formatter.worker.ts", import.meta.url), {
      type: "module",
    });

    /**
     * Stops the worker after a successful response.
     */
    function handleMessage(event: MessageEvent<JsonWorkerResponse>): void {
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

    const request: JsonWorkerRequest = { input, mode, indentation };
    worker.postMessage(request);
  });
}

