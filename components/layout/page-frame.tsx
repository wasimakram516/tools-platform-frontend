import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { SuggestToolSection } from "@/components/home/suggest-tool-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

/**
 * Wraps a page in the shared header, main landmark, a closing "suggest a tool" band, the
 * footer, and the back-to-top button. The band sits directly against the footer on every page.
 */
export function PageFrame({ children }: PropsWithChildren): ReactNode {
  return (
    <>
      <SiteHeader />
      <Box component="main">{children}</Box>
      <SuggestToolSection />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
