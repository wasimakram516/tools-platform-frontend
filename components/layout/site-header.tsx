import { Stack } from "@mui/material";
import { HeaderShell } from "@/components/layout/header-shell";
import { SiteNav } from "@/components/layout/site-nav";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { NextLink } from "@/components/ui/next-link";
import { buildNavData } from "@/lib/nav-data";
import { BRAND_NAME } from "@/lib/site-config";
import type { ReactNode } from "react";

/**
 * Renders the site header: the brand mark and wordmark on the left, and on the right the
 * navigation built from the tool registry, so new tools and categories appear without edits.
 * The frame turns into a floating pill when the page is scrolled.
 */
export function SiteHeader(): ReactNode {
  return (
    <HeaderShell>
      <Stack
        aria-label={`${BRAND_NAME} home`}
        component={NextLink}
        direction="row"
        href="/"
        sx={{ alignItems: "center", color: "inherit", gap: 1.25, textDecoration: "none" }}
      >
        <BrandLockup />
      </Stack>
      <Stack direction="row" sx={{ alignItems: "center", gap: { xs: 0, md: 2 } }}>
        <SiteNav data={buildNavData()} />
      </Stack>
    </HeaderShell>
  );
}
