import { Box } from "@mui/material";
import type { ReactNode } from "react";

const DEFAULT_SIZE = 34;

interface BrandMarkProps {
  size?: number;
}

/**
 * The QuicklySorted mark: a tick followed by a full stop, echoing "Get it quick. Get it sorted."
 * Drawn inline so it follows the theme's primary colour in both light and dark mode. The static
 * files in public/brand use the same geometry for places that cannot use React.
 */
export function BrandMark({ size = DEFAULT_SIZE }: BrandMarkProps): ReactNode {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      height={size}
      sx={{ color: "primary.main", display: "block", flexShrink: 0 }}
      viewBox="0 0 64 64"
      width={size}
    >
      <path
        d="M9 32 L22 45.5 L48 13.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={9.5}
      />
      <circle cx={53} cy={47.5} fill="currentColor" r={4.94} />
    </Box>
  );
}
