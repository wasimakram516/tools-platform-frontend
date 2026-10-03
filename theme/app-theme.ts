"use client";

import { createTheme } from "@mui/material/styles";

const CORNER_RADIUS = 10;

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  defaultColorScheme: "light",
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2F5CF4", dark: "#2345BA", contrastText: "#FFFFFF" },
        secondary: { main: "#E7F6F1" },
        background: { default: "#F6F8FB", paper: "#FFFFFF" },
        text: { primary: "#14213A", secondary: "#55647A" },
        divider: "#DCE3EC",
        action: { hover: "rgba(47, 92, 244, 0.06)" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#7C9BFF", dark: "#5C7FF0", contrastText: "#0B1220" },
        secondary: { main: "#12302B" },
        background: { default: "#0D1320", paper: "#141C2E" },
        text: { primary: "#E8EDF7", secondary: "#9AA8BF" },
        divider: "#26324A",
        action: { hover: "rgba(124, 155, 255, 0.10)" },
      },
    },
  },
  shape: {
    borderRadius: CORNER_RADIUS,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h1: {
      fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
      fontWeight: 760,
      letterSpacing: "-0.04em",
      lineHeight: 1.04,
    },
    h2: {
      fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
      fontWeight: 740,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    },
    h4: { fontWeight: 740, letterSpacing: "-0.03em" },
    h5: { fontWeight: 720, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
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
        root: { backgroundImage: "none" },
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
