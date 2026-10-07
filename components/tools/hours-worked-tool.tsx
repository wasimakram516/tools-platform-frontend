"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { NumberField, TimeField } from "@/components/tools/form-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { calculateHoursWorked, formatDuration } from "@/lib/tools/dates/hours-worked";

const DEFAULT_BREAK_MINUTES = "0";
const MAX_BREAK_MINUTES = 1440;

/**
 * Calculates the time worked in a shift, live as the times change.
 */
export function HoursWorkedTool(): ReactNode {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const result =
    startTime && endTime
      ? calculateHoursWorked(startTime, endTime, Number(breakMinutes === "" ? "0" : breakMinutes))
      : null;

  /**
   * Clears the times and puts the break back to zero.
   */
  function handleReset(): void {
    setStartTime("");
    setEndTime("");
    setBreakMinutes(DEFAULT_BREAK_MINUTES);
  }

  return (
    <ToolWorkspace
      label="Hours worked calculator workspace"
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <TimeField id="hours-start" label="Start time" onChange={setStartTime} value={startTime} />
            <TimeField id="hours-end" label="End time" onChange={setEndTime} value={endTime} />
            <NumberField
              helperText="An end time before the start time means the shift ran past midnight."
              id="hours-break"
              label="Break (minutes)"
              max={MAX_BREAK_MINUTES}
              min={0}
              onChange={setBreakMinutes}
              value={breakMinutes}
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter a start time and an end time to see the hours worked."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? result.netLabel : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Decimal hours", value: result.decimalHours.toFixed(2) },
                    { label: "Shift before the break", value: formatDuration(result.grossMinutes) },
                    { label: "Break", value: `${result.breakMinutes} min` },
                    ...(result.crossesMidnight ? [{ label: "Ends", value: "The next day" }] : []),
                  ]
                : []
            }
          />
        }
      />
    </ToolWorkspace>
  );
}
