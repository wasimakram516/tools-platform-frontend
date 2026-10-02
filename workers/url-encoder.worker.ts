import { transformUrlComponent } from "@/lib/tools/url-encoder";
import type { UrlWorkerRequest, UrlWorkerResponse } from "@/types/url-worker";

const workerContext = self as unknown as Worker;

/**
 * Processes one URL component conversion away from the browser's main thread.
 */
function handleUrlTransform(event: MessageEvent<UrlWorkerRequest>): void {
  const { input, mode } = event.data;
  const response: UrlWorkerResponse = transformUrlComponent(input, mode);

  workerContext.postMessage(response);
}

workerContext.addEventListener("message", handleUrlTransform);
