"use client";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { MouseEvent, ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ColorModeToggle } from "@/components/ui/color-mode-toggle";
import { NextLink } from "@/components/ui/next-link";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { NavData, NavTool } from "@/lib/nav-data";
import { CONTROL_RADIUS, SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";

/** The search menu loads only when someone first opens it, so it adds nothing to a page load. */
const SearchMenu = lazy(() => import("@/components/layout/search-menu").then((module) => ({ default: module.SearchMenu })));

const ALL_TOOLS_MENU_ID = "all-tools-menu";
const POPULAR_MENU_ID = "popular-tools-menu";
const DRAWER_WIDTH = "min(88vw, 360px)";

/** The tool links shown in a list, in the mega menu and in the phone drawer alike. */
const toolLinkSx = {
  "&:hover": { bgcolor: "action.hover", color: "primary.main" },
  alignItems: "center",
  borderRadius: CONTROL_RADIUS,
  color: "text.primary",
  display: "flex",
  fontSize: "0.93rem",
  gap: 1.25,
  px: 1,
  py: 0.75,
  textDecoration: "none",
  transition: "background-color 150ms ease, color 150ms ease",
} as const;

/** Tells whether a key press happened while someone is typing, so shortcuts do not steal it. */
function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));
}

interface ToolLinkListProps {
  onNavigate: () => void;
  tools: readonly NavTool[];
}

/**
 * Tools as a list of links with their icons.
 */
function ToolLinkList({ onNavigate, tools }: ToolLinkListProps): ReactNode {
  return (
    <Box component="ul" sx={{ display: "grid", gap: 0.25, listStyle: "none", m: 0, p: 0 }}>
      {tools.map((tool) => (
        <li key={tool.href}>
          <Box component={NextLink} href={tool.href} onClick={onNavigate} sx={toolLinkSx}>
            <ToolIcon fontSize="small" name={tool.icon} sx={{ color: "primary.main" }} />
            {tool.label}
          </Box>
        </li>
      ))}
    </Box>
  );
}

interface SiteNavProps {
  data: NavData;
}

/**
 * The right-hand side of the header: a "Popular" menu, an "All tools" mega menu that groups every
 * tool by category, a search button that opens a menu under the header, and the theme toggle.
 * On a phone the menus fold into a drawer behind a menu button. Everything is built from the
 * tool registry, so it grows with the site.
 */
export function SiteNav({ data }: SiteNavProps): ReactNode {
  const [megaAnchor, setMegaAnchor] = useState<HTMLElement | null>(null);
  const [popularAnchor, setPopularAnchor] = useState<HTMLElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const megaOpen = megaAnchor !== null;
  const popularOpen = popularAnchor !== null;

  // "/" or Ctrl/Cmd+K opens the search from anywhere, unless someone is typing in a field.
  useEffect(() => {
    /**
     * Opens the search menu for the shortcut keys.
     */
    function handleKeyDown(event: KeyboardEvent): void {
      const isShortcut = (event.key === "/" && !isTypingTarget(event.target)) || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey));

      if (isShortcut) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**
   * Opens the mega menu below the whole header, so it can use the full width.
   */
  function handleMegaOpen(event: MouseEvent<HTMLElement>): void {
    setMegaAnchor(event.currentTarget.closest("header"));
  }

  /**
   * Closes whichever menu is open, such as after a link is chosen.
   */
  function closeMenus(): void {
    setMegaAnchor(null);
    setPopularAnchor(null);
    setDrawerOpen(false);
  }

  return (
    <>
      <Stack
        aria-label="Primary"
        component="nav"
        direction="row"
        sx={{ alignItems: "center", display: { xs: "none", md: "flex" }, gap: 0.5 }}
      >
        <Button
          aria-controls={popularOpen ? POPULAR_MENU_ID : undefined}
          aria-expanded={popularOpen}
          aria-haspopup="true"
          color="inherit"
          endIcon={<ExpandMoreIcon sx={{ transform: popularOpen ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />}
          onClick={(event) => setPopularAnchor(event.currentTarget)}
          startIcon={<LocalFireDepartmentOutlinedIcon />}
          sx={{ fontWeight: 600 }}
        >
          Popular
        </Button>
        <Button
          aria-controls={megaOpen ? ALL_TOOLS_MENU_ID : undefined}
          aria-expanded={megaOpen}
          aria-haspopup="true"
          color="inherit"
          endIcon={<ExpandMoreIcon sx={{ transform: megaOpen ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />}
          onClick={handleMegaOpen}
          startIcon={<GridViewOutlinedIcon />}
          sx={{ fontWeight: 600 }}
        >
          All tools
        </Button>
      </Stack>

      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Search tools (press /)">
          <IconButton aria-haspopup="dialog" aria-label="Search tools" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <ColorModeToggle />
        <IconButton aria-label="Open menu" onClick={() => setDrawerOpen(true)} sx={{ display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={popularAnchor}
        id={POPULAR_MENU_ID}
        onClose={closeMenus}
        open={popularOpen}
        slotProps={{ paper: { sx: { borderRadius: SURFACE_RADIUS, boxShadow: SURFACE_SHADOW, minWidth: 260, mt: 0.5 } } }}
      >
        {data.popular.map((tool) => (
          <MenuItem component={NextLink} href={tool.href} key={tool.href} onClick={closeMenus}>
            <ListItemIcon sx={{ color: "primary.main" }}>
              <ToolIcon fontSize="small" name={tool.icon} />
            </ListItemIcon>
            {tool.label}
          </MenuItem>
        ))}
      </Menu>

      <Popover
        anchorEl={megaAnchor}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        id={ALL_TOOLS_MENU_ID}
        onClose={closeMenus}
        open={megaOpen}
        slotProps={{
          paper: {
            sx: {
              borderRadius: SURFACE_RADIUS,
              boxShadow: SURFACE_SHADOW,
              maxHeight: "calc(100vh - 110px)",
              maxWidth: 1120,
              mt: 0.5,
              overflowY: "auto",
              p: 3,
              width: "calc(100vw - 32px)",
            },
          },
        }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          }}
        >
          {data.categories.map((category) => (
            <Box key={category.id}>
              <Box
                component={NextLink}
                href={category.href}
                onClick={closeMenus}
                sx={{
                  "&:hover": { color: "primary.main" },
                  color: "text.primary",
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  mb: 1,
                  px: 1,
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                {category.name}
              </Box>
              <ToolLinkList onNavigate={closeMenus} tools={category.tools} />
            </Box>
          ))}
        </Box>
        <Box sx={{ borderColor: "divider", borderTop: "1px solid", mt: 2.5, pt: 1.5 }}>
          <Button component={NextLink} href="/categories" onClick={closeMenus} size="small">
            Browse all categories
          </Button>
        </Box>
      </Popover>

      {searchOpen ? (
        <Suspense fallback={null}>
          <SearchMenu onClose={() => setSearchOpen(false)} />
        </Suspense>
      ) : null}

      <Drawer
        anchor="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1.25 }}>
          <Typography component="p" sx={{ fontWeight: 700 }}>
            Tools
          </Typography>
          <IconButton aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box aria-label="Mobile" component="nav" sx={{ overflowY: "auto", pb: 3, px: 1 }}>
          <Accordion disableGutters elevation={0} sx={{ "&::before": { display: "none" }, bgcolor: "transparent" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>Popular</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <ToolLinkList onNavigate={closeMenus} tools={data.popular} />
            </AccordionDetails>
          </Accordion>
          {data.categories.map((category) => (
            <Accordion
              disableGutters
              elevation={0}
              key={category.id}
              sx={{ "&::before": { display: "none" }, bgcolor: "transparent" }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <ToolLinkList onNavigate={closeMenus} tools={category.tools} />
              </AccordionDetails>
            </Accordion>
          ))}
          <Button component={NextLink} href="/categories" onClick={closeMenus} sx={{ mt: 1 }}>
            Browse all categories
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
