import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Renders the global not-found state.
 */
export default function NotFound(): ReactNode {
  return (
    <Box component="main" sx={{ display: "grid", minHeight: "100vh", placeItems: "center", p: 3 }}>
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography component="p" color="primary" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography component="h1" variant="h4" gutterBottom>
          Tool not found
        </Typography>
        <Typography color="text.secondary">
          This tool may have moved or may not be part of the approved catalog yet.
        </Typography>
      </Container>
    </Box>
  );
}
