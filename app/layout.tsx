import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata, Viewport } from "next";
import { Comfortaa, Figtree, JetBrains_Mono } from "next/font/google";
import type { PropsWithChildren, ReactNode } from "react";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { deploymentContext, env } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { isIndexableDeployment } from "@/lib/site-url";
import { BRAND_DESCRIPTOR, THEME_COLOR } from "@/lib/site-config";
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
  // Preview deployments must not be indexed. The real site is.
  robots: isIndexableDeployment(deploymentContext)
    ? { follow: true, index: true, googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { follow: false, index: false },
  category: "technology",
  openGraph: { locale: "en_US", siteName: SITE_NAME, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: THEME_COLOR, media: "(prefers-color-scheme: light)" },
    { color: "#0B2B20", media: "(prefers-color-scheme: dark)" },
  ],
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
