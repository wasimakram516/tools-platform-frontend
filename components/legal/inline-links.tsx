import { Link } from "@mui/material";
import type { ReactNode } from "react";
import { NextLink } from "@/components/ui/next-link";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Splits text containing [label](url) markers into plain strings and links. Site paths
 * (starting with "/") use client-side navigation; anything else opens as a normal link.
 */
export function InlineLinks({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [marker, label, href] = match;
    const start = match.index ?? 0;

    if (!marker || !label || !href) {
      continue;
    }

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      href.startsWith("/") ? (
        <Link component={NextLink} href={href} key={start} underline="always">
          {label}
        </Link>
      ) : (
        <Link href={href} key={start} rel="noopener" underline="always">
          {label}
        </Link>
      ),
    );
    lastIndex = start + marker.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
