import { renderShareImage } from "@/lib/og/share-image";
import { BRAND_DESCRIPTOR, BRAND_NAME } from "@/lib/site-config";

export const alt = `${BRAND_NAME}: ${BRAND_DESCRIPTOR}`;
// Next reads these two exports as written, so they are literal values. A test checks that they
// match the size the picture is drawn at.
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

/**
 * The preview picture for the home page, and for every page without a picture of its own.
 */
export default function OpenGraphImage(): ReturnType<typeof renderShareImage> {
  return renderShareImage({
    eyebrow: "Free online tools",
    subtitle: "Developer, date and time, text, and image tools, calculators, and generators. Free, with no signup.",
    title: BRAND_DESCRIPTOR,
  });
}
