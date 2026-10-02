import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { PropsWithChildren, ReactNode } from "react";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Tools Platform",
    template: "%s | Tools Platform",
  },
  description: "Fast, private online tools that work directly in your browser.",
};

/**
 * Provides the document shell and application-wide Material UI theme.
 */
export default function RootLayout({ children }: PropsWithChildren): ReactNode {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
