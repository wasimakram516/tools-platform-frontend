"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";
import { withoutQuery } from "@/lib/analytics";

/**
 * Vercel Web Analytics and Speed Insights, sending page addresses without their query strings.
 * It is a client component because the filter is a function, which a server component cannot
 * pass down.
 */
export function SiteAnalytics(): ReactNode {
  return (
    <>
      <Analytics beforeSend={withoutQuery} />
      <SpeedInsights beforeSend={withoutQuery} />
    </>
  );
}
