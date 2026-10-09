import type { MetadataRoute } from "next";
import { deploymentContext } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";
import { isIndexableDeployment } from "@/lib/site-url";

/**
 * Allows all crawlers and points them at the sitemap, on the real site. Preview deployments
 * block every crawler, so they never appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment(deploymentContext)) {
    return { rules: { disallow: "/", userAgent: "*" } };
  }

  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
