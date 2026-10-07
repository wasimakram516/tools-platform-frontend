"use client";

import { Alert, Chip, LinearProgress, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { NumberField } from "@/components/tools/form-fields";
import { StatGrid } from "@/components/tools/stat-grid";
import { TextAnalysisTool } from "@/components/tools/text-analysis-tool";
import { formatCharacterCount } from "@/lib/tools/text-metrics";
import { checkLimit, type TextStats } from "@/lib/tools/text/text-stats";
import { countCharacterTypes } from "@/lib/tools/text/word-insights";

const MAX_LIMIT = 10_000_000;

/** Common places a length limit applies. The numbers are widely used guides, not hard rules. */
const LIMIT_PRESETS = [
  { label: "X post", limit: 280 },
  { label: "SMS", limit: 160 },
  { label: "Page title", limit: 60 },
  { label: "Meta description", limit: 160 },
  { label: "YouTube title", limit: 100 },
  { label: "Instagram caption", limit: 2200 },
  { label: "LinkedIn post", limit: 3000 },
] as const;

/**
 * Describes how the text stands against the limit, for example "30 characters left".
 */
function describeLimit(remaining: number, isOver: boolean): string {
  const amount = formatCharacterCount(Math.abs(remaining));
  const unit = Math.abs(remaining) === 1 ? "character" : "characters";

  return isOver ? `${amount} ${unit} over the limit` : `${amount} ${unit} left`;
}

/**
 * Counts characters with and without spaces, breaks them down by kind, and checks the text
 * against a length limit.
 */
export function CharacterCounterTool(): ReactNode {
  const [limitText, setLimitText] = useState("");
  const limit = limitText === "" ? null : Number(limitText);

  /**
   * Shows the counts, the breakdown by kind and, when a limit is set, how close the text is.
   */
  function renderResults(stats: TextStats, text: string): ReactNode {
    const status = checkLimit(stats.characters, limit);
    const types = countCharacterTypes(text);

    return (
      <>
        <StatGrid
          stats={[
            { label: "Characters", value: stats.characters },
            { label: "Without spaces", value: stats.charactersWithoutSpaces },
            { label: "Words", value: stats.words },
            { label: "Lines", value: stats.lines },
            { label: "Size in UTF-8 bytes", value: stats.utf8Bytes },
          ]}
        />
        {status ? (
          <Stack sx={{ gap: 1 }}>
            <LinearProgress
              aria-label="Characters used"
              color={status.isOver ? "error" : "primary"}
              sx={{ borderRadius: 1, height: 8 }}
              value={Math.min((stats.characters / status.limit) * 100, 100)}
              variant="determinate"
            />
            <Alert severity={status.isOver ? "error" : "success"}>
              {describeLimit(status.remaining, status.isOver)}
            </Alert>
          </Stack>
        ) : null}
        <StatGrid
          featureFirst={false}
          stats={[
            { label: "Letters", value: types.letters },
            { label: "Capital letters", value: types.uppercase },
            { label: "Lower case letters", value: types.lowercase },
            { label: "Digits", value: types.digits },
            { label: "Spaces and line breaks", value: types.spaces },
            { label: "Punctuation", value: types.punctuation },
            { label: "Symbols and emoji", value: types.symbols },
          ]}
        />
      </>
    );
  }

  return (
    <TextAnalysisTool
      idPrefix="character-counter"
      inputLabel="Your text"
      inputPlaceholder="Type or paste your text to count its characters."
      options={
        <Stack sx={{ gap: 1.5 }}>
          <NumberField
            helperText="Optional. Pick a preset or type your own to see how much room is left."
            id="character-limit"
            label="Character limit"
            max={MAX_LIMIT}
            min={1}
            onChange={setLimitText}
            value={limitText}
          />
          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
            {LIMIT_PRESETS.map((preset) => (
              <Chip
                color={limit === preset.limit ? "primary" : "default"}
                key={preset.label}
                label={`${preset.label} ${formatCharacterCount(preset.limit)}`}
                onClick={() => setLimitText(String(preset.limit))}
                variant={limit === preset.limit ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Stack>
      }
      renderResults={renderResults}
      statusMessage="Characters are counted as you see them, so an emoji or an accented letter counts once. Platform limits are common guides and can change."
      workspaceLabel="Character counter workspace"
    />
  );
}
