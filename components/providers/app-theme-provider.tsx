"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { appTheme } from "@/theme/app-theme";

/**
 * Provides Emotion caching, the shared MUI theme, and normalized baseline styles.
 */
export function AppThemeProvider({ children }: PropsWithChildren): ReactNode {
  return (
    <AppRouterCacheProvider options={{ key: "tools" }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
