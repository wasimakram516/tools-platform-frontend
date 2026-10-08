import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { HomeSection } from "@/components/home/home-section";
import { Reveal } from "@/components/ui/reveal";
import { revealDelay } from "@/lib/reveal-delay";
import { REASONS, WHY_HEADING, type ReasonEntry } from "@/lib/home-content";

const REASON_ICONS: Readonly<Record<ReasonEntry["icon"], ReactNode>> = {
  browser: <ComputerOutlinedIcon />,
  clear: <VisibilityOutlinedIcon />,
  consistent: <DashboardCustomizeOutlinedIcon />,
  free: <CheckCircleOutlinedIcon />,
};

/**
 * Four plain reasons to use the site, each stating exactly what is true. It uses no cards, only
 * an icon and a short passage, so it adds substance without adding clutter.
 */
export function WhySection(): ReactNode {
  return (
    <HomeSection headingId="home-why-heading" tone="deep">
      <Typography component="h2" id="home-why-heading" sx={{ color: "var(--band-deep-text)" }} variant="h2">
        {WHY_HEADING}
      </Typography>
      <Box
        component="ul"
        sx={{
          display: "grid",
          gap: { xs: 3.5, md: 4 },
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          listStyle: "none",
          m: 0,
          mt: 4,
          p: 0,
        }}
      >
        {REASONS.map((reason, index) => (
          <Reveal as="li" delay={revealDelay(index)} key={reason.id}>
            <Box aria-hidden="true" sx={{ color: "var(--band-deep-accent)", display: "flex", mb: 1.25 }}>
              {REASON_ICONS[reason.icon]}
            </Box>
            <Typography component="h3" sx={{ color: "var(--band-deep-text)", fontSize: "1.1rem", fontWeight: 700 }}>
              {reason.title}
            </Typography>
            <Typography sx={{ color: "var(--band-deep-muted)", lineHeight: 1.65, mt: 0.75 }}>
              {reason.description}
            </Typography>
          </Reveal>
        ))}
      </Box>
    </HomeSection>
  );
}
