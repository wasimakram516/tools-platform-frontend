import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { ColorModeToggle } from "@/components/ui/color-mode-toggle";
import { NextLink } from "@/components/ui/next-link";
import { BRAND_NAME } from "@/lib/site-config";
import type { ReactNode } from "react";

/**
 * Renders the site header: brand mark and wordmark, then primary navigation and the theme toggle.
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
            aria-label={`${BRAND_NAME} home`}
            component={NextLink}
            direction="row"
            href="/"
            sx={{ alignItems: "center", color: "inherit", gap: 1.25, textDecoration: "none" }}
          >
            <BrandLockup />
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
