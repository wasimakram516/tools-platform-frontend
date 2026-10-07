import { Box, CircularProgress } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface BusyOverlayProps extends PropsWithChildren {
  /** While true the content is dimmed and a spinner is shown over it. */
  busy: boolean;
  /** What is happening, announced to screen readers, for example "Updating the preview". */
  label: string;
}

/**
 * Wraps content that is being redone, so a change in settings fades the old result and shows a
 * spinner instead of swapping it suddenly. Screen readers are told the area is busy.
 */
export function BusyOverlay({ busy, children, label }: BusyOverlayProps): ReactNode {
  return (
    <Box aria-busy={busy} sx={{ position: "relative" }}>
      <Box sx={{ opacity: busy ? 0.35 : 1, transition: "opacity 150ms ease" }}>{children}</Box>
      {busy ? (
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            inset: 0,
            justifyContent: "center",
            pointerEvents: "none",
            position: "absolute",
          }}
        >
          <CircularProgress aria-label={label} />
        </Box>
      ) : null}
    </Box>
  );
}
