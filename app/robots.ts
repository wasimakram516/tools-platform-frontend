import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Allows all crawlers and points them at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
