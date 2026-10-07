"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { CardGrid, TOOLS_GRID_COLUMNS } from "@/components/ui/card-grid";
import { IconTile } from "@/components/ui/icon-tile";
import { NextLink } from "@/components/ui/next-link";
import { ToolCard } from "@/components/ui/tool-card";
import { searchTools } from "@/lib/tools/tool-search";
import type { ToolCategory, ToolDefinition } from "@/types/tool";

export interface BrowsableCategory {
  category: ToolCategory;
  tools: readonly ToolDefinition[];
}

interface ToolBrowserProps {
  categories: readonly BrowsableCategory[];
}

/**
 * The homepage's way into the tools: a search box that filters live, and, when nothing is
 * typed, every available category with a one-row preview of its tools. Search and the
 * "View all" link reach the rest, so the page stays short as the catalogue grows.
 */
export function ToolBrowser({ categories }: ToolBrowserProps): ReactNode {
  const [query, setQuery] = useState("");
  const allTools = categories.flatMap((entry) => entry.tools);
  const isSearching = query.trim().length > 0;
  const results = searchTools(
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
    <Stack sx={{ gap: { xs: 4, md: 5 } }}>
      <Box sx={{ mx: "auto", maxWidth: 560, width: "100%" }}>
        <TextField
          fullWidth
          id="tool-search"
          label="Search tools"
          onChange={handleChange}
          placeholder="Try excel date, json, or sha256"
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
          <CardGrid label="Search results" preset="tools">
            {results.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </CardGrid>
        ) : (
          <Stack sx={{ alignItems: "center", gap: 1 }}>
            <Typography color="text.secondary" role="status">
              No tools match this search. Try a shorter word.
            </Typography>
            <Button onClick={() => setQuery("")} size="small">
              Show all tools
            </Button>
          </Stack>
        )
      ) : (
        categories.map(({ category, tools }) => (
          <Box aria-labelledby={`home-${category.id}`} component="section" key={category.id}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 1.5, justifyContent: "space-between", mb: 2.5 }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                <IconTile icon={category.icon} size={40} />
                <Typography component="h2" id={`home-${category.id}`} variant="h5">
                  {category.name}
                </Typography>
              </Stack>
              <Button
                component={NextLink}
                endIcon={<ArrowForwardIcon />}
                href={`/categories/${category.slug}`}
                size="small"
              >
                {tools.length > TOOLS_GRID_COLUMNS ? `View all ${tools.length} tools` : "View all"}
              </Button>
            </Stack>
            <CardGrid preset="tools">
              {tools.slice(0, TOOLS_GRID_COLUMNS).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </CardGrid>
          </Box>
        ))
      )}
    </Stack>
  );
}
