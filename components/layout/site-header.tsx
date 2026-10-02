import { Box, Container, Link, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Renders the temporary product navigation used until final branding is selected.
 */
export function SiteHeader(): ReactNode {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: "rgba(247, 249, 252, 0.92)",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "relative",
        zIndex: 2,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 72,
          }}
        >
          <Link
            href="/"
            color="inherit"
            underline="none"
            sx={{ alignItems: "center", display: "inline-flex", gap: 1.25 }}
          >
            <Box
              aria-hidden="true"
              sx={{
                bgcolor: "text.primary",
                color: "common.white",
                display: "grid",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.8rem",
                fontWeight: 700,
                height: 34,
                placeItems: "center",
                width: 34,
              }}
            >
              T/
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.96rem", fontWeight: 750, lineHeight: 1.1 }}>
                Tools Platform
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.2 }}>
                A Wisemen Soft product
              </Typography>
            </Box>
          </Link>

          <Link
            href="/categories/developer-tools"
            color="text.primary"
            underline="hover"
            sx={{ fontSize: "0.88rem", fontWeight: 650 }}
          >
            Developer tools
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
