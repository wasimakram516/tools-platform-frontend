import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { formatCharacterCount } from "@/lib/tools/text-metrics";
import { FONT_HEADING } from "@/theme/typography";
import { SURFACE_RADIUS } from "@/theme/surface";

export interface Stat {
  label: string;
  /** Numbers get thousands separators; text, such as "2 min", is shown as given. */
  value: number | string;
}

interface StatGridProps {
  /** Show the first stat larger and across the full width, as the main answer. */
  featureFirst?: boolean;
  stats: readonly Stat[];
}

/**
 * A grid of labelled values, optionally with the first one given more weight. Changes are
 * announced politely to assistive technology.
 */
export function StatGrid({ featureFirst = true, stats }: StatGridProps): ReactNode {
  return (
    <Box
      aria-live="polite"
      component="dl"
      role="group"
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
        m: 0,
      }}
    >
      {stats.map((stat, index) => {
        const isFeatured = featureFirst && index === 0;

        return (
          <Box
            key={stat.label}
            sx={{
              border: "1px solid",
              borderColor: isFeatured ? "primary.main" : "divider",
              borderRadius: SURFACE_RADIUS,
              gridColumn: isFeatured ? "1 / -1" : undefined,
              p: 2,
            }}
          >
            <Typography color="text.secondary" component="dt" sx={{ fontSize: "0.85rem" }}>
              {stat.label}
            </Typography>
            <Typography
              component="dd"
              sx={{
                fontFamily: FONT_HEADING,
                fontSize: isFeatured ? "2.4rem" : "1.4rem",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
                lineHeight: 1.2,
                m: 0,
                mt: 0.5,
              }}
            >
              {typeof stat.value === "number" ? formatCharacterCount(stat.value) : stat.value}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
