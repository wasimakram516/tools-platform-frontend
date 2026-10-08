"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { CardGrid } from "@/components/ui/card-grid";
import { CategoryTile } from "@/components/ui/category-tile";
import { NextLink } from "@/components/ui/next-link";
import { Reveal } from "@/components/ui/reveal";
import { revealDelay } from "@/lib/reveal-delay";
import { ToolCard } from "@/components/ui/tool-card";
import { searchToolsDetailed } from "@/lib/tools/tool-search";
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
 * The homepage's way into the tools: a search box that filters live, and, when nothing is
 * typed, a short row of popular tools and one compact tile for each category. The page stays
 * short and tidy as the catalogue grows, because each category costs one small tile.
 */
export function ToolBrowser({ categories, featuredTools }: ToolBrowserProps): ReactNode {
  const [query, setQuery] = useState("");
  const allTools = categories.flatMap((entry) => entry.tools);
  const isSearching = query.trim().length > 0;
  const { approximate, tools: results } = searchToolsDetailed(
    allTools,
    query,
    (categoryId) => categories.find((entry) => entry.category.id === categoryId)?.category.name ?? "",
  );

  /**
   * Keeps the search text in step with the box.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
  }

  return (
    <Stack sx={{ gap: { xs: 5, md: 7 } }}>
      <Box sx={{ mx: "auto", maxWidth: 560, width: "100%" }}>
        <TextField
          fullWidth
          id="tool-search"
          label="Search tools"
          onChange={handleChange}
          placeholder="Try excel date, sha256, or make my image smaller"
          slotProps={{
            htmlInput: { autoComplete: "off", maxLength: 80 },
            input: {
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton aria-label="Clear search" edge="end" onClick={() => setQuery("")} size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-hidden="true" />
                </InputAdornment>
              ),
            },
            inputLabel: { shrink: true },
          }}
          value={query}
        />
      </Box>

      <Typography
        aria-live="polite"
        role="status"
        sx={{ border: 0, clip: "rect(0 0 0 0)", height: 1, m: -0.125, overflow: "hidden", position: "absolute", width: 1 }}
      >
        {isSearching ? `${results.length} ${results.length === 1 ? "tool" : "tools"} found.` : ""}
      </Typography>

      {isSearching ? (
        results.length > 0 ? (
          <Stack sx={{ gap: 2 }}>
            {approximate ? (
              <Typography color="text.secondary" role="note">
                No tool matches every word, so these are the closest matches.
              </Typography>
            ) : null}
            <CardGrid label="Search results" preset="tools">
              {results.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </CardGrid>
          </Stack>
        ) : (
          <Stack sx={{ alignItems: "center", gap: 1 }}>
            <Typography color="text.secondary" role="status">
              No tools match this search. Try describing the job, like "compress an image".
            </Typography>
            <Button onClick={() => setQuery("")} size="small">
              Show all tools
            </Button>
          </Stack>
        )
      ) : (
        <>
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
            <Stack
              direction="row"
              sx={{ alignItems: "baseline", gap: 2, justifyContent: "space-between", mb: 2.5 }}
            >
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
        </>
      )}
    </Stack>
  );
}
