import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

const PLATFORM_PILLARS = ["Fast", "Private", "No signup", "Free"] as const;

/**
 * Renders the temporary product foundation page used during Phase 0.
 */
export default function HomePage(): ReactNode {
  return (
    <Box component="main" sx={{ display: "grid", minHeight: "100vh", placeItems: "center", py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography component="p" color="primary" sx={{ fontWeight: 700, letterSpacing: "0.12em" }}>
            A WISEMEN SOFT PRODUCT
          </Typography>
          <Typography component="h1" variant="h2" sx={{ maxWidth: 760 }}>
            Everything you need. One toolbox.
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, maxWidth: 620 }}
          >
            The TypeScript and Material UI foundation is ready. Product branding and the first
            evidence-backed tool category come next.
          </Typography>
          <Stack
            direction="row"
            useFlexGap
            sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
          >
            {PLATFORM_PILLARS.map((pillar) => (
              <Chip key={pillar} label={pillar} variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
