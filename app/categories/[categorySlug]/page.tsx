import { Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getToolCategories,
  getToolCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools/tool-registry";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

/**
 * Prebuilds every registered category route.
 */
export function generateStaticParams(): Array<{ categorySlug: string }> {
  return getToolCategories().map((category) => ({ categorySlug: category.slug }));
}

/**
 * Creates category-specific search metadata from the central registry.
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  return category
    ? {
        title: category.name,
        description: category.description,
      }
    : {};
}

/**
 * Renders one registry-backed tool category.
 */
export default async function CategoryPage({ params }: CategoryPageProps): Promise<ReactNode> {
  const { categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(category.id);

  return (
    <>
      <SiteHeader />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          <Box sx={{ maxWidth: 820 }}>
            <Typography
              color="primary"
              sx={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.74rem",
                fontWeight: 700,
                letterSpacing: "0.11em",
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              {category.eyebrow}
            </Typography>
            <Typography component="h1" variant="h1">
              {category.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, mt: 2 }}>
              {category.description}
            </Typography>
          </Box>

          <Box
            component="section"
            aria-label={`${category.name} catalog`}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            {tools.map((tool) => (
              <Paper
                key={tool.id}
                component="article"
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: "56px minmax(0, 1fr)",
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    bgcolor: tool.status === "available" ? "primary.main" : "grey.100",
                    color: tool.status === "available" ? "primary.contrastText" : "text.secondary",
                    display: "grid",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    height: 56,
                    placeItems: "center",
                  }}
                >
                  {tool.badge}
                </Box>
                <Box>
                  <Stack direction="row" sx={{ alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                    <Typography component="h2" variant="h5">
                      {tool.name}
                    </Typography>
                    <Chip
                      color={tool.status === "available" ? "success" : "default"}
                      label={tool.status === "available" ? "Ready" : "Planned"}
                      size="small"
                    />
                  </Stack>
                  <Typography color="text.secondary" sx={{ fontSize: "0.9rem", mt: 1 }}>
                    {tool.shortDescription}
                  </Typography>
                  {tool.status === "available" ? (
                    <Button
                      href={`/tools/${tool.slug}`}
                      sx={{ mt: 2 }}
                      variant="outlined"
                    >
                      Open tool
                    </Button>
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.7rem", mt: 2 }}
                    >
                      QUEUED FOR THIS CATEGORY
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Container>
      <SiteFooter />
    </>
  );
}
