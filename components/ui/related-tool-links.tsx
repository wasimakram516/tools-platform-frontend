import type { ReactNode } from "react";
import { LinkChipRow } from "@/components/ui/link-chip-row";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolDefinition } from "@/types/tool";

interface RelatedToolLinksProps {
  /** The label before the links. */
  heading?: string;
  /** The heading's id, unique on the page. */
  headingId?: string;
  tools: readonly ToolDefinition[];
}

/**
 * A single quiet line of links to related tools, each a rounded pill with the tool's icon.
 */
export function RelatedToolLinks({
  heading = "Related tools",
  headingId = "related-tools-heading",
  tools,
}: RelatedToolLinksProps): ReactNode {
  return (
    <LinkChipRow
      heading={heading}
      headingId={headingId}
      links={tools.map((tool) => ({ href: `/tools/${tool.slug}`, icon: <ToolIcon name={tool.icon} sx={{ fontSize: 18 }} />, label: tool.name }))}
    />
  );
}
