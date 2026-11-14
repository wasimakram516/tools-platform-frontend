"use client";

import LinkIcon from "@mui/icons-material/Link";
import { Box, Button, Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { VISUALLY_HIDDEN_SX } from "@/components/ui/hidden-heading";
import { copyToClipboard } from "@/lib/tools/clipboard";
import { buildShareUrl, readSharedValues } from "@/lib/tools/share-link";

const COPIED_FOR_MS = 2500;

/**
 * Fills a tool from a shared link, once, after the page has loaded. Each setter receives the
 * value for its key as typed in the link; a setter for a choice should ignore a value it does
 * not know. The page is prerendered without the link's values, so they are read in the browser.
 */
export function useFillFromLink(setters: Readonly<Record<string, (value: string) => void>>): void {
  useLinkValues(Object.keys(setters), (shared) => {
    for (const [key, value] of Object.entries(shared)) {
      setters[key]?.(value);
    }
  });
}

/**
 * Reads the given keys from a shared link, once, after the page has loaded, and hands them to
 * apply together. Use it when one value decides which others are valid, such as a unit category
 * and its units. apply is not called when the link has none of the keys.
 */
export function useLinkValues(keys: readonly string[], apply: (shared: Readonly<Record<string, string>>) => void): void {
  useEffect(() => {
    const shared = readSharedValues(window.location.search, keys);

    if (Object.keys(shared).length > 0) {
      apply(shared);
    }
    // A shared link fills the tool once, when it opens; after that, typing takes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

interface ShareLinkButtonProps {
  /** Whether there is a result worth sharing. By default, whether any value is filled in. */
  ready?: boolean;
  /** The tool's current inputs, keyed the same way as its useFillFromLink setters. */
  values: Readonly<Record<string, string>>;
}

/**
 * Copies a link to this page with the current inputs in it, so the same result opens for anyone
 * who follows it. Disabled until something has been filled in.
 */
export function ShareLinkButton({ ready, values }: ShareLinkButtonProps): ReactNode {
  const [outcome, setOutcome] = useState<"copied" | "blocked" | null>(null);
  const [blockedUrl, setBlockedUrl] = useState("");
  const hasValues = ready ?? Object.values(values).some((value) => value.trim() !== "");

  useEffect(() => {
    if (outcome !== "copied") {
      return undefined;
    }

    const timer = window.setTimeout(() => setOutcome(null), COPIED_FOR_MS);

    return () => window.clearTimeout(timer);
  }, [outcome]);

  /**
   * Copies the link, or shows it to copy by hand when the browser refuses.
   */
  async function handleClick(): Promise<void> {
    const url = buildShareUrl(window.location, values);
    const copied = await copyToClipboard(url);

    setBlockedUrl(copied ? "" : url);
    setOutcome(copied ? "copied" : "blocked");
  }

  return (
    <>
      <Tooltip arrow describeChild title="Copy a link that opens this tool with these values filled in">
        <span>
          <Button color="inherit" disabled={!hasValues} onClick={() => void handleClick()} size="small" startIcon={<LinkIcon />}>
            {outcome === "copied" ? "Link copied" : "Copy link"}
          </Button>
        </span>
      </Tooltip>
      <Box aria-live="polite" role="status" sx={outcome === "blocked" ? { fontSize: "0.85rem", overflowWrap: "anywhere", width: "100%" } : VISUALLY_HIDDEN_SX}>
        {outcome === "copied" ? "A link with these values was copied." : null}
        {outcome === "blocked" ? `Copy was blocked by the browser. Select this link and copy it manually: ${blockedUrl}` : null}
      </Box>
    </>
  );
}
