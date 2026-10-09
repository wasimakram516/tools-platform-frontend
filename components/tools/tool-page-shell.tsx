import { Container, Stack } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { ProcessingBadge } from "@/components/ui/processing-badge";
import { RelatedToolLinks } from "@/components/ui/related-tool-links";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

interface ToolPageShellProps extends PropsWithChildren {
  category: ToolCategory;
  /** How-to steps and questions, shown below the tool. */
  guide?: ReactNode;
  tool: ToolDefinition;
  relatedTools: readonly ToolDefinition[];
}

/**
 * Renders the consistent context, privacy details, workspace, and a quiet line of related tools.
 */
export function ToolPageShell({
  category,
  guide,
  tool,
  relatedTools,
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
          <RelatedToolLinks tools={relatedTools} />
        </Stack>
      </Container>
    </PageFrame>
  );
}
