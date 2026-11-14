import { renderShareImage } from "@/lib/og/share-image";
import { BRAND_NAME } from "@/lib/site-config";
import { getToolBySlug, getToolCategoryById, getTools } from "@/lib/tools/tool-registry";

export const alt = `${BRAND_NAME} tool`;
// Next reads these two exports as written, so they are literal values. A test checks that they
// match the size the picture is drawn at.
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

interface ToolImageProps {
  params: Promise<{ toolSlug: string }>;
}

/**
 * Prebuilds a preview picture for every available tool.
 */
export function generateStaticParams(): Array<{ toolSlug: string }> {
  return getTools()
    .filter((tool) => tool.status === "available")
    .map((tool) => ({ toolSlug: tool.slug }));
}

/**
 * The preview picture for one tool: its name, its category, and what it does.
 */
export default async function ToolOpenGraphImage({ params }: ToolImageProps): Promise<ReturnType<typeof renderShareImage>> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);
  const category = tool ? getToolCategoryById(tool.categoryId) : undefined;

  return renderShareImage({
    eyebrow: category?.name ?? "Free online tool",
    subtitle: tool?.shortDescription ?? "Free online tools for everyday tasks.",
    title: tool?.name ?? BRAND_NAME,
  });
}
