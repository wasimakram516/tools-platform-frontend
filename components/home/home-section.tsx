import { Box, Container } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

/**
 * The surface a home section sits on. Alternating them gives the page a rhythm, so a long page
 * reads as distinct chapters and not as one long list.
 *
 * - plain: the page background, with a hairline above it.
 * - tint: a pale green wash.
 * - deep: a deep green band with light text.
 * - brand: the solid brand colour, for the closing call to action.
 */
export type SectionTone = "plain" | "tint" | "deep" | "brand";

interface HomeSectionProps extends PropsWithChildren {
  /** The id of the section's heading, which names the section for assistive technology. */
  headingId: string;
  tone?: SectionTone;
}

const TONE_STYLES = {
  brand: { bgcolor: "primary.main", color: "primary.contrastText" },
  deep: { bgcolor: "var(--band-deep)", color: "var(--band-deep-text)" },
  plain: { borderColor: "divider", borderTop: "1px solid" },
  tint: { bgcolor: "var(--band-tint)" },
} as const;

/**
 * One band of the home page: generous space and a centred column on the chosen surface. Every
 * home section uses it, so the spacing is the same all the way down.
 */
export function HomeSection({ children, headingId, tone = "plain" }: HomeSectionProps): ReactNode {
  return (
    <Box
      aria-labelledby={headingId}
      component="section"
      sx={{ py: { xs: 7, md: 10 }, ...TONE_STYLES[tone] }}
    >
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}
