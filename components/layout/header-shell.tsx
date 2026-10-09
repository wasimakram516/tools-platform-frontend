"use client";

import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";

/** The header's height as a full-width bar, which is also the space it reserves on the page. */
const BAR_HEIGHT = 68;
const PILL_HEIGHT = 56;
const PILL_MAX_WIDTH = 860;
const PILL_TOP_GAP = 10;
/** The bar becomes a pill once the page is scrolled this share of a screen. */
const FLOAT_AFTER_SCREENS = 0.6;
/** Below this width the header stays a plain bar, as on a phone. Matches the md breakpoint. */
const MIN_FLOATING_WIDTH = 900;
const BAR_TRANSITION = [
  "width 450ms cubic-bezier(0.16, 1, 0.3, 1)",
  "max-width 450ms cubic-bezier(0.16, 1, 0.3, 1)",
  "margin-top 450ms cubic-bezier(0.16, 1, 0.3, 1)",
  "height 450ms cubic-bezier(0.16, 1, 0.3, 1)",
  "border-radius 450ms cubic-bezier(0.16, 1, 0.3, 1)",
  "box-shadow 300ms ease",
  "background-color 300ms ease",
].join(", ");

/**
 * The header's frame. On a wide screen it is a full-width bar at the top of the page, and once
 * the visitor scrolls past the first screen it shrinks into a centred floating pill that stays
 * in view, so the menus and search are always within reach. On a phone it stays a plain bar.
 * It reserves the same space either way, so the page never jumps. It is fixed to the top of
 * the window so it stays in view at every scroll position.
 */
export function HeaderShell({ children }: PropsWithChildren): ReactNode {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    /**
     * Floats the bar after the first screen, on wide screens only.
     */
    function update(): void {
      setFloating(window.innerWidth >= MIN_FLOATING_WIDTH && window.scrollY > window.innerHeight * FLOAT_AFTER_SCREENS);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    // The spacer keeps the bar's place in the page. The header itself is fixed to the top of the
    // window, because sticky positioning does not work inside the page's overflow-x: hidden body.
    <Box sx={{ height: BAR_HEIGHT }}>
    <Box
      component="header"
      data-floating={floating}
      sx={{ height: BAR_HEIGHT, left: 0, pointerEvents: "none", position: "fixed", right: 0, top: 0, zIndex: "appBar" }}
    >
      <Box
        sx={{
          bgcolor: floating ? "color-mix(in srgb, var(--mui-palette-background-paper) 88%, transparent)" : "background.paper",
          backdropFilter: floating ? "blur(18px)" : "none",
          border: floating ? "1px solid" : 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          borderRadius: floating ? 999 : 0,
          boxShadow: floating ? "0 16px 40px -12px rgba(20, 33, 28, 0.28)" : "none",
          height: floating ? PILL_HEIGHT : BAR_HEIGHT,
          left: 0,
          marginInline: "auto",
          marginTop: floating ? `${PILL_TOP_GAP}px` : 0,
          maxWidth: floating ? PILL_MAX_WIDTH : 2400,
          pointerEvents: "auto",
          position: "absolute",
          right: 0,
          transition: BAR_TRANSITION,
          width: floating ? "92%" : "100%",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            gap: 2,
            height: "100%",
            justifyContent: "space-between",
            mx: "auto",
            maxWidth: floating ? "none" : 1536,
            px: floating ? 3 : { xs: 2, sm: 3 },
            transition: "padding 450ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
    </Box>
  );
}
