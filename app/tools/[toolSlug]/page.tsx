import type { ComponentType, ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Base64EncoderDecoderTool } from "@/components/tools/base64-encoder-decoder-tool";
import { JsonFormatterTool } from "@/components/tools/json-formatter-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import {
  getRelatedTools,
  getToolBySlug,
  getToolCategoryById,
  getTools,
} from "@/lib/tools/tool-registry";

interface ToolPageProps {
  params: Promise<{ toolSlug: string }>;
}

const AVAILABLE_TOOL_COMPONENTS: Readonly<Record<string, ComponentType>> = {
  "DEV-01": JsonFormatterTool,
  "DEV-04": Base64EncoderDecoderTool,
};

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
    ? {
        title: tool.name,
        description: tool.shortDescription,
        keywords: [...tool.keywords],
      }
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
  const ToolComponent = AVAILABLE_TOOL_COMPONENTS[tool.id];

  if (!category || !ToolComponent) {
    notFound();
  }

  return (
    <ToolPageShell category={category} tool={tool} relatedTools={getRelatedTools(tool)}>
      <ToolComponent />
    </ToolPageShell>
  );
}
