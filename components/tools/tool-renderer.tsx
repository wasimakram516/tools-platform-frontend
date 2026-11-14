"use client";

import type { ReactNode } from "react";
import { TOOL_COMPONENTS } from "@/components/tools/tool-components";
import type { ToolPreset } from "@/lib/tools/tool-preset";

interface ToolRendererProps {
  /** The settings the tool opens with, for a page made for one job. */
  preset?: ToolPreset;
  /** The registry id of the tool whose component to render. */
  toolId: string;
}

/**
 * Renders a tool's workspace on the client. The component map is imported here, in a client
 * component, so each tool page downloads only its own tool's code.
 */
export function ToolRenderer({ preset, toolId }: ToolRendererProps): ReactNode {
  const Tool = TOOL_COMPONENTS[toolId];

  return Tool ? <Tool preset={preset} /> : null;
}
