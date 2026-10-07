import { z } from "zod";

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
