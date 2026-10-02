import { Box, Container, Skeleton, Stack } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Renders the shared loading shape for category and tool routes.
 */
export function ToolPageLoading(): ReactNode {
  return (
    <Container component="main" maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={2.5}>
        <Skeleton height={18} width={180} />
        <Skeleton height={64} width="min(580px, 90%)" />
        <Skeleton height={24} width="min(720px, 100%)" />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            pt: 2,
          }}
        >
          <Skeleton height={260} variant="rounded" />
          <Skeleton height={480} variant="rounded" />
        </Box>
      </Stack>
    </Container>
  );
}

