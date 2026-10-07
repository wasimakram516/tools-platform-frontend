"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import type { PropsWithChildren, ReactNode } from "react";
import { ThemeSwitchOverlay } from "@/components/providers/theme-switch-overlay";
import { appTheme } from "@/theme/app-theme";

/**
 * Provides Emotion caching, the shared MUI theme, normalized baseline styles, and the date
 * localization every date and time picker uses (day first, weeks starting on Monday).
 */
export function AppThemeProvider({ children }: PropsWithChildren): ReactNode {
  return (
    <AppRouterCacheProvider options={{ key: "tools" }}>
      <ThemeProvider defaultMode="light" theme={appTheme}>
        <LocalizationProvider adapterLocale="en-gb" dateAdapter={AdapterDayjs}>
          <CssBaseline />
          {children}
          <ThemeSwitchOverlay />
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
