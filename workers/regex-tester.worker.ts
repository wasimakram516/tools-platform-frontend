import { runRegex } from "@/lib/tools/regex-tester";
import type { RegexWorkerRequest, RegexWorkerResponse } from "@/types/regex-worker";

const workerContext = self as unknown as Worker;

/**
 * Runs one pattern away from the browser's main thread, so a pattern that never finishes can be stopped.
 */
function handleRegexRun(event: MessageEvent<RegexWorkerRequest>): void {
  const response: RegexWorkerResponse = runRegex(event.data);

  workerContext.postMessage(response);
}

workerContext.addEventListener("message", handleRegexRun);
