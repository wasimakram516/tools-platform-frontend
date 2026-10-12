"use client";

import Link from "next/link";
import type { ComponentProps, FocusEvent, MouseEvent, ReactNode, TouchEvent } from "react";
import { useState } from "react";

type NextLinkProps = ComponentProps<typeof Link>;

/**
 * The site's link: next/link, but it prefetches the page it points to only once someone shows
 * they may follow it (hovering, touching, or focusing it), instead of for every link that
 * scrolls into view.
 *
 * Prefetching every visible link made the home page download and parse the code of the tools
 * it links to, which it never runs, while the visitor was still waiting for the page to
 * appear. Following a link still feels instant, because the fetch starts as the pointer or
 * finger arrives. A caller can still pass `prefetch` to decide for itself.
 *
 * It is a client component so server components can hand it to Material UI's `component` prop
 * without passing a plain function across the server and client boundary.
 */
export function NextLink({ onFocus, onMouseEnter, onTouchStart, prefetch, ...rest }: NextLinkProps): ReactNode {
  const [intended, setIntended] = useState(false);

  return (
    <Link
      {...rest}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        setIntended(true);
        onFocus?.(event);
      }}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        setIntended(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event: TouchEvent<HTMLAnchorElement>) => {
        setIntended(true);
        onTouchStart?.(event);
      }}
      // false turns prefetching off, and null returns to the default once there is intent.
      prefetch={prefetch ?? (intended ? null : false)}
    />
  );
}
