import { Container, Stack } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { CardGrid } from "@/components/ui/card-grid";
import { CategoryCard } from "@/components/ui/category-card";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { buildPageMetadata } from "@/lib/seo";
import { getToolCategories, getToolsByCategory } from "@/lib/tools/tool-registry";

export const metadata: Metadata = buildPageMetadata({
  description: "Browse every tool category, from developer utilities to calculators and converters.",
  path: "/categories",
  title: "All categories",
});

/**
 * Renders the categories hub, listing live categories first and planned ones after.
 */
export default function CategoriesPage(): ReactNode {
  const categories = [...getToolCategories()].sort(
    (first, second) => Number(second.status === "available") - Number(first.status === "available"),
  );

  return (
    <PageFrame>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[homeCrumb, categoriesCrumb]}
            description="Every tool is grouped by the job it does. Live categories are open now; the rest are planned."
            title="All categories"
          />
          <HiddenHeading>Tool categories</HiddenHeading>
          <CardGrid label="Tool categories" preset="categories">
            {categories.map((category) => (
              <CategoryCard
                category={category}
                key={category.id}
                toolCount={getToolsByCategory(category.id).length}
              />
            ))}
          </CardGrid>
        </Stack>
      </Container>
    </PageFrame>
  );
}
