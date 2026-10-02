import { Box, Breadcrumbs, Chip, Container, Link, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

interface ToolPageShellProps extends PropsWithChildren {
  category: ToolCategory;
  tool: ToolDefinition;
  relatedTools: readonly ToolDefinition[];
}

const PROCESSING_LABELS = {
  browser: "On this device",
  worker: "On this device · background worker",
  wasm: "On this device · WebAssembly",
  server: "Secure server processing",
} as const;

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
    <>
      <SiteHeader />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Breadcrumbs aria-label="Breadcrumb">
            <Link href="/" color="text.secondary" underline="hover">
              Tools
            </Link>
            <Link
              href={`/categories/${category.slug}`}
              color="text.secondary"
              underline="hover"
            >
              {category.name}
            </Link>
            <Typography color="text.primary">{tool.name}</Typography>
          </Breadcrumbs>

          <Box sx={{ maxWidth: 820 }}>
            <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip color="success" label={PROCESSING_LABELS[tool.processingMode]} size="small" />
              <Chip label="No signup" size="small" variant="outlined" />
            </Stack>
            <Typography component="h1" variant="h1">
              {tool.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, mt: 2 }}>
              {tool.description}
            </Typography>
          </Box>

          <Box
            sx={{
              alignItems: "start",
              display: "grid",
              gap: { xs: 2, md: 3 },
              gridTemplateColumns: { xs: "1fr", lg: "250px minmax(0, 1fr)" },
            }}
          >
            <Box
              component="aside"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                p: 2.5,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  mb: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Processing note
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                This tool runs locally. Your input is not uploaded to the Tools Platform backend.
              </Typography>
            </Box>
            {children}
          </Box>

          <Box component="section" aria-labelledby="related-tools-heading" sx={{ pt: 3 }}>
            <Typography id="related-tools-heading" component="h2" variant="h4">
              Continue with
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                mt: 2,
              }}
            >
              {relatedTools.map((relatedTool) => (
                <Box
                  key={relatedTool.id}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    minHeight: 120,
                    p: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{relatedTool.name}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.75 }}>
                    {relatedTool.shortDescription}
                  </Typography>
                  <Typography
                    color="primary"
                    sx={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                      mt: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {relatedTool.status === "available" ? "Open tool" : "Coming next"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
      <SiteFooter />
    </>
  );
}
