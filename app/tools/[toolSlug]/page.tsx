import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { getGuidesForTool } from "@/lib/guides/guides";
import { breadcrumbJsonLd, buildPageMetadata, faqJsonLd, toolJsonLd } from "@/lib/seo";
import { getToolContent } from "@/lib/tools/tool-content";
import { getToolExtras } from "@/lib/tools/tool-extras";
import {
  getEngineToolId,
  getRelatedTools,
  getToolBySlug,
  getToolCategoryById,
  getTools,
  getToolVariants,
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

  const content = tool ? getToolContent(tool.id) : undefined;

  return tool
    ? buildPageMetadata({
        description: content?.metaDescription ?? tool.description,
        keywords: tool.keywords,
        path: `/tools/${tool.slug}`,
        title: content?.seoTitle ?? tool.name,
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
  const content = getToolContent(tool.id);

  // Every available tool has a component; a test of the component map guarantees it.
  if (!category) {
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
          ...(content ? [faqJsonLd(content.faqs)] : []),
        ]}
      />
      <ToolPageShell
        category={category}
        guide={content ? <ToolGuide content={content} extras={getToolExtras(tool.id)} idPrefix={tool.slug} toolName={tool.name} /> : undefined}
        guides={getGuidesForTool(tool.slug)}
        relatedTools={getRelatedTools(tool)}
        tool={tool}
        variants={getToolVariants(tool.id)}
      >
        <ToolRenderer preset={tool.variant?.preset} toolId={getEngineToolId(tool)} />
      </ToolPageShell>
    </>
  );
}
