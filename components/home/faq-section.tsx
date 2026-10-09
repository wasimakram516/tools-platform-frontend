"use client";

import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { HomeSection } from "@/components/home/home-section";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { FAQ_HEADING, FAQ_INTRO, FAQ_ITEMS } from "@/lib/home-content";
import { CONTACT_URL } from "@/lib/site-config";

/** How many questions show before "Show more". The rest stay in the page, folded away. */
export const FAQ_VISIBLE_COUNT = 6;

/**
 * The frequently asked questions: the heading and a way to ask on the left, and the shared FAQ
 * accordion on the right. The same text is sent as structured data, so what a visitor reads is
 * what a search engine reads.
 */
export function FaqSection(): ReactNode {
  return (
    <HomeSection headingId="home-faq-heading">
      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: { xs: 4, md: 8 },
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 4fr) minmax(0, 8fr)" },
        }}
      >
        <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
          <Typography component="h2" id="home-faq-heading" variant="h2">
            {FAQ_HEADING}
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 2 }}>
            {FAQ_INTRO}
          </Typography>
          <Button
            href={CONTACT_URL}
            rel="noopener noreferrer"
            startIcon={<MailOutlinedIcon />}
            sx={{ mt: 2.5 }}
            target="_blank"
            variant="outlined"
          >
            Ask us a question
          </Button>
        </Box>

        <FaqAccordion items={FAQ_ITEMS} visibleCount={FAQ_VISIBLE_COUNT} />
      </Box>
    </HomeSection>
  );
}
