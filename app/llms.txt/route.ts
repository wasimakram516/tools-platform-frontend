import { buildLlmsText } from "@/lib/llms-text";

/**
 * Serves the site guide for AI assistants at /llms.txt. It is built once at build time.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsText(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
