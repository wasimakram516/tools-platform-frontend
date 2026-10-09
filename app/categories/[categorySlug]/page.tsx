import { Container, Stack } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { CardGrid } from "@/components/ui/card-grid";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { categoriesCrumb, homeCrumb, PageTitle } from "@/components/ui/page-title";
import { ToolCard } from "@/components/ui/tool-card";
import { ToolIcon } from "@/components/ui/tool-icon";
import { breadcrumbJsonLd, buildPageMetadata, toolListJsonLd } from "@/lib/seo";
import { getCategoryContent } from "@/lib/tools/category-content";
import {
  getAvailableToolCategories,
  getToolCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools/tool-registry";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

/**
 * Prebuilds every category that has tools; planned categories appear only on the hub.
 */
export function generateStaticParams(): Array<{ categorySlug: string }> {
  return getAvailableToolCategories().map((category) => ({ categorySlug: category.slug }));
}

/**
 * Creates category-specific search metadata from the central registry.
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  return category
    ? buildPageMetadata({
        description: getCategoryContent(category.id)?.metaDescription ?? category.description,
        path: `/categories/${category.slug}`,
        title: category.name,
      })
    : {};
}

/**
 * Renders one registry-backed tool category.
 */
export default async function CategoryPage({ params }: CategoryPageProps): Promise<ReactNode> {
  const { categorySlug } = await params;
  const category = getToolCategoryBySlug(categorySlug);

  if (!category || category.status !== "available") {
    notFound();
  }

  const tools = getToolsByCategory(category.id);
  const content = getCategoryContent(category.id);

  return (
    <PageFrame>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          toolListJsonLd(category, tools),
        ]}
      />
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[
              homeCrumb,
              { ...categoriesCrumb, href: "/categories" },
              { icon: <ToolIcon name={category.icon} sx={{ fontSize: 18 }} />, label: category.name },
            ]}
            description={content?.intro ?? category.description}
            icon={category.icon}
            title={category.name}
          />
          <HiddenHeading>{`Tools in ${category.name}`}</HiddenHeading>
          <CardGrid label={`${category.name} catalog`} preset="catalog">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </CardGrid>
        </Stack>
      </Container>
    </PageFrame>
  );
}
