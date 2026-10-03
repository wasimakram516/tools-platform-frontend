import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Comfortaa, Figtree, JetBrains_Mono } from "next/font/google";
import type { PropsWithChildren, ReactNode } from "react";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { env } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { BRAND_DESCRIPTOR } from "@/lib/site-config";
import "./globals.css";

const headingFont = Comfortaa({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${SITE_NAME}: ${BRAND_DESCRIPTOR}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { follow: true, index: true },
  openGraph: { siteName: SITE_NAME, type: "website" },
};

/**
 * Provides the document shell and application-wide Material UI theme.
 */
export default function RootLayout({ children }: PropsWithChildren): ReactNode {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data" defaultMode="light" />
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
