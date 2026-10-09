/** Hosts that only work on one computer, and so must never be the public address of the site. */
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

export interface DeploymentContext {
  /** The deployment kind Vercel reports: "production", "preview", or "development". Unset elsewhere. */
  deployment: string | undefined;
}

/**
 * Tells whether a web address points at the computer it is opened on.
 */
export function isLocalSiteUrl(siteUrl: string): boolean {
  try {
    const { hostname } = new URL(siteUrl);

    return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

/**
 * Stops a live production deployment from starting with a local site address. Every canonical
 * link, share image, structured data entry, and sitemap line is built from that address, so a
 * localhost value would put wrong URLs in front of search engines. Local builds are unaffected.
 */
export function assertPublicSiteUrl(siteUrl: string, { deployment }: DeploymentContext): void {
  if (deployment === "production" && isLocalSiteUrl(siteUrl)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is "${siteUrl}", which is a local address. Set it to the public site address in the production environment.`,
    );
  }
}

/**
 * Tells whether search engines should be allowed to index this deployment. Preview deployments
 * on Vercel get their own web addresses, and they must stay out of search results so they never
 * compete with, or duplicate, the real site. Production and ordinary hosting stay indexable.
 */
export function isIndexableDeployment({ deployment }: DeploymentContext): boolean {
  return deployment === undefined || deployment === "production";
}
