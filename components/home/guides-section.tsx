import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Box, Link, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { HomeSection } from "@/components/home/home-section";
import { NextLink } from "@/components/ui/next-link";
import { getGuides, guidePath } from "@/lib/guides/guides";
import { SURFACE_RADIUS } from "@/theme/surface";

/**
 * Links to every guide from the home page, so readers can find them and search engines see them
 * as a main part of the site, not only through the footer.
 */
export function GuidesSection(): ReactNode {
  return (
    <HomeSection headingId="home-guides-heading">
      <Stack sx={{ alignItems: { sm: "flex-end" }, flexDirection: { sm: "row", xs: "column" }, gap: 2, justifyContent: "space-between" }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography component="h2" id="home-guides-heading" variant="h2">
            Guides
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.05rem", lineHeight: 1.65, mt: 1.5 }}>
            How things work, with tables, examples, and sources. Each guide links to the tool that does the job.
          </Typography>
        </Box>
        <Link component={NextLink} href="/guides" sx={{ alignItems: "center", display: "inline-flex", flexShrink: 0, fontWeight: 600, gap: 0.5 }} underline="hover">
          All guides
          <ArrowForwardIcon aria-hidden="true" fontSize="small" />
        </Link>
      </Stack>
      <Box
        component="ul"
        sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "repeat(3, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", xs: "minmax(0, 1fr)" }, listStyle: "none", m: 0, mt: 4, p: 0 }}
      >
        {getGuides().map((guide) => (
          <Box component="li" key={guide.slug} sx={{ display: "flex" }}>
            <Box
              component={NextLink}
              href={guidePath(guide)}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: SURFACE_RADIUS,
                color: "text.primary",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 2.5,
                textDecoration: "none",
                transition: "border-color 150ms ease",
                width: "100%",
                "&:hover, &:focus-visible": { borderColor: "primary.main" },
              }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <MenuBookOutlinedIcon aria-hidden="true" fontSize="small" sx={{ color: "primary.main" }} />
                <Typography component="h3" sx={{ fontWeight: 700 }}>
                  {guide.name}
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {guide.metaDescription}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </HomeSection>
  );
}
