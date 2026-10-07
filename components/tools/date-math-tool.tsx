"use client";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DateField, NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  calculateDateMath,
  MAX_DATE_MATH_AMOUNT,
  type DateOperation,
} from "@/lib/tools/dates/date-math";
import { formatCount } from "@/lib/tools/dates/format";
import { todayIsoDate } from "@/lib/tools/dates/today";

interface DateMathToolProps {
  /** Supplies today's date as YYYY-MM-DD; replaced in tests so they do not depend on the clock. */
  getToday?: () => string;
}

const OPERATION_OPTIONS = [
  { icon: <AddIcon />, label: "Add", tooltip: "Move the date later", value: "add" },
  { icon: <RemoveIcon />, label: "Subtract", tooltip: "Move the date earlier", value: "subtract" },
] as const;

/**
 * Turns a field value into a number, treating an empty field as zero.
 */
function toAmount(value: string): number {
  return Number(value === "" ? "0" : value);
}

/**
 * Describes how far the result is from the start, for example "451 days later".
 */
function describeOffset(daysFromStart: number): string {
  if (daysFromStart === 0) {
    return "Same day";
  }

  return `${formatCount(Math.abs(daysFromStart), "day")} ${daysFromStart > 0 ? "later" : "earlier"}`;
}

/**
 * Adds or subtracts years, months, weeks, and days from a date, live as the inputs change.
 */
export function DateMathTool({ getToday = todayIsoDate }: DateMathToolProps = {}): ReactNode {
  const [startDate, setStartDate] = useState("");
  const [operation, setOperation] = useState<DateOperation>("add");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("");
  const hasAmount = [years, months, weeks, days].some((value) => value !== "");
  const result = hasAmount
    ? calculateDateMath({
        days: toAmount(days),
        months: toAmount(months),
        operation,
        startDate: startDate || getToday(),
        weeks: toAmount(weeks),
        years: toAmount(years),
      })
    : null;

  /**
   * Clears every field and goes back to adding.
   */
  function handleReset(): void {
    setStartDate("");
    setOperation("add");
    setYears("");
    setMonths("");
    setWeeks("");
    setDays("");
  }

  const amountProps = { max: MAX_DATE_MATH_AMOUNT, min: 0 };

  return (
    <ToolWorkspace
      label="Add or subtract date workspace"
      options={
        <ModeToggle label="Operation" onChange={setOperation} options={OPERATION_OPTIONS} value={operation} />
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <DateField
              helperText="Leave empty to use today."
              id="date-math-start"
              label="Start date"
              onChange={setStartDate}
              value={startDate}
            />
            <NumberField {...amountProps} id="date-math-years" label="Years" onChange={setYears} value={years} />
            <NumberField {...amountProps} id="date-math-months" label="Months" onChange={setMonths} value={months} />
            <NumberField {...amountProps} id="date-math-weeks" label="Weeks" onChange={setWeeks} value={weeks} />
            <NumberField {...amountProps} id="date-math-days" label="Days" onChange={setDays} value={days} />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter an amount of years, months, weeks, or days to see the new date."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? result.longDate : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Date", value: result.shortDate },
                    { label: "From the start", value: describeOffset(result.daysFromStart) },
                  ]
                : []
            }
          />
        }
      />
    </ToolWorkspace>
  );
}
