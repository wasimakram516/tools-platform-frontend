import { Container, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { GuideLinks } from "@/components/guides/guide-links";
import { PageFrame } from "@/components/layout/page-frame";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { ProcessingBadge } from "@/components/ui/processing-badge";
import { RelatedToolLinks } from "@/components/ui/related-tool-links";
import { ToolIcon } from "@/components/ui/tool-icon";
import { formatIsoDate } from "@/lib/format-iso-date";
import type { Guide } from "@/lib/guides/guide-types";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

interface ToolPageShellProps extends PropsWithChildren {
  category: ToolCategory;
  /** How-to steps and questions, shown below the tool. */
  guide?: ReactNode;
  /** Reference guides that explain what the tool does, linked after the shortcuts. */
  guides?: readonly Pick<Guide, "name" | "slug">[];
  tool: ToolDefinition;
  relatedTools: readonly ToolDefinition[];
  /** Pages made for one job with this tool, such as PNG to JPG, linked as shortcuts. */
  variants?: readonly ToolDefinition[];
}

/**
 * Renders the consistent context, privacy details, workspace, and quiet lines of shortcuts (pages
 * made for one job with this tool), guides, and related tools.
 */
export function ToolPageShell({
  category,
  guide,
  guides = [],
  tool,
  relatedTools,
  variants = [],
  children,
}: ToolPageShellProps): ReactNode {
  return (
    <PageFrame>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 3, md: 4 } }}>
          <PageTitle
            breadcrumbs={[
              homeCrumb,
              { ...categoriesCrumb, href: "/categories" },
              {
                href: `/categories/${category.slug}`,
                icon: <ToolIcon name={category.icon} sx={{ fontSize: 18 }} />,
                label: category.name,
              },
              { icon: <ToolIcon name={tool.icon} sx={{ fontSize: 18 }} />, label: tool.name },
            ]}
            description={tool.description}
            icon={tool.icon}
            title={tool.name}
          />
          <Stack sx={{ gap: 2 }}>
            {children}
            <ProcessingBadge mode={tool.processingMode} />
          </Stack>
          {guide}
          <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
            Last updated <time dateTime={tool.updatedAt}>{formatIsoDate(tool.updatedAt)}</time>
          </Typography>
          <RelatedToolLinks heading="Shortcuts" headingId="tool-shortcuts-heading" tools={variants} />
          <GuideLinks guides={guides} />
          <RelatedToolLinks tools={relatedTools} />
        </Stack>
      </Container>
    </PageFrame>
  );
}
