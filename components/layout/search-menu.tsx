"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputBase, Modal, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useState } from "react";
import { NextLink } from "@/components/ui/next-link";
import { ToolIcon } from "@/components/ui/tool-icon";
import { getFeaturedTools, getToolCategoryById, getTools } from "@/lib/tools/tool-registry";
import { searchToolsDetailed } from "@/lib/tools/tool-search";
import { SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";

const LISTBOX_ID = "site-search-results";
const MAX_QUERY_LENGTH = 80;
const PILL_HEIGHT = 56;
const PILL_MAX_WIDTH = 640;
/** The same gap from the top of the window that the floating header pill uses. */
const TOP_GAP = 10;
const RESULTS_GAP = 1;

interface SearchMenuProps {
  onClose: () => void;
}

/**
 * Looks up the name of a tool's category for the search ranking.
 */
function categoryNameFor(categoryId: string): string {
  return getToolCategoryById(categoryId)?.name ?? "";
}

/**
 * The search box: a floating pill, in the same place and shape as the header pill, over a
 * dimmed backdrop. Matching tools appear beneath it, each as its own row, as someone types.
 * They can be clicked or chosen with the arrow keys and Enter. It understands names and plain
 * descriptions of the job, such as "shrink an image". With nothing typed it offers the popular
 * tools.
 */
export function SearchMenu({ onClose }: SearchMenuProps): ReactNode {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isSearching = query.trim().length > 0;
  const available = getTools().filter((tool) => tool.status === "available");
  const { approximate, tools: found } = searchToolsDetailed(available, query, categoryNameFor);
  const items = isSearching ? found : getFeaturedTools();
  const activeId = items[activeIndex] ? `site-search-${items[activeIndex].id}` : undefined;

  /**
   * Puts the cursor in the box once the dialog has mounted. The dialog is shown in a portal that
   * mounts after this component, and focus set during the first render does not stay there.
   */
  const focusInput = useCallback((input: HTMLInputElement | null): void => {
    if (input) {
      window.setTimeout(() => input.focus(), 0);
    }
  }, []);

  /**
   * Updates the search text and goes back to the first result.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    setActiveIndex(0);
  }

  /**
   * Moves through the results with the arrow keys and opens the chosen one with Enter.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (items.length === 0) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length);
    } else if (event.key === "Enter") {
      const chosen = items[activeIndex];

      if (chosen) {
        event.preventDefault();
        router.push(`/tools/${chosen.slug}`);
        onClose();
      }
    }
  }

  return (
    <Modal
      // The input takes focus itself; letting the modal focus its own frame would steal it.
      disableAutoFocus
      onClose={onClose}
      open
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(6px)", bgcolor: "rgba(8, 22, 16, 0.5)" } } }}
    >
      <Box
        aria-label="Search tools"
        role="dialog"
        sx={{
          display: "flex",
          flexDirection: "column",
          insetInline: 0,
          marginInline: "auto",
          maxHeight: `calc(100vh - ${TOP_GAP * 2}px)`,
          outline: "none",
          position: "fixed",
          top: TOP_GAP,
          width: `min(92vw, ${PILL_MAX_WIDTH}px)`,
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 999,
            boxShadow: "0 16px 40px -12px rgba(0, 0, 0, 0.45)",
            display: "flex",
            flexShrink: 0,
            gap: 1.25,
            height: PILL_HEIGHT,
            px: 2.5,
          }}
        >
          <SearchIcon aria-hidden="true" sx={{ color: "primary.main" }} />
          <InputBase
            fullWidth
            inputProps={{
              "aria-activedescendant": activeId,
              "aria-autocomplete": "list",
              "aria-controls": LISTBOX_ID,
              "aria-expanded": true,
              "aria-label": "Search tools",
              autoComplete: "off",
              maxLength: MAX_QUERY_LENGTH,
              role: "combobox",
              sx: { "&::placeholder": { textOverflow: "ellipsis" } },
            }}
            inputRef={focusInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder='Search, or describe the job, like "shrink an image"'
            sx={{ fontSize: "1.02rem" }}
            value={query}
          />
          {query ? (
            <IconButton aria-label="Clear search" edge="end" onClick={() => setQuery("")} size="small">
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : (
            <Typography
              aria-hidden="true"
              color="text.secondary"
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, display: { xs: "none", sm: "block" }, fontSize: "0.72rem", px: 0.75, py: 0.25 }}
            >
              Esc
            </Typography>
          )}
        </Box>

        <Typography
          aria-live="polite"
          role="status"
          sx={{ border: 0, clip: "rect(0 0 0 0)", height: 1, m: -0.125, overflow: "hidden", position: "absolute", width: 1 }}
        >
          {isSearching ? `${found.length} ${found.length === 1 ? "tool" : "tools"} found.` : ""}
        </Typography>

        <Box sx={{ minHeight: 0, overflowY: "auto", pb: 2, pt: 1.5, px: 0.5 }}>
          {isSearching && found.length === 0 ? (
            <Typography sx={{ color: "#f2f8f5", px: 2, py: 1 }}>
              No tools match this search. Try describing the job in a few words, like &quot;compress an image&quot;.
            </Typography>
          ) : (
            <>
              <Typography
                sx={{ color: "#c9ddd3", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", px: 2, pb: 1, textTransform: "uppercase" }}
              >
                {!isSearching ? "Popular tools" : approximate ? "Closest matches" : "Tools"}
              </Typography>
              <Box component="ul" id={LISTBOX_ID} role="listbox" aria-label="Tools" sx={{ display: "grid", gap: RESULTS_GAP, listStyle: "none", m: 0, p: 0 }}>
                {items.map((tool, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li key={tool.id} role="presentation">
                      <Box
                        aria-selected={isActive}
                        component={NextLink}
                        href={`/tools/${tool.slug}`}
                        id={`site-search-${tool.id}`}
                        onClick={onClose}
                        onMouseEnter={() => setActiveIndex(index)}
                        role="option"
                        sx={{
                          alignItems: "center",
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: isActive ? "primary.main" : "divider",
                          borderRadius: SURFACE_RADIUS,
                          boxShadow: isActive ? SURFACE_SHADOW : "0 6px 18px -8px rgba(0, 0, 0, 0.4)",
                          color: "text.primary",
                          display: "flex",
                          gap: 1.5,
                          px: 2,
                          py: 1.25,
                          textDecoration: "none",
                          transition: "border-color 120ms ease, box-shadow 120ms ease",
                        }}
                      >
                        <ToolIcon name={tool.icon} sx={{ color: "primary.main", flexShrink: 0 }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600 }}>{tool.name}</Typography>
                          <Typography color="text.secondary" noWrap sx={{ fontSize: "0.85rem" }}>
                            {tool.shortDescription}
                          </Typography>
                        </Box>
                        <ArrowForwardIcon
                          aria-hidden="true"
                          fontSize="small"
                          sx={{ color: isActive ? "primary.main" : "text.secondary", flexShrink: 0 }}
                        />
                      </Box>
                    </li>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
