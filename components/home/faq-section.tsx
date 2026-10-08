"use client";

import AddIcon from "@mui/icons-material/Add";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { HomeSection } from "@/components/home/home-section";
import { FAQ_HEADING, FAQ_INTRO, FAQ_ITEMS } from "@/lib/home-content";
import { Reveal } from "@/components/ui/reveal";
import { revealDelay } from "@/lib/reveal-delay";
import { CONTACT_URL } from "@/lib/site-config";
import { SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";

/**
 * The frequently asked questions: the heading and a way to ask on the left, and an accordion on
 * the right that opens one answer at a time and highlights the open one. The same text is sent
 * to search engines as structured data, so the answers a visitor reads are exactly the ones a
 * search result can show.
 */
export function FaqSection(): ReactNode {
  const [openId, setOpenId] = useState<string | false>(false);

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

        <Box sx={{ display: "grid", gap: 1.5 }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openId === item.id;

            return (
              <Reveal delay={revealDelay(index)} key={item.id}>
              <Accordion
                disableGutters
                elevation={0}
                expanded={isOpen}
                onChange={(_event, expanded) => setOpenId(expanded ? item.id : false)}
                slotProps={{ transition: { timeout: 220 } }}
                sx={{
                  "&::before": { display: "none" },
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: isOpen ? "primary.main" : "divider",
                  borderRadius: `${SURFACE_RADIUS} !important`,
                  boxShadow: isOpen ? SURFACE_SHADOW : "none",
                  overflow: "hidden",
                  transition: "border-color 200ms ease, box-shadow 200ms ease",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <AccordionSummary
                  aria-controls={`faq-${item.id}-content`}
                  expandIcon={null}
                  id={`faq-${item.id}-header`}
                  sx={{
                    alignItems: "center",
                    gap: 2,
                    px: 2.5,
                    py: 1,
                    "& .MuiAccordionSummary-content": { alignItems: "center", gap: 2, m: 0 },
                  }}
                >
                  <Typography
                    aria-hidden="true"
                    sx={{
                      color: isOpen ? "primary.main" : "text.disabled",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      minWidth: 24,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography component="h3" sx={{ flexGrow: 1, fontSize: "1.05rem", fontWeight: 650 }}>
                    {item.question}
                  </Typography>
                  <Box
                    aria-hidden="true"
                    sx={{
                      alignItems: "center",
                      bgcolor: isOpen ? "primary.main" : "action.hover",
                      borderRadius: "50%",
                      color: isOpen ? "primary.contrastText" : "primary.main",
                      display: "inline-flex",
                      flexShrink: 0,
                      height: 32,
                      justifyContent: "center",
                      transition: "background-color 200ms ease, color 200ms ease",
                      width: 32,
                    }}
                  >
                    {isOpen ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                  </Box>
                </AccordionSummary>
                <AccordionDetails id={`faq-${item.id}-content`} sx={{ pb: 2.75, pl: { xs: 2.5, sm: 8.5 }, pr: 2.5, pt: 0 }}>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              </Reveal>
            );
          })}
        </Box>
      </Box>
    </HomeSection>
  );
}
