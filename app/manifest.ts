import type { MetadataRoute } from "next";
import { BRAND_DESCRIPTOR, BRAND_NAME, THEME_COLOR } from "@/lib/site-config";

/**
 * Describes the site as an installable web app, with its name, colours, and icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#F6F8F7",
    description: BRAND_DESCRIPTOR,
    display: "standalone",
    icons: [
      { sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon.png", type: "image/png" },
    ],
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    start_url: "/",
    theme_color: THEME_COLOR,
  };
}
