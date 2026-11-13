"use client";

import type { ReactNode } from "react";
import { TOOL_COMPONENTS } from "@/components/tools/tool-components";

interface ToolRendererProps {
  /** The registry id of the tool to show. */
  toolId: string;
}

/**
 * Shows one tool's workspace. The lookup happens here, on the client side of the page, so that
 * each tool's code stays in its own chunk: a tool page downloads the code for its own tool only.
 * When the server page held the map, every tool page shipped the code of every tool.
 */
export function ToolRenderer({ toolId }: ToolRendererProps): ReactNode {
  const Tool = TOOL_COMPONENTS[toolId];

  return Tool ? <Tool /> : null;
}
