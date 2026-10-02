import { Box, LinearProgress } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Renders an accessible route-level loading indicator.
 */
export default function Loading(): ReactNode {
  return (
    <Box role="status" aria-label="Loading page" sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  );
}
