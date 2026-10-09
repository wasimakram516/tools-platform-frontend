import { Box, Container, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { AboutSection } from "@/components/home/about-section";
import { FaqSection } from "@/components/home/faq-section";
import { ToolBrowser, type BrowsableCategory } from "@/components/home/tool-browser";
import { WhySection } from "@/components/home/why-section";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { HiddenHeading } from "@/components/ui/hidden-heading";
import { FAQ_ITEMS } from "@/lib/home-content";
import { buildPageMetadata, faqJsonLd, SITE_DESCRIPTION, websiteJsonLd } from "@/lib/seo";
import { BRAND_DESCRIPTOR, BRAND_TAGLINE_BEATS } from "@/lib/site-config";
import { getAvailableToolCategories, getFeaturedTools, getToolsByCategory } from "@/lib/tools/tool-registry";

/**
 * Lists the categories and tools a visitor can use today, for the popular row and category tiles.
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
  const categoryNames = categories.map((entry) => entry.category.name.toLowerCase()).join(", ");
  const toolNames = getFeaturedTools().map((tool) => tool.name);

  return buildPageMetadata({
    description: `${SITE_DESCRIPTION} Includes ${categoryNames}, such as the ${toolNames.join(", ")}.`,
    path: "/",
  });
}

/**
 * Renders the home page: what the site is, popular tools, one tile per category,
 * who it is for, why to use it, and the frequently asked questions. The page frame adds the
 * closing "suggest a tool" band.
 */
export default function HomePage(): ReactNode {
  const [firstBeat, secondBeat] = BRAND_TAGLINE_BEATS;
  const categories = browsableCategories();

  return (
    <PageFrame>
      <JsonLd data={[websiteJsonLd(), faqJsonLd(FAQ_ITEMS)]} />
      <Box
        sx={{ backgroundImage: "radial-gradient(60% 90% at 50% 0%, var(--hero-glow), transparent 75%)" }}
      >
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 5 }, pt: { xs: 7, md: 11 }, textAlign: "center" }}>
        <Typography className="rise-in" component="h1" variant="h1" sx={{ mx: "auto", maxWidth: 1100, whiteSpace: { md: "nowrap" } }}>
          {firstBeat}{" "}
          <Box component="span" sx={{ color: "primary.main", display: { xs: "block", md: "inline" } }}>
            {secondBeat}
          </Box>
        </Typography>
        <Typography
          className="rise-in"
          color="text.secondary"
          style={{ "--rise-delay": "140ms" } as CSSProperties}
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
      </Box>

      <Container
        aria-label="Find a tool"
        component="section"
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 9 } }}
      >
        <HiddenHeading>Find a tool</HiddenHeading>
        <ToolBrowser categories={categories} featuredTools={getFeaturedTools()} />
      </Container>

      <AboutSection />
      <WhySection />
      <FaqSection />
    </PageFrame>
  );
}
