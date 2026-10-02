import { transformBase64 } from "@/lib/tools/base64";
import type { Base64WorkerRequest, Base64WorkerResponse } from "@/types/base64-worker";

const workerContext = self as unknown as Worker;

/**
 * Processes one Base64 conversion away from the browser's main thread.
 */
function handleBase64Transform(event: MessageEvent<Base64WorkerRequest>): void {
  const { input, mode } = event.data;
  const response: Base64WorkerResponse = transformBase64(input, mode);

  workerContext.postMessage(response);
}

workerContext.addEventListener("message", handleBase64Transform);
