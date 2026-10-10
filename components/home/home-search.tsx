import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { ToolSearch } from "@/components/search/tool-search";

/** The id of the home page's search box, so the "/" key can find it and focus it. */
export const HOME_SEARCH_INPUT_ID = "home-search-input";

/**
 * The search box under the home page headline. It is the same search as the header's, so it
 * understands tool names and plain descriptions of a job. When the box is clicked into, a dropdown
 * floats over the page with the popular tools, and it narrows to matches as someone types.
 */
export function HomeSearch(): ReactNode {
  return (
    <Box
      className="rise-in"
      style={{ "--rise-delay": "260ms" } as CSSProperties}
      // The entrance animation makes this its own stacking layer, so it has to sit above the
      // sections after it, or the dropdown would slide underneath their cards.
      sx={{ maxWidth: 640, mt: { xs: 3.5, md: 4.5 }, mx: "auto", position: "relative", textAlign: "left", zIndex: 30 }}
    >
      <ToolSearch
        clearOnEscape
        hint="/"
        idPrefix="home-search"
        inputId={HOME_SEARCH_INPUT_ID}
        label="Search all tools"
        layout="dropdown"
        placeholder='What do you need to do? Try "shrink an image"'
        showPopularWhenEmpty
        tone="onLight"
      />
    </Box>
  );
}
