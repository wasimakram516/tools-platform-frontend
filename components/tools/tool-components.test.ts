import { describe, expect, it } from "vitest";
import { TOOL_COMPONENTS } from "@/components/tools/tool-components";
import { getTools } from "@/lib/tools/tool-registry";

describe("tool component map", () => {
  it("has a component for every available tool", () => {
    const missing = getTools()
      .filter((tool) => tool.status === "available" && !(tool.id in TOOL_COMPONENTS))
      .map((tool) => tool.id);

    expect(missing).toEqual([]);
  });

  it("has no component for an unknown or unavailable tool", () => {
    const availableIds = new Set(
      getTools()
        .filter((tool) => tool.status === "available")
        .map((tool) => tool.id),
    );
    const orphaned = Object.keys(TOOL_COMPONENTS).filter((toolId) => !availableIds.has(toolId));

    expect(orphaned).toEqual([]);
  });
});
