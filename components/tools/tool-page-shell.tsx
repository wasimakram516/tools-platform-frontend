import { Box, Container, Stack } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { ProcessingBadge } from "@/components/ui/processing-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolCard } from "@/components/ui/tool-card";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

interface ToolPageShellProps extends PropsWithChildren {
  category: ToolCategory;
  tool: ToolDefinition;
  relatedTools: readonly ToolDefinition[];
}

/**
 * Renders the consistent context, privacy details, workspace, and related links for a tool.
 */
export function ToolPageShell({
  category,
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
          {relatedTools.length > 0 ? (
            <Box aria-labelledby="related-tools-heading" component="section" sx={{ pt: 3 }}>
              <SectionHeading id="related-tools-heading" title="Continue with" />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  mt: 3,
                }}
              >
                {relatedTools.map((relatedTool) => (
                  <ToolCard key={relatedTool.id} tool={relatedTool} />
                ))}
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Container>
    </PageFrame>
  );
}
