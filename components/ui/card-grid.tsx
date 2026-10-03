import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

/**
 * Named column layouts for card grids. Pages and their loading skeletons reference the same
 * preset, so a loading state can never drift from the page it stands in for.
 */
export const CARD_GRID_COLUMNS = {
  tools: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  catalog: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
  categories: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" },
  related: { xs: "1fr", md: "repeat(3, 1fr)" },
} as const;

export type CardGridPreset = keyof typeof CARD_GRID_COLUMNS;

const CARD_GRID_GAP = 2.5;

interface CardGridProps extends PropsWithChildren {
  /** Accessible name; when given the grid becomes a labelled section landmark. */
  label?: string;
  preset: CardGridPreset;
}

/**
 * Lays out cards on the shared responsive grid with consistent spacing.
 */
export function CardGrid({ children, label, preset }: CardGridProps): ReactNode {
  return (
    <Box
      aria-label={label}
      component={label ? "section" : "div"}
      sx={{
        display: "grid",
        gap: CARD_GRID_GAP,
        gridTemplateColumns: CARD_GRID_COLUMNS[preset],
      }}
    >
      {children}
    </Box>
  );
}
