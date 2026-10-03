"use client";

import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Presents a safe route-level error and allows the user to retry rendering.
 */
export default function ErrorPage({ reset }: ErrorPageProps): ReactNode {
  return (
    <Box component="main" sx={{ display: "grid", minHeight: "100vh", placeItems: "center", p: 3 }}>
      <Alert severity="error">
        <Stack spacing={2}>
          <Typography component="h1" variant="h6">
            Something went wrong
          </Typography>
          <Typography>Please try again. If the problem continues, reload the page.</Typography>
          <Button onClick={reset} variant="contained">
            Try again
          </Button>
        </Stack>
      </Alert>
    </Box>
  );
}
