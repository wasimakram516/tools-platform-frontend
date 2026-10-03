import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

/**
 * Wraps a page in the shared header, main landmark, footer, and back-to-top button.
 */
export function PageFrame({ children }: PropsWithChildren): ReactNode {
  return (
    <>
      <SiteHeader />
      <Box component="main">{children}</Box>
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
