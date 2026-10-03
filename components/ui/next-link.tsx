"use client";

import Link from "next/link";

/**
 * Client-side re-export of next/link so server components can hand it to Material UI's
 * `component` prop without passing a plain function across the server/client boundary.
 */
export const NextLink = Link;
