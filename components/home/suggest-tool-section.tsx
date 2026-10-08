import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { HomeSection } from "@/components/home/home-section";
import { Reveal } from "@/components/ui/reveal";
import { SUGGEST_HEADING, SUGGEST_TEXT } from "@/lib/home-content";
import { CONTACT_URL } from "@/lib/site-config";

/**
 * A short, quiet invitation to ask for a tool or report a problem, linking to the company
 * contact form so there is no mailbox to build or watch on this site.
 */
export function SuggestToolSection(): ReactNode {
  return (
    <HomeSection headingId="home-suggest-heading" tone="brand">
      <Reveal sx={{ mx: "auto", textAlign: "center" }}>
        <Typography component="h2" id="home-suggest-heading" variant="h3">
          {SUGGEST_HEADING}
        </Typography>
        <Typography sx={{ lineHeight: 1.65, mt: 1.25, opacity: 0.95 }}>
          {SUGGEST_TEXT}
        </Typography>
        <Button
          href={CONTACT_URL}
          rel="noopener noreferrer"
          startIcon={<MailOutlinedIcon />}
          sx={{
            bgcolor: "primary.contrastText",
            color: "primary.main",
            mt: 2.5,
            "&:hover": { bgcolor: "primary.contrastText", opacity: 0.92 },
          }}
          target="_blank"
          variant="contained"
        >
          Suggest a tool
        </Button>
      </Reveal>
    </HomeSection>
  );
}
