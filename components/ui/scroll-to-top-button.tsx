"use client";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Fab, useMediaQuery, useScrollTrigger, Zoom } from "@mui/material";
import type { ReactNode } from "react";

const SHOW_AFTER_PX = 400;

/**
 * Floating button that appears once the page is scrolled and returns the reader to the top.
 */
export function ScrollToTopButton(): ReactNode {
  const isScrolled = useScrollTrigger({ disableHysteresis: true, threshold: SHOW_AFTER_PX });
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  /**
   * Scrolls to the top, without animation for people who prefer reduced motion.
   */
  function handleClick(): void {
    window.scrollTo({ behavior: prefersReducedMotion ? "auto" : "smooth", top: 0 });
  }

  return (
    <Zoom in={isScrolled}>
      <Fab
        aria-label="Back to top"
        color="primary"
        onClick={handleClick}
        size="medium"
        sx={{ bottom: { xs: 16, md: 24 }, position: "fixed", right: { xs: 16, md: 24 }, zIndex: "speedDial" }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}
