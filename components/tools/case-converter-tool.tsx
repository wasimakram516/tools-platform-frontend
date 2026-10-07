"use client";

import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { LiveTextTool } from "@/components/tools/live-text-tool";
import { CASE_STYLES, convertCase, type CaseStyle } from "@/lib/tools/text/case-converter";

const DEFAULT_STYLE: CaseStyle = "title";
/** Showing every style converts the text sixteen times, so it is limited to text of this length. */
const MAX_ALL_STYLES_CHARACTERS = 20_000;

/**
 * Rewrites text in any of sixteen styles, and can show every style at once with a copy button on
 * each, which is handy when you are not sure which one you need.
 */
export function CaseConverterTool(): ReactNode {
  const [style, setStyle] = useState<CaseStyle>(DEFAULT_STYLE);
  const styleLabel = CASE_STYLES.find((entry) => entry.value === style)?.label ?? "";

  /**
   * Lists the text in every style, each with its own copy button.
   */
  function renderAllStyles(text: string, copy: (value: string, label: string) => void): ReactNode {
    if (text.length > MAX_ALL_STYLES_CHARACTERS) {
      return (
        <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
          The every-style view is available for text up to 20,000 characters.
        </Typography>
      );
    }

    return (
      <Stack sx={{ gap: 1.25 }}>
        <Typography component="h2" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
          Every style at once
        </Typography>
        <Stack
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {CASE_STYLES.map((entry) => {
            const converted = convertCase(text, entry.value);

            return (
              <CopyableValueRow
                highlighted={entry.value === style}
                id={entry.value}
                key={entry.value}
                onCopy={() => copy(converted, entry.label)}
                title={entry.label}
                value={converted}
              />
            );
          })}
        </Stack>
      </Stack>
    );
  }

  return (
    <LiveTextTool
      example="the quick brown fox jumps over the lazy dog"
      extra={renderAllStyles}
      idPrefix="case-converter"
      idleMessage="Choose a style, then type or paste text. The result updates as you type, and every style is listed below."
      inputLabel="Your text"
      inputPlaceholder="Type or paste the text to convert."
      options={
        <TextField
          id="case-style"
          label="Convert to"
          onChange={(event) => setStyle(event.target.value as CaseStyle)}
          select
          size="small"
          sx={{ minWidth: 240 }}
          value={style}
        >
          {CASE_STYLES.map((entry) => (
            <MenuItem key={entry.value} value={entry.value}>
              {entry.label}
            </MenuItem>
          ))}
        </TextField>
      }
      outputLabel={`Result in ${styleLabel}`}
      outputPlaceholder="The converted text appears here."
      transform={(text) => ({ output: convertCase(text, style), summary: `Converted to ${styleLabel}.` })}
      workspaceLabel="Case converter workspace"
    />
  );
}
