import { Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

const VISUALLY_HIDDEN_SX = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;

/**
 * An h2 that screen readers and search engines see but sighted users do not, used where the
 * visual design omits a section title but the heading outline (h1, h2, h3) must stay unbroken.
 */
export function HiddenHeading({ children }: PropsWithChildren): ReactNode {
  return (
    <Typography component="h2" sx={VISUALLY_HIDDEN_SX}>
      {children}
    </Typography>
  );
}
