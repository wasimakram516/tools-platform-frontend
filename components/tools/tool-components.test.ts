import { describe, expect, it } from "vitest";
import { TOOL_COMPONENTS } from "@/components/tools/tool-components";
import { getTools } from "@/lib/tools/tool-registry";

const available = getTools().filter((tool) => tool.status === "available");
const baseTools = available.filter((tool) => tool.variant === undefined);
const variants = available.filter((tool) => tool.variant !== undefined);

describe("tool component map", () => {
  it("has a component for every available tool that is not a variant of another", () => {
    const missing = baseTools.filter((tool) => !(tool.id in TOOL_COMPONENTS)).map((tool) => tool.id);

    expect(missing).toEqual([]);
  });

  it("has no component for an unknown, unavailable, or variant tool", () => {
    const baseIds = new Set(baseTools.map((tool) => tool.id));
    const orphaned = Object.keys(TOOL_COMPONENTS).filter((toolId) => !baseIds.has(toolId));

    expect(orphaned).toEqual([]);
  });

  it("points every variant at an available base tool with a component, never at another variant", () => {
    const baseIds = new Set(baseTools.map((tool) => tool.id));

    for (const tool of variants) {
      expect(baseIds.has(tool.variant?.baseToolId ?? ""), tool.id).toBe(true);
    }
  });
});
