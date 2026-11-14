import { Box, Chip, Typography } from "@mui/material";
import type { ReactElement, ReactNode } from "react";
import { NextLink } from "@/components/ui/next-link";

export interface ChipLink {
  href: string;
  /** An icon element; the chip styles it, so it must be an element and not text. */
  icon: ReactElement;
  label: string;
}

interface LinkChipRowProps {
  /** The label before the links. */
  heading: string;
  /** The heading's id, unique on the page. */
  headingId: string;
  links: readonly ChipLink[];
}

/**
 * A single quiet line of links: a small label, then a rounded pill for each link with its icon.
 * It replaces a row of cards so the main content of the page stays the focus. Renders nothing
 * when there are no links.
 */
export function LinkChipRow({ heading, headingId, links }: LinkChipRowProps): ReactNode {
  if (links.length === 0) {
    return null;
  }

  return (
    <Box
      aria-labelledby={headingId}
      component="nav"
      sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1.25, pt: 1 }}
    >
      <Typography
        color="text.secondary"
        component="h2"
        id={headingId}
        sx={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.01em", mr: 0.5 }}
      >
        {heading}
      </Typography>
      <Box component="ul" sx={{ display: "contents", listStyle: "none", m: 0, p: 0 }}>
        {links.map((link) => (
          <Box component="li" key={link.href} sx={{ display: "inline-flex" }}>
            <Chip
              clickable
              component={NextLink}
              href={link.href}
              icon={link.icon}
              label={link.label}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "999px",
                height: 38,
                px: 0.5,
                transition: "border-color 150ms ease, background-color 150ms ease",
                "& .MuiChip-icon": { color: "primary.main" },
                "&:hover, &:focus-visible": { bgcolor: "action.hover", borderColor: "primary.main" },
              }}
              variant="outlined"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
