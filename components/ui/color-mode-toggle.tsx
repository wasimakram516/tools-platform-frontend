"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import type { ReactNode } from "react";

const TOGGLE_SIZE = 40;

/**
 * Switches between the light and dark themes; the choice is remembered by Material UI.
 * Renders an empty slot until the stored mode is known, so server and client markup match.
 */
export function ColorModeToggle(): ReactNode {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return <Box aria-hidden="true" sx={{ height: TOGGLE_SIZE, width: TOGGLE_SIZE }} />;
  }

  const isDark = mode === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={() => setMode(isDark ? "light" : "dark")}>
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
