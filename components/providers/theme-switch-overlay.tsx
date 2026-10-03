"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { Box, Chip, Fade, useMediaQuery } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const VISIBLE_DURATION_MS = 500;
const FADE_TIMEOUT = { enter: 150, exit: 300 } as const;

/**
 * Confirms a light/dark change: a blurred veil hides the colours swapping underneath while a
 * pill names the new mode, then both fade away. Not shown for the initial mode on page load.
 */
export function ThemeSwitchOverlay(): ReactNode {
  const { mode } = useColorScheme();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const previousMode = useRef(mode);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hadMode = previousMode.current !== undefined;
    const changed = previousMode.current !== mode;
    previousMode.current = mode;

    if (!mode || !hadMode || !changed) {
      return undefined;
    }

    setIsVisible(true);
    const timer = window.setTimeout(() => setIsVisible(false), VISIBLE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [mode]);

  const isDark = mode === "dark";

  return (
    <Fade in={isVisible} timeout={prefersReducedMotion ? 0 : FADE_TIMEOUT} unmountOnExit>
      <Box
        sx={{
          alignItems: "center",
          backdropFilter: prefersReducedMotion ? "none" : "blur(6px)",
          bgcolor: isDark ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.15)",
          display: "flex",
          inset: 0,
          justifyContent: "center",
          pointerEvents: "none",
          position: "fixed",
          zIndex: (theme) => theme.zIndex.modal + 100,
        }}
      >
        <Chip
          aria-live="polite"
          icon={isDark ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          label={isDark ? "Dark mode" : "Light mode"}
          role="status"
          sx={{
            "& .MuiChip-icon": { color: isDark ? "primary.main" : "warning.main" },
            backdropFilter: "blur(20px) saturate(180%)",
            bgcolor: isDark ? "rgba(28, 33, 41, 0.72)" : "rgba(255, 255, 255, 0.72)",
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(20, 24, 31, 0.08)",
            borderRadius: "999px",
            boxShadow: isDark ? "0 8px 30px rgba(0, 0, 0, 0.6)" : "0 8px 30px rgba(20, 24, 31, 0.18)",
            color: isDark ? "#F2F5F7" : "#14181F",
            fontSize: "1rem",
            fontWeight: 600,
            px: 2,
            py: 3,
          }}
        />
      </Box>
    </Fade>
  );
}
