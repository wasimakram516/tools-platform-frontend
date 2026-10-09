import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { CardGrid } from "@/components/ui/card-grid";
import { CategoryTile } from "@/components/ui/category-tile";
import { NextLink } from "@/components/ui/next-link";
import { Reveal } from "@/components/ui/reveal";
import { ToolCard } from "@/components/ui/tool-card";
import { revealDelay } from "@/lib/reveal-delay";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

export interface BrowsableCategory {
  category: ToolCategory;
  tools: readonly ToolDefinition[];
}

interface ToolBrowserProps {
  categories: readonly BrowsableCategory[];
  /** The tools worth leading with. Shown as one short row, however many tools exist. */
  featuredTools: readonly ToolDefinition[];
}

/**
 * The homepage's way into the tools: a short row of popular tools and one compact tile for each
 * category. The page stays short and tidy as the catalogue grows, because each category costs
 * one small tile. Searching lives in the header, so it is available on every page.
 */
export function ToolBrowser({ categories, featuredTools }: ToolBrowserProps): ReactNode {
  return (
    <Stack sx={{ gap: { xs: 5, md: 7 } }}>
      {featuredTools.length > 0 ? (
        <Box aria-labelledby="home-popular-heading" component="section">
          <Typography component="h2" id="home-popular-heading" sx={{ mb: 2.5 }} variant="h4">
            Popular tools
          </Typography>
          <CardGrid preset="tools">
            {featuredTools.map((tool, index) => (
              <Reveal delay={revealDelay(index % 3)} key={tool.id} sx={{ display: "grid" }}>
                <ToolCard tool={tool} />
              </Reveal>
            ))}
          </CardGrid>
        </Box>
      ) : null}

      <Box aria-labelledby="home-categories-heading" component="section">
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 2, justifyContent: "space-between", mb: 2.5 }}>
          <Typography component="h2" id="home-categories-heading" variant="h4">
            Browse by category
          </Typography>
          <Button component={NextLink} endIcon={<ArrowForwardIcon />} href="/categories" size="small">
            All categories
          </Button>
        </Stack>
        <CardGrid preset="categories">
          {categories.map(({ category, tools }, index) => (
            <Reveal delay={revealDelay(index % 4)} key={category.id} sx={{ display: "grid" }}>
              <CategoryTile category={category} toolCount={tools.length} />
            </Reveal>
          ))}
        </CardGrid>
      </Box>
    </Stack>
  );
}
