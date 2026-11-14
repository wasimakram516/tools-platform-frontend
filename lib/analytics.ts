import { track } from "@vercel/analytics";

/**
 * Removes the query string and the fragment from an address before analytics sends it. A shared
 * calculator link carries the values typed into it, and those must never reach analytics; the
 * privacy policy says only the page address is sent.
 */
export function withoutQuery<T extends { url: string }>(event: T): T {
  return { ...event, url: event.url.replace(/[?#].*$/, "") };
}

/** The tool actions that are counted. Each says a tool produced something worth keeping. */
export type ToolAction = "copy" | "download";

/**
 * Counts that a tool's result was copied or downloaded, so it is clear which tools people
 * actually use, not just open. Only the action and the page address are sent, never the text,
 * file, or values involved: the privacy policy promises that, and a test holds it to it.
 * Analytics must never break a tool, so any failure is ignored.
 */
export function trackToolAction(action: ToolAction): void {
  try {
    track(`tool_${action}`, { path: window.location.pathname });
  } catch {
    // Counting is optional; the copy or download has already happened.
  }
}
