import { Box, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Renders the compact product footer.
 */
export function SiteFooter(): ReactNode {
  return (
    <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: 3.5 }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ gap: 1, justifyContent: "space-between" }}
        >
          <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            Fast utility tools, built around the job.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            Inputs stay on your device unless a tool says otherwise.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

