import { Box } from "@mui/material";
import type { ReactNode } from "react";

const LOGO_WIDTH = 176;
const LOGO_HEIGHT = 35;
const DARK_SCHEME_SELECTOR = "[data-dark] &";

const logoSx = { height: LOGO_HEIGHT, width: LOGO_WIDTH } as const;

/**
 * Renders the Wisemen Soft wordmark in the variant that suits the active colour scheme
 * (MUI marks the document with a bare data-dark or data-light attribute):
 * dark text on the light theme, the light-on-dark pill on the dark theme.
 */
export function WisemenSoftLogo(): ReactNode {
  return (
    <>
      <Box
        alt="Wisemen Soft"
        component="img"
        height={LOGO_HEIGHT}
        src="/brand/wisemen-soft-logo-light.svg"
        sx={{ ...logoSx, display: "block", [DARK_SCHEME_SELECTOR]: { display: "none" } }}
        width={LOGO_WIDTH}
      />
      <Box
        alt="Wisemen Soft"
        component="img"
        height={LOGO_HEIGHT}
        src="/brand/wisemen-soft-logo-dark.svg"
        sx={{ ...logoSx, display: "none", [DARK_SCHEME_SELECTOR]: { display: "block" } }}
        width={LOGO_WIDTH}
      />
    </>
  );
}
