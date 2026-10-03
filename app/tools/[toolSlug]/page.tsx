import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { TOOL_COMPONENTS } from "@/components/tools/tool-components";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { breadcrumbJsonLd, buildPageMetadata, toolJsonLd } from "@/lib/seo";
import {
  getRelatedTools,
  getToolBySlug,
  getToolCategoryById,
  getTools,
} from "@/lib/tools/tool-registry";

interface ToolPageProps {
  params: Promise<{ toolSlug: string }>;
}


/**
 * Prebuilds every available tool route.
 */
export function generateStaticParams(): Array<{ toolSlug: string }> {
  return getTools()
    .filter((tool) => tool.status === "available")
    .map((tool) => ({ toolSlug: tool.slug }));
}

/**
 * Creates tool-specific search metadata from the central registry.
 */
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  return tool
    ? buildPageMetadata({
        description: tool.description,
        keywords: tool.keywords,
        path: `/tools/${tool.slug}`,
        title: tool.name,
      })
    : {};
}

/**
 * Renders an available tool inside the reusable page contract.
 */
export default async function ToolPage({ params }: ToolPageProps): Promise<ReactNode> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool || tool.status !== "available") {
    notFound();
  }

  const category = getToolCategoryById(tool.categoryId);
  const ToolComponent = TOOL_COMPONENTS[tool.id];

  if (!category || !ToolComponent) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          toolJsonLd(tool),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: category.name, path: `/categories/${category.slug}` },
            { name: tool.name, path: `/tools/${tool.slug}` },
          ]),
        ]}
      />
      <ToolPageShell category={category} tool={tool} relatedTools={getRelatedTools(tool)}>
        <ToolComponent />
      </ToolPageShell>
    </>
  );
}
