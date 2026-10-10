import { Container, Stack } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { CardGrid } from "@/components/ui/card-grid";
import { CategoryCard } from "@/components/ui/category-card";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { breadcrumbJsonLd, buildPageMetadata, categoriesJsonLd } from "@/lib/seo";
import { getAvailableToolCategories, getToolCategories, getToolsByCategory } from "@/lib/tools/tool-registry";

/**
 * Names the categories that exist, so the description stays true as categories are added.
 */
function categoriesDescription(): string {
  const names = getAvailableToolCategories().map((category) => category.name.toLowerCase());

  return `Free browser tools by category: ${names.join(", ")}.`;
}

export const metadata: Metadata = buildPageMetadata({
  description: categoriesDescription(),
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
      <JsonLd
        data={[
          categoriesJsonLd(getAvailableToolCategories(), categoriesDescription()),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "All categories", path: "/categories" },
          ]),
        ]}
      />
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
