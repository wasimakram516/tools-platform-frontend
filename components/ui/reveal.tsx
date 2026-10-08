"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import type { CSSProperties, ElementType, PropsWithChildren, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface RevealProps extends PropsWithChildren {
  /** The element to render, so a list item can reveal without an extra wrapper. */
  as?: ElementType;
  /** Milliseconds to wait once the item scrolls into view. */
  delay?: number;
  sx?: SxProps<Theme>;
}

/**
 * Fades and lifts its content into place the first time it scrolls into view.
 *
 * The content is fully visible in the server-rendered page, so search engines and visitors
 * without scripts see everything. Only once the browser has hydrated is an item that is still
 * below the fold hidden, ready to animate in. Items already on screen are never hidden, and a
 * visitor who prefers reduced motion gets no animation at all. The styles live in globals.css.
 */
export function Reveal({ as = "div", children, delay = 0, sx }: RevealProps): ReactNode {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (element.getBoundingClientRect().top < window.innerHeight) {
      return;
    }

    element.dataset.reveal = "hidden";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component={as}
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      sx={sx}
    >
      {children}
    </Box>
  );
}
