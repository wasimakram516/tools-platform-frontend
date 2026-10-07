import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToolBrowser, type BrowsableCategory } from "@/components/home/tool-browser";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { NextLink } from "@/components/ui/next-link";
import { buildPageMetadata, SITE_DESCRIPTION, websiteJsonLd } from "@/lib/seo";
import { BRAND_DESCRIPTOR, BRAND_TAGLINE_BEATS } from "@/lib/site-config";
import { getAvailableToolCategories, getToolsByCategory } from "@/lib/tools/tool-registry";

/**
 * Lists the categories and tools a visitor can use today, ready for the search box to filter.
 */
function browsableCategories(): BrowsableCategory[] {
  return getAvailableToolCategories()
    .map((category) => ({
      category,
      tools: getToolsByCategory(category.id).filter((tool) => tool.status === "available"),
    }))
    .filter((entry) => entry.tools.length > 0);
}

/**
 * Builds the page description from the registry, so it names the tools that exist today.
 */
export function generateMetadata(): Metadata {
  const categories = browsableCategories();
  const categoryNames = categories.map((entry) => entry.category.name.toLowerCase()).join(" and ");
  const toolNames = categories.flatMap((entry) => entry.tools.map((tool) => tool.name)).slice(0, 6);

  return buildPageMetadata({
    description: `${SITE_DESCRIPTION} Includes ${categoryNames}, such as the ${toolNames.join(", ")}.`,
    path: "/",
  });
}

/**
 * Renders the product entry point: a short promise, a search box, and every category's tools.
 */
export default function HomePage(): ReactNode {
  const [firstBeat, secondBeat] = BRAND_TAGLINE_BEATS;
  const categories = browsableCategories();

  return (
    <PageFrame>
      <JsonLd data={websiteJsonLd()} />
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 5 }, pt: { xs: 7, md: 11 }, textAlign: "center" }}>
        <Typography component="h1" variant="h1" sx={{ mx: "auto", maxWidth: 1100, whiteSpace: { md: "nowrap" } }}>
          {firstBeat}{" "}
          <Box component="span" sx={{ color: "primary.main", display: { xs: "block", md: "inline" } }}>
            {secondBeat}
          </Box>
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: { xs: "1.05rem", md: "1.2rem" },
            lineHeight: 1.65,
            mt: 2.5,
            mx: "auto",
            maxWidth: 580,
          }}
        >
          {BRAND_DESCRIPTOR} Free to use, no signup, and every tool shows how it handles your data.
        </Typography>
      </Container>

      <Container
        aria-label="Available tools"
        component="section"
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 8 } }}
      >
        <HiddenHeading>Available tools</HiddenHeading>
        <ToolBrowser categories={categories} />
      </Container>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Container
          aria-labelledby="home-coming-soon"
          component="section"
          maxWidth="lg"
          sx={{ py: { xs: 5, md: 7 }, textAlign: "center" }}
        >
          <Typography component="h2" id="home-coming-soon" variant="h5">
            More categories are on the way
          </Typography>
          <Button component={NextLink} endIcon={<ArrowForwardIcon />} href="/categories" sx={{ mt: 2 }}>
            Browse every category
          </Button>
        </Container>
      </Box>
    </PageFrame>
  );
}
