"use client";

import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#2457D6",
    },
    background: {
      default: "#F7F8FC",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h2: {
      fontSize: "clamp(2.5rem, 7vw, 5rem)",
      fontWeight: 750,
      letterSpacing: "-0.045em",
      lineHeight: 0.98,
    },
  },
});
