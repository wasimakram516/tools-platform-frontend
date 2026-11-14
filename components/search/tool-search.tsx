"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useState } from "react";
import { NextLink } from "@/components/ui/next-link";
import { ToolIcon } from "@/components/ui/tool-icon";
import { searchGuides, type SearchableGuide } from "@/lib/guides/guide-search";
import { getFeaturedTools, getToolCategoryById, getTools } from "@/lib/tools/tool-registry";
import { searchToolsDetailed } from "@/lib/tools/tool-search";
import { SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";

const MAX_QUERY_LENGTH = 80;
const PILL_HEIGHT = 56;
const RESULTS_GAP = 1;
const VISUALLY_HIDDEN = { border: 0, clip: "rect(0 0 0 0)", height: 1, m: -0.125, overflow: "hidden", position: "absolute", width: 1 } as const;

/** The colours of the small text, which depends on what the search box sits on. */
const TONES = {
  onDark: { heading: "#c9ddd3", message: "#f2f8f5", shadow: "0 6px 18px -8px rgba(0, 0, 0, 0.4)" },
  onLight: { heading: "text.secondary", message: "text.primary", shadow: "0 4px 14px -8px rgba(20, 33, 28, 0.35)" },
} as const;

export interface ToolSearchProps {
  /** Move the cursor into the box when it appears. */
  autoFocus?: boolean;
  /** Clear the typed text when Escape is pressed. For a box that does not sit in a dialog. */
  clearOnEscape?: boolean;
  /** A small key hint shown while the box is empty, such as "/" or "Esc". */
  hint?: string;
  /**
   * Guides to search as well. Matching guides are listed after the tools. They come from the
   * page, which builds them on the server, so the guides themselves never reach the browser.
   */
  guides?: readonly SearchableGuide[];
  /** Used to make every element id on the page unique. */
  idPrefix: string;
  /**
   * How the results are laid out. "flow" lists them beneath the box and always shows them, as in
   * the floating dialog. "dropdown" floats them over the page, only while the box has focus, so
   * the content around it does not move.
   */
  layout: "dropdown" | "flow";
  /** The id of the text box itself, so something else can focus it. */
  inputId?: string;
  /** The name of the box, read by assistive technology. */
  label: string;
  /** Called after a result is chosen, such as to close a dialog around the box. */
  onNavigate?: () => void;
  placeholder: string;
  /** Show the popular tools while nothing has been typed. Otherwise nothing shows until then. */
  showPopularWhenEmpty: boolean;
  tone: keyof typeof TONES;
}

/**
 * Looks up the name of a tool's category for the search ranking.
 */
function categoryNameFor(categoryId: string): string {
  return getToolCategoryById(categoryId)?.name ?? "";
}

/** One row in the results: a tool or a guide. */
interface ResultItem {
  description: string;
  href: string;
  icon: ReactNode;
  id: string;
  /** Read before the name by assistive technology, such as "Guide". */
  kind?: string;
  name: string;
}

/**
 * Says how many tools and guides the search found, for screen reader users.
 */
function resultSummary(toolCount: number, guideCount: number): string {
  const tools = `${toolCount} ${toolCount === 1 ? "tool" : "tools"}`;

  return guideCount === 0 ? `${tools} found.` : `${tools} and ${guideCount} ${guideCount === 1 ? "guide" : "guides"} found.`;
}

/**
 * The tool search, used in the header's floating search and in the box on the home page, so
 * both behave the same way. It is a pill-shaped box with matching tools listed beneath it as
 * rows, which can be clicked or chosen with the arrow keys and Enter. It understands tool names
 * and plain descriptions of the job, such as "shrink an image". Guides that fit the search are
 * listed after the tools.
 */
export function ToolSearch({
  autoFocus = false,
  clearOnEscape = false,
  guides = [],
  hint,
  idPrefix,
  inputId,
  label,
  layout,
  onNavigate,
  placeholder,
  showPopularWhenEmpty,
  tone,
}: ToolSearchProps): ReactNode {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const isSearching = query.trim().length > 0;
  const available = getTools().filter((tool) => tool.status === "available");
  const { approximate, tools: found } = searchToolsDetailed(available, query, categoryNameFor);
  // A dropdown shows only while the box, or something inside it, has focus.
  const isOpen = layout === "flow" || focused;
  const wantsList = isSearching || showPopularWhenEmpty;
  const foundGuides = isSearching ? searchGuides(guides, query) : [];
  const shownTools = isOpen && wantsList ? (isSearching ? found : getFeaturedTools()) : [];
  const shownGuides = isOpen ? foundGuides : [];
  const toolItems: ResultItem[] = shownTools.map((tool) => ({
    description: tool.shortDescription,
    href: `/tools/${tool.slug}`,
    icon: <ToolIcon name={tool.icon} sx={{ color: "primary.main", flexShrink: 0 }} />,
    id: `${idPrefix}-${tool.id}`,
    name: tool.name,
  }));
  const guideItems: ResultItem[] = shownGuides.map((guide) => ({
    description: guide.description,
    href: guide.href,
    icon: <MenuBookOutlinedIcon sx={{ color: "primary.main", flexShrink: 0 }} />,
    id: `${idPrefix}-guide-${guide.href.split("/").at(-1) ?? ""}`,
    kind: "Guide",
    name: guide.name,
  }));
  const items = [...toolItems, ...guideItems];
  const listId = `${idPrefix}-results`;
  const activeId = items[activeIndex]?.id;
  const colours = TONES[tone];

  /**
   * Puts the cursor in the box once it has mounted. A dialog is shown in a portal that mounts
   * after this component, and focus set during the first render does not stay there.
   */
  const focusInput = useCallback(
    (input: HTMLInputElement | null): void => {
      if (input && autoFocus) {
        window.setTimeout(() => input.focus(), 0);
      }
    },
    [autoFocus],
  );

  /**
   * Updates the search text and goes back to the first result.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    setActiveIndex(0);
  }

  /**
   * Moves through the results with the arrow keys, opens the chosen one with Enter, and clears
   * the text with Escape when the box asks for that.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape" && clearOnEscape) {
      event.preventDefault();

      if (query !== "") {
        setQuery("");
      } else {
        // Nothing left to clear, so close the dropdown by leaving the box.
        (event.target as HTMLElement).blur();
      }

      return;
    }

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
        router.push(chosen.href);
        onNavigate?.();
      }
    }
  }

  return (
    <Box
      onBlur={(event) => {
        // Focus moving to a result inside the box is not leaving it.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      onFocus={() => setFocused(true)}
      sx={{ display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}
    >
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 999,
          boxShadow: tone === "onDark" ? "0 16px 40px -12px rgba(0, 0, 0, 0.45)" : "0 10px 30px -14px rgba(20, 33, 28, 0.35)",
          display: "flex",
          flexShrink: 0,
          gap: 1.25,
          height: PILL_HEIGHT,
          px: 2.5,
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <SearchIcon aria-hidden="true" sx={{ color: "primary.main" }} />
        <InputBase
          fullWidth
          id={inputId}
          inputProps={{
            "aria-activedescendant": activeId,
            "aria-autocomplete": "list",
            "aria-controls": items.length > 0 ? listId : undefined,
            "aria-expanded": items.length > 0,
            "aria-label": label,
            autoComplete: "off",
            maxLength: MAX_QUERY_LENGTH,
            role: "combobox",
            sx: { "&::placeholder": { textOverflow: "ellipsis" } },
          }}
          inputRef={focusInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          sx={{ fontSize: "1.02rem" }}
          value={query}
        />
        {query ? (
          <IconButton aria-label="Clear search" edge="end" onClick={() => setQuery("")} size="small">
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : hint ? (
          <Typography
            aria-hidden="true"
            color="text.secondary"
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, display: { xs: "none", sm: "block" }, fontSize: "0.72rem", px: 0.75, py: 0.25 }}
          >
            {hint}
          </Typography>
        ) : null}
      </Box>

      <Typography aria-live="polite" role="status" sx={VISUALLY_HIDDEN}>
        {isSearching ? resultSummary(found.length, foundGuides.length) : ""}
      </Typography>

      {isOpen && wantsList ? (
        <Box
          sx={
            layout === "dropdown"
              ? {
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: SURFACE_RADIUS,
                  boxShadow: SURFACE_SHADOW,
                  insetInline: 0,
                  maxHeight: "min(60vh, 460px)",
                  overflowX: "hidden",
                  overflowY: "auto",
                  p: 1,
                  position: "absolute",
                  top: PILL_HEIGHT + 8,
                  zIndex: 20,
                }
              : { minHeight: 0, overflowX: "hidden", overflowY: "auto", pb: 2, pt: 1.5, px: 0.5 }
          }
        >
          {items.length === 0 ? (
            <Typography sx={{ color: colours.message, px: 2, py: 1 }}>
              No tools match this search. Try describing the job in a few words, like &quot;compress an image&quot;.
            </Typography>
          ) : (
            <Box
              aria-label={guideItems.length > 0 ? "Tools and guides" : "Tools"}
              component="ul"
              id={listId}
              role="listbox"
              sx={{ display: "grid", gap: RESULTS_GAP, gridTemplateColumns: "minmax(0, 1fr)", listStyle: "none", m: 0, p: 0 }}
            >
              {[
                { heading: !isSearching ? "Popular tools" : approximate ? "Closest matches" : "Tools", rows: toolItems, start: 0 },
                { heading: "Guides", rows: guideItems, start: toolItems.length },
              ]
                .filter((group) => group.rows.length > 0)
                .flatMap((group) => [
                  <Box aria-hidden="true" component="li" key={`heading-${group.heading}`} role="presentation" sx={{ pt: group.start > 0 ? 1.5 : 0 }}>
                    <Typography
                      sx={{ color: colours.heading, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", pb: 0.5, px: 2, textTransform: "uppercase" }}
                    >
                      {group.heading}
                    </Typography>
                  </Box>,
                  ...group.rows.map((item, offset) => (
                    <SearchResultRow
                      active={group.start + offset === activeIndex}
                      item={item}
                      key={item.id}
                      layout={layout}
                      onHover={() => setActiveIndex(group.start + offset)}
                      onNavigate={onNavigate}
                      tone={tone}
                    />
                  )),
                ])}
            </Box>
          )}
        </Box>
      ) : null}
    </Box>
  );
}

interface SearchResultRowProps {
  active: boolean;
  item: ResultItem;
  layout: ToolSearchProps["layout"];
  onHover: () => void;
  onNavigate?: () => void;
  tone: ToolSearchProps["tone"];
}

/**
 * One result: an icon, the name, a one line description, and an arrow. In a dropdown the active
 * row is shaded; in the floating dialog each row is a card and the active one is outlined.
 */
function SearchResultRow({ active, item, layout, onHover, onNavigate, tone }: SearchResultRowProps): ReactNode {
  return (
    <Box component="li" role="presentation" sx={{ minWidth: 0 }}>
      <Box
        aria-selected={active}
        component={NextLink}
        href={item.href}
        id={item.id}
        onClick={onNavigate}
        onMouseEnter={onHover}
        role="option"
        sx={{
          alignItems: "center",
          bgcolor: layout === "dropdown" ? (active ? "action.hover" : "transparent") : "background.paper",
          border: "1px solid",
          borderColor: layout === "dropdown" ? "transparent" : active ? "primary.main" : "divider",
          borderRadius: SURFACE_RADIUS,
          boxShadow: layout === "dropdown" ? "none" : active ? SURFACE_SHADOW : TONES[tone].shadow,
          color: "text.primary",
          display: "flex",
          gap: 1.5,
          px: 2,
          py: 1.25,
          textDecoration: "none",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
        }}
      >
        {item.icon}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {item.kind ? (
              <>
                <Box component="span" sx={VISUALLY_HIDDEN}>{`${item.kind}:`}</Box>{" "}
              </>
            ) : null}
            {item.name}
          </Typography>
          <Typography color="text.secondary" noWrap sx={{ fontSize: "0.85rem" }}>
            {item.description}
          </Typography>
        </Box>
        <ArrowForwardIcon aria-hidden="true" fontSize="small" sx={{ color: active ? "primary.main" : "text.secondary", flexShrink: 0 }} />
      </Box>
    </Box>
  );
}
