import { Box } from "@mui/material";
import type { ReactNode } from "react";

const DEFAULT_SIZE = 34;

interface BrandMarkProps {
  size?: number;
}

/**
 * The QuicklySorted mark: three rounded tool tiles and a tick that breaks out of the fourth slot,
 * for "a set of everyday tools, quick, and done". Drawn inline so it follows the theme's primary
 * colour in both light and dark mode. The static files in public/brand and the browser icons use
 * the same geometry; they are all generated from one script (see docs/DESIGN-LANGUAGE.md, section 10).
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
      <g fill="currentColor">
        <rect height={22} rx={7} width={22} x={4} y={6} />
        <rect height={22} rx={7} width={22} x={4} y={36} />
        <rect height={22} rx={7} width={22} x={34} y={36} />
      </g>
      <path
        d="M35.5 18 L43.5 26 L60 6.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={7.5}
      />
    </Box>
  );
}
