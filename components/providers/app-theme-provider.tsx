"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { ThemeSwitchOverlay } from "@/components/providers/theme-switch-overlay";
import { appTheme } from "@/theme/app-theme";

/**
 * Provides Emotion caching, the shared MUI theme, and normalized baseline styles.
 */
export function AppThemeProvider({ children }: PropsWithChildren): ReactNode {
  return (
    <AppRouterCacheProvider options={{ key: "tools" }}>
      <ThemeProvider defaultMode="light" theme={appTheme}>
        <CssBaseline />
        {children}
        <ThemeSwitchOverlay />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
