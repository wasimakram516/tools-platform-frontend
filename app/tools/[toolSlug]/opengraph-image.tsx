import { renderShareImage } from "@/lib/og/share-image";
import { BRAND_NAME } from "@/lib/site-config";
import { getToolBySlug, getToolCategoryById, getTools } from "@/lib/tools/tool-registry";

// Next reads these two exports as written, so they are literal values. A test checks that they
// match the size the picture is drawn at.
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

interface ToolImageProps {
  /** The image id from generateImageMetadata. There is one picture per tool, so it is not used. */
  id?: Promise<string>;
  params: Promise<{ toolSlug: string }>;
}

/** The one picture each tool has. Its id becomes the last part of the picture's address. */
const IMAGE_ID = "card";

/**
 * Describes the tool's picture, with alt text that names the tool and says what it does, so a
 * reader who cannot see the picture, or a search engine, learns what the link is about.
 */
export function generateImageMetadata({ params }: { params: { toolSlug: string } }): Array<{
  alt: string;
  contentType: string;
  id: string;
  size: { height: number; width: number };
}> {
  const tool = getToolBySlug(params.toolSlug);

  return [
    {
      alt: tool ? `${tool.name}: ${tool.shortDescription}` : `${BRAND_NAME} tool`,
      contentType,
      id: IMAGE_ID,
      size,
    },
  ];
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
