"use client";

import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface RouteErrorProps {
  reset: () => void;
}

/**
 * Renders a reusable route-level recovery state.
 */
export function RouteError({ reset }: RouteErrorProps): ReactNode {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 8, md: 14 } }}>
      <Alert severity="error" variant="outlined">
        <Stack spacing={2}>
          <Typography component="h1" variant="h5">
            This workspace could not load
          </Typography>
          <Typography>
            Try loading it again. Your tool input stays in this browser and was not uploaded.
          </Typography>
          <Button onClick={reset} variant="contained">
            Try again
          </Button>
        </Stack>
      </Alert>
    </Container>
  );
}

