import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { PropsWithChildren, ReactNode } from "react";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    <html lang="en" className={geistSans.variable}>
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
