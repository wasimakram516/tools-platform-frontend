"use client";

import { createTheme } from "@mui/material/styles";
import { RADIUS, SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";
import { FONT_BODY, FONT_HEADING } from "@/theme/typography";

const CORNER_RADIUS = RADIUS.control;

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  defaultColorScheme: "light",
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#1F7A5A", dark: "#176148", contrastText: "#FFFFFF" },
        secondary: { main: "#E5F2EC" },
        success: { main: "#1F7A5A", contrastText: "#FFFFFF" },
        warning: { main: "#F5B942", dark: "#8A5A00", contrastText: "#14211C" },
        error: { main: "#B3372B" },
        background: { default: "#F6F8F7", paper: "#FFFFFF" },
        text: { primary: "#14211C", secondary: "#55655E" },
        divider: "#DCE5E0",
        action: { hover: "rgba(31, 122, 90, 0.06)" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4FC08D", dark: "#3DA676", contrastText: "#07140E" },
        secondary: { main: "#173226" },
        success: { main: "#4FC08D", contrastText: "#07140E" },
        warning: { main: "#F5B942", contrastText: "#14211C" },
        error: { main: "#F0847A", contrastText: "#14211C" },
        background: { default: "#0E1512", paper: "#141E19" },
        text: { primary: "#E7EFEA", secondary: "#9CB0A5" },
        divider: "#24332B",
        action: { hover: "rgba(79, 192, 141, 0.10)" },
      },
    },
  },
  shape: {
    borderRadius: CORNER_RADIUS,
  },
  typography: {
    fontFamily: FONT_BODY,
    h1: {
      fontFamily: FONT_HEADING,
      fontSize: "clamp(2.1rem, 4.6vw, 3.5rem)",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.08,
    },
    h2: {
      fontFamily: FONT_HEADING,
      fontSize: "clamp(1.55rem, 2.8vw, 2rem)",
      fontWeight: 700,
      letterSpacing: "-0.015em",
      lineHeight: 1.18,
    },
    h3: { fontFamily: FONT_HEADING, fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontFamily: FONT_HEADING, fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontFamily: FONT_HEADING, fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontFamily: FONT_HEADING, fontWeight: 700, letterSpacing: "-0.005em" },
    button: { fontWeight: 650, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { transition: "background-color 0.3s ease, color 0.3s ease" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: CORNER_RADIUS,
          transition: "transform 150ms ease, background-color 150ms ease",
          "&:active": { transform: "scale(0.98)" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: CORNER_RADIUS - 2, fontWeight: 650 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none", borderRadius: SURFACE_RADIUS },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: SURFACE_RADIUS,
          boxShadow: SURFACE_SHADOW,
          overflow: "hidden",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { borderRadius: RADIUS.control + 2 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, padding: "6px 10px" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: CORNER_RADIUS },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: CORNER_RADIUS },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { fontWeight: 650, textTransform: "none" },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
    },
  },
});
