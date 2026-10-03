import ConstructionIcon from "@mui/icons-material/Construction";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ColorModeToggle } from "@/components/ui/color-mode-toggle";
import { NextLink } from "@/components/ui/next-link";
import type { ReactNode } from "react";

/**
 * Renders the temporary product navigation used until final branding is selected.
 */
export function SiteHeader(): ReactNode {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: "appBar",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", minHeight: 68 }}
        >
          <Stack
            aria-label="Tools Platform home"
            component={NextLink}
            direction="row"
            href="/"
            sx={{ alignItems: "center", color: "inherit", gap: 1.25, textDecoration: "none" }}
          >
            <Box
              aria-hidden="true"
              sx={{
                alignItems: "center",
                bgcolor: "primary.main",
                borderRadius: 2.5,
                color: "primary.contrastText",
                display: "inline-flex",
                height: 36,
                justifyContent: "center",
                width: 36,
              }}
            >
              <ConstructionIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.02rem", fontWeight: 750, lineHeight: 1.15 }}>
                Tools Platform
              </Typography>
            </Box>
          </Stack>
          <Stack component="nav" aria-label="Primary" direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
            <Button
              color="inherit"
              component={NextLink}
              href="/categories"
              startIcon={<GridViewOutlinedIcon />}
            >
              Categories
            </Button>
            <ColorModeToggle />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
