"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DecimalField, SelectField } from "@/components/tools/calculator-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  fieldsFor,
  MARGIN_MODE_OPTIONS,
  PERCENTAGE_MODE_OPTIONS,
  summarizePercentage,
  type MarginMode,
  type PercentageMode,
} from "@/lib/tools/calculators/percentage-summary";

const DEFAULT_MODE: PercentageMode = "percentOf";
const DEFAULT_MARGIN_MODE: MarginMode = "fromPrice";

/**
 * Six everyday percentage jobs in one calculator: a percentage of a number, what percent one
 * number is of another, percentage change, raising or lowering a number, discounts, and margin
 * and markup. The answer updates as the numbers are typed.
 */
export function PercentageCalculatorTool(): ReactNode {
  const [mode, setMode] = useState<PercentageMode>(DEFAULT_MODE);
  const [marginMode, setMarginMode] = useState<MarginMode>(DEFAULT_MARGIN_MODE);
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const fields = fieldsFor(mode, marginMode);
  const outcome = summarizePercentage(mode, first, second, { direction, marginMode });
  const error = outcome && "message" in outcome ? outcome.message : null;
  const answer = outcome && "headline" in outcome ? outcome : null;

  /**
   * Clears the numbers and returns to the first mode.
   */
  function handleReset(): void {
    setMode(DEFAULT_MODE);
    setMarginMode(DEFAULT_MARGIN_MODE);
    setDirection("increase");
    setFirst("");
    setSecond("");
  }

  return (
    <ToolWorkspace label="Percentage calculator workspace" secondaryActions={<ResetButton onClick={handleReset} />}>
      <CalculatorLayout
        inputs={
          <>
            <SelectField
              id="percentage-mode"
              label="What do you want to work out?"
              onChange={(value) => setMode(value as PercentageMode)}
              options={PERCENTAGE_MODE_OPTIONS}
              value={mode}
            />
            {mode === "margin" ? (
              <SelectField
                helperText="Markup is profit as a share of the cost. Margin is profit as a share of the price."
                id="percentage-margin-mode"
                label="Starting from"
                onChange={(value) => setMarginMode(value as MarginMode)}
                options={MARGIN_MODE_OPTIONS}
                value={marginMode}
              />
            ) : null}
            {mode === "adjust" ? (
              <ModeToggle
                fullWidth
                label="Direction"
                onChange={setDirection}
                options={[
                  { icon: <ArrowUpwardIcon fontSize="small" />, label: "Increase", tooltip: "Add the percentage to the number", value: "increase" },
                  { icon: <ArrowDownwardIcon fontSize="small" />, label: "Decrease", tooltip: "Take the percentage off the number", value: "decrease" },
                ]}
                value={direction}
              />
            ) : null}
            <DecimalField id="percentage-first" label={fields.firstLabel} onChange={setFirst} suffix={fields.firstSuffix} value={first} />
            <DecimalField id="percentage-second" label={fields.secondLabel} onChange={setSecond} suffix={fields.secondSuffix} value={second} />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter both numbers to see the answer."
            errorMessage={error}
            headline={answer?.headline}
            rows={answer?.rows}
          />
        }
      />
    </ToolWorkspace>
  );
}
