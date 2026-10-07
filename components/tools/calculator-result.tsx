"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Alert, Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { FONT_HEADING } from "@/theme/typography";

export interface ResultRow {
  label: string;
  value: string;
}

interface CalculatorResultProps {
  /** Shown until the inputs are complete. */
  emptyMessage: string;
  /** A problem with the inputs, shown instead of a result. */
  errorMessage?: string | null;
  headline?: string;
  rows?: readonly ResultRow[];
}

/**
 * Shows a calculator's live result in one of three states (waiting for input, a problem with
 * the input, or the answer), announces changes politely, and offers to copy the answer.
 */
export function CalculatorResult({
  emptyMessage,
  errorMessage = null,
  headline,
  rows = [],
}: CalculatorResultProps): ReactNode {
  const [copyStatus, setCopyStatus] = useState("");
  const hasResult = headline !== undefined && !errorMessage;

  /**
   * Copies the headline and every row as plain text.
   */
  async function handleCopy(): Promise<void> {
    const text = [headline, ...rows.map((row) => `${row.label}: ${row.value}`)].join("\n");

    setCopyStatus((await copyToClipboard(text)) ? "Result copied." : copyBlockedMessage("result"));
  }

  return (
    <Box
      aria-live="polite"
      role="status"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.5,
        minHeight: 200,
        p: { xs: 2, md: 3 },
      }}
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {!hasResult && !errorMessage ? (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      ) : null}

      {hasResult ? (
        <Stack sx={{ gap: 2.5 }}>
          <Typography
            component="p"
            sx={{ fontFamily: FONT_HEADING, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.25 }}
          >
            {headline}
          </Typography>
          {rows.length > 0 ? (
            <Box component="dl" sx={{ display: "grid", gap: 1.25, m: 0 }}>
              {rows.map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    alignItems: "baseline",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                    pt: 1.25,
                  }}
                >
                  <Typography color="text.secondary" component="dt" sx={{ fontSize: "0.92rem" }}>
                    {row.label}
                  </Typography>
                  <Typography component="dd" sx={{ fontWeight: 600, m: 0, textAlign: "right" }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}
          <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
            <Tooltip arrow describeChild title="Copy the result as text">
              <Button onClick={() => void handleCopy()} startIcon={<ContentCopyIcon />} variant="outlined">
                Copy result
              </Button>
            </Tooltip>
            <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              {copyStatus}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
    </Box>
  );
}
