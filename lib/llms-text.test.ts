// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildLlmsText } from "@/lib/llms-text";
import { getTools } from "@/lib/tools/tool-registry";

describe("buildLlmsText", () => {
  const text = buildLlmsText();

  it("starts with the site name and a one-line summary", () => {
    expect(text.startsWith("# QuicklySorted\n\n> ")).toBe(true);
  });

  it("links every available tool, and nothing that is not available", () => {
    for (const tool of getTools()) {
      const link = `/tools/${tool.slug})`;

      expect(text.includes(link), tool.slug).toBe(tool.status === "available");
    }
  });

  it("groups the tools under their category names", () => {
    expect(text).toContain("## Calculators");
    expect(text).toContain("## Developer tools");
  });
});
