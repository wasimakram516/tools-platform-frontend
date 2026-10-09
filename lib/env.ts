import { z } from "zod";
import { assertPublicSiteUrl, type DeploymentContext } from "@/lib/site-url";

const publicEnvironmentSchema = z.object({
  // Optional until a backend exists; nothing reads it today.
  NEXT_PUBLIC_API_URL: z.url().optional(),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const parsedEnvironment = publicEnvironmentSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedEnvironment.success) {
  throw new Error(`Invalid public environment: ${z.prettifyError(parsedEnvironment.error)}`);
}

export const env = parsedEnvironment.data;

/**
 * Which kind of deployment this is, as reported by Vercel. It is unset on other hosting and on
 * a developer's computer.
 */
export const deploymentContext: DeploymentContext = { deployment: process.env.VERCEL_ENV };

assertPublicSiteUrl(env.NEXT_PUBLIC_SITE_URL, deploymentContext);
