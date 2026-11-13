import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Button, Container, Stack, Typography } from "@mui/material";
import { NextLink } from "@/components/ui/next-link";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";

/**
 * Renders the global not-found state with a route back into the catalog.
 */
export default function NotFound(): ReactNode {
  return (
    <PageFrame>
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Stack sx={{ alignItems: "center", gap: 2 }}>
          <SearchOffIcon aria-hidden="true" color="primary" sx={{ fontSize: 56 }} />
          <Typography component="h1" variant="h4">
            Page not found
          </Typography>
          <Typography color="text.secondary">
            We don&apos;t have a tool at that address. Search for what you need, or browse by category.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, mt: 1 }}>
            <Button component={NextLink} href="/categories" variant="contained">
              Browse categories
            </Button>
            <Button component={NextLink} href="/" variant="outlined">
              Back to home
            </Button>
          </Stack>
        </Stack>
      </Container>
    </PageFrame>
  );
}
