import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { CardGrid } from "@/components/ui/card-grid";
import { NextLink } from "@/components/ui/next-link";
import { ToolCard } from "@/components/ui/tool-card";
import { ToolIcon } from "@/components/ui/tool-icon";
import { buildPageMetadata, SITE_DESCRIPTION, websiteJsonLd } from "@/lib/seo";
import { BRAND_DESCRIPTOR, BRAND_TAGLINE_BEATS } from "@/lib/site-config";
import { getToolCategories, getTools } from "@/lib/tools/tool-registry";

export const metadata: Metadata = buildPageMetadata({
  description: `${SITE_DESCRIPTION} Developer tools like a JSON formatter and JWT decoder, plus date and time calculators.`,
  path: "/",
});

/**
 * Renders the product entry point: a short promise followed directly by the tool grid.
 */
export default function HomePage(): ReactNode {
  const [firstBeat, secondBeat] = BRAND_TAGLINE_BEATS;
  const availableTools = getTools().filter((tool) => tool.status === "available");
  const plannedCategories = getToolCategories().filter((category) => category.status === "planned");

  return (
    <PageFrame>
      <JsonLd data={websiteJsonLd()} />
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 }, pt: { xs: 7, md: 11 }, textAlign: "center" }}>
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
          {BRAND_DESCRIPTOR} From developers to writers and everyone in between. No signup, no
          clutter.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: "0.85rem", fontWeight: 600, mt: 2 }}
        >
          Free to use. No signup. Every tool shows how it handles your data.
        </Typography>
      </Container>

      <Container
        aria-label="Available tools"
        component="section"
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 8 } }}
      >
        <HiddenHeading>Available tools</HiddenHeading>
        <CardGrid preset="tools">
          {availableTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </CardGrid>
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
          <Stack
            direction="row"
            useFlexGap
            sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center", mt: 3 }}
          >
            {plannedCategories.map((category) => (
              <Chip
                icon={<ToolIcon name={category.icon} />}
                key={category.id}
                label={category.name}
                variant="outlined"
              />
            ))}
          </Stack>
          <Button
            component={NextLink}
            endIcon={<ArrowForwardIcon />}
            href="/categories"
            sx={{ mt: 3 }}
          >
            Browse every category
          </Button>
        </Container>
      </Box>
    </PageFrame>
  );
}
