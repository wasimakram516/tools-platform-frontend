"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { StatGrid } from "@/components/tools/stat-grid";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import type { Uint32Source } from "@/lib/tools/generators/random";
import {
  generateNumbers,
  MAX_DECIMALS,
  MAX_NUMBERS,
  type NumberSort,
  type NumbersResult,
} from "@/lib/tools/generators/random-tools";
import { FONT_MONO } from "@/theme/typography";
import { SURFACE_RADIUS } from "@/theme/surface";

const SORT_OPTIONS = [
  { label: "As drawn", tooltip: "Keep the order the numbers were drawn in", value: "none" },
  { label: "Low to high", tooltip: "Smallest first", value: "ascending" },
  { label: "High to low", tooltip: "Largest first", value: "descending" },
] as const;

const SUMMARY_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

interface RandomNumbersPanelProps {
  onStatus: (message: string) => void;
  source?: Uint32Source;
}

/**
 * Draws random numbers from a range, as whole numbers or with decimals, optionally all different
 * and sorted, with their sum and average.
 */
export function RandomNumbersPanel({ onStatus, source }: RandomNumbersPanelProps): ReactNode {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [decimals, setDecimals] = useState("0");
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState<NumberSort>("none");
  const [result, setResult] = useState<NumbersResult | null>(null);

  /**
   * Draws a fresh set of numbers with the current settings.
   */
  function handleGenerate(): void {
    setResult(
      generateNumbers(
        {
          count: Number(count),
          decimals: Number(decimals),
          max: max.trim() === "" ? Number.NaN : Number(max),
          min: min.trim() === "" ? Number.NaN : Number(min),
          sort,
          unique,
        },
        source,
      ),
    );
    onStatus("");
  }

  /**
   * Copies the numbers separated by commas or one to a line.
   */
  async function handleCopy(separator: string, what: string): Promise<void> {
    if (result?.ok) {
      onStatus((await copyToClipboard(result.values.join(separator))) ? `${what} copied.` : copyBlockedMessage("numbers"));
    }
  }

  return (
    <CalculatorLayout
      inputs={
        <>
          <Stack direction="row" sx={{ gap: 1.5 }}>
            <TextField
              fullWidth
              id="random-min"
              label="Smallest"
              onChange={(event) => setMin(event.target.value)}
              slotProps={{ htmlInput: { inputMode: "decimal", step: "any" }, inputLabel: { shrink: true } }}
              type="number"
              value={min}
            />
            <TextField
              fullWidth
              id="random-max"
              label="Largest"
              onChange={(event) => setMax(event.target.value)}
              slotProps={{ htmlInput: { inputMode: "decimal", step: "any" }, inputLabel: { shrink: true } }}
              type="number"
              value={max}
            />
          </Stack>
          <NumberField id="random-count" label="How many" max={MAX_NUMBERS} min={1} onChange={setCount} value={count} />
          <NumberField
            helperText="0 makes whole numbers."
            id="random-decimals"
            label="Decimal places"
            max={MAX_DECIMALS}
            min={0}
            onChange={setDecimals}
            value={decimals}
          />
          <OptionSwitch
            checked={unique}
            label="No repeats"
            onChange={setUnique}
            tooltip="Every number appears at most once, like drawing balls from a bag"
          />
          <ModeToggle fullWidth label="Order" onChange={setSort} options={SORT_OPTIONS} value={sort} />
        </>
      }
      result={
        <Stack sx={{ gap: 2 }}>
          <Button onClick={handleGenerate} startIcon={<RefreshIcon />} sx={{ alignSelf: "flex-start" }} variant="contained">
            {result ? "Draw again" : "Draw numbers"}
          </Button>
          {result && !result.ok ? <Alert severity="error">{result.message}</Alert> : null}
          {!result ? (
            <Typography color="text.secondary">Choose a range and press Draw numbers.</Typography>
          ) : null}
          {result?.ok ? (
            <>
              <StatGrid
                featureFirst={false}
                stats={[
                  { label: "Sum", value: SUMMARY_FORMAT.format(result.summary.sum) },
                  { label: "Average", value: SUMMARY_FORMAT.format(result.summary.average) },
                  { label: "Smallest", value: SUMMARY_FORMAT.format(result.summary.smallest) },
                  { label: "Largest", value: SUMMARY_FORMAT.format(result.summary.largest) },
                ]}
              />
              <Box
                aria-label="Numbers drawn"
                role="group"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: SURFACE_RADIUS,
                  fontFamily: FONT_MONO,
                  fontSize: "1rem",
                  lineHeight: 1.9,
                  maxHeight: 320,
                  overflowY: "auto",
                  overflowWrap: "anywhere",
                  p: 2,
                }}
              >
                {result.values.join("   ")}
              </Box>
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1.5 }}>
                <Button onClick={() => void handleCopy(", ", "Numbers")} startIcon={<ContentCopyIcon />} variant="outlined">
                  Copy with commas
                </Button>
                <Button color="inherit" onClick={() => void handleCopy("\n", "Numbers")} startIcon={<ContentCopyIcon />}>
                  Copy one per line
                </Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      }
    />
  );
}
