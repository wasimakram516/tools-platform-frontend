import { transformJson } from "@/lib/tools/json-formatter";
import type { JsonWorkerRequest, JsonWorkerResponse } from "@/types/json-worker";

const workerContext = self as unknown as Worker;

/**
 * Processes one JSON transformation away from the browser's main thread.
 */
function handleJsonTransform(event: MessageEvent<JsonWorkerRequest>): void {
  const { input, mode, indentation } = event.data;
  const response: JsonWorkerResponse = transformJson(input, mode, indentation);

  workerContext.postMessage(response);
}

workerContext.addEventListener("message", handleJsonTransform);

