"use client";

import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#2F5CF4",
      dark: "#2345BA",
    },
    secondary: {
      main: "#DDF7F1",
    },
    background: {
      default: "#F7F9FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#152238",
      secondary: "#58677B",
    },
    divider: "#D8E0EA",
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h1: {
      fontSize: "clamp(2.8rem, 7vw, 6.4rem)",
      fontWeight: 760,
      letterSpacing: "-0.055em",
      lineHeight: 0.94,
    },
    h4: {
      fontWeight: 740,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontWeight: 720,
      letterSpacing: "-0.02em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 700,
          textTransform: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 650,
        },
      },
    },
  },
});
