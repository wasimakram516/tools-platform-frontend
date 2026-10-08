"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DecimalField } from "@/components/tools/calculator-fields";
import { NumberField } from "@/components/tools/form-fields";
import { OptionSwitch } from "@/components/tools/option-switch";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { formatAmount, formatPercent, parseDecimal } from "@/lib/tools/calculators/format";
import { calculateTipSplit, MAX_PEOPLE } from "@/lib/tools/calculators/tip-split";

/** Common tip percentages, offered as one-tap choices. */
const TIP_PRESETS = [0, 10, 15, 18, 20] as const;
const DEFAULT_TIP = "15";
const DEFAULT_PEOPLE = "2";

/**
 * Adds a tip to a bill and splits the total between people, with an option to round each share
 * up to a whole number.
 */
export function TipSplitTool(): ReactNode {
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState(DEFAULT_TIP);
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [roundUp, setRoundUp] = useState(false);
  const result =
    bill.trim() !== "" && tip.trim() !== "" && people.trim() !== ""
      ? calculateTipSplit({
          bill: parseDecimal(bill) ?? Number.NaN,
          people: parseDecimal(people) ?? Number.NaN,
          roundUpShare: roundUp,
          tipPercent: parseDecimal(tip) ?? Number.NaN,
        })
      : null;

  /**
   * Clears the bill and puts the tip, the number of people, and rounding back to their defaults.
   */
  function handleReset(): void {
    setBill("");
    setTip(DEFAULT_TIP);
    setPeople(DEFAULT_PEOPLE);
    setRoundUp(false);
  }

  return (
    <ToolWorkspace
      label="Tip and bill split calculator workspace"
      options={
        <OptionSwitch
          checked={roundUp}
          label="Round each share up"
          onChange={setRoundUp}
          tooltip="Each person pays a whole number. The extra becomes part of the tip."
        />
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <DecimalField id="tip-bill" label="Bill" onChange={setBill} value={bill} />
            <Box>
              <DecimalField id="tip-percent" label="Tip" onChange={setTip} suffix="%" value={tip} />
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1, mt: 1.25 }}>
                {TIP_PRESETS.map((preset) => (
                  <Chip
                    clickable
                    color={Number(tip) === preset && tip.trim() !== "" ? "primary" : "default"}
                    key={preset}
                    label={`${preset}%`}
                    onClick={() => setTip(String(preset))}
                    size="small"
                    variant={Number(tip) === preset && tip.trim() !== "" ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Box>
            <NumberField id="tip-people" label="People" max={MAX_PEOPLE} min={1} onChange={setPeople} value={people} />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter the bill to see what each person pays."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? `Each person pays ${formatAmount(result.perPerson)}` : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Tip", value: formatAmount(result.tip) },
                    { label: "Tip as a share of the bill", value: formatPercent(result.effectiveTipPercent) },
                    { label: "Total with tip", value: formatAmount(result.total) },
                  ]
                : []
            }
          />
        }
      />
      <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mt: 2 }}>
        Amounts have no currency, so use whichever you are paying in.
      </Typography>
    </ToolWorkspace>
  );
}
