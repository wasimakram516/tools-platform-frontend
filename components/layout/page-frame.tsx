import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { SuggestToolSection } from "@/components/home/suggest-tool-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/skip-link";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

/**
 * Wraps a page in a skip link, the shared header, main landmark, a closing "suggest a tool" band, the
 * footer, and the back-to-top button. The band sits directly against the footer on every page.
 */
export function PageFrame({ children }: PropsWithChildren): ReactNode {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <Box component="main" id={MAIN_CONTENT_ID} sx={{ "&:focus": { outline: "none" }, scrollMarginTop: 96 }} tabIndex={-1}>
        {children}
      </Box>
      <SuggestToolSection />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
