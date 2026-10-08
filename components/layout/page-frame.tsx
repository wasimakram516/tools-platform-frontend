import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

interface PageFrameProps extends PropsWithChildren {
  /** Remove the gap above the footer, for a page whose last section is a full-width band. */
  flushFooter?: boolean;
}

/**
 * Wraps a page in the shared header, main landmark, footer, and back-to-top button.
 */
export function PageFrame({ children, flushFooter = false }: PageFrameProps): ReactNode {
  return (
    <>
      <SiteHeader />
      <Box component="main">{children}</Box>
      <SiteFooter flush={flushFooter} />
      <ScrollToTopButton />
    </>
  );
}
