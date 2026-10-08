"use client";

import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DecimalField, SelectField } from "@/components/tools/calculator-fields";
import { NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ScheduleTable } from "@/components/tools/schedule-table";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { formatAmount, parseDecimal } from "@/lib/tools/calculators/format";
import {
  calculateCompoundInterest,
  calculateSimpleInterest,
  COMPOUNDING_OPTIONS,
  MAX_TERM_YEARS,
} from "@/lib/tools/calculators/interest";

type InterestMode = "compound" | "simple";

const MONTHS_PER_YEAR = 12;
const DEFAULT_COMPOUNDING = "12";

const COMPOUNDING_SELECT_OPTIONS = COMPOUNDING_OPTIONS.map((option) => ({
  label: option.label,
  value: String(option.perYear),
}));

/**
 * Calculates simple or compound interest, with an optional amount added every month, and shows
 * the balance year by year.
 */
export function InterestCalculatorTool(): ReactNode {
  const [mode, setMode] = useState<InterestMode>("compound");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [compounding, setCompounding] = useState(DEFAULT_COMPOUNDING);
  const [monthly, setMonthly] = useState("");
  const hasInputs = rate.trim() !== "" && (years.trim() !== "" || months.trim() !== "") && (principal.trim() !== "" || monthly.trim() !== "");
  const input = {
    compoundsPerYear: Number(compounding),
    monthlyContribution: parseDecimal(monthly) ?? 0,
    principal: parseDecimal(principal) ?? 0,
    ratePercent: parseDecimal(rate) ?? Number.NaN,
    termMonths: Number(years || "0") * MONTHS_PER_YEAR + Number(months || "0"),
  };
  const result = hasInputs ? (mode === "simple" ? calculateSimpleInterest(input) : calculateCompoundInterest(input)) : null;

  /**
   * Clears every field and goes back to compound interest.
   */
  function handleReset(): void {
    setMode("compound");
    setPrincipal("");
    setRate("");
    setYears("");
    setMonths("");
    setCompounding(DEFAULT_COMPOUNDING);
    setMonthly("");
  }

  return (
    <ToolWorkspace
      label="Interest calculator workspace"
      options={
        <ModeToggle
          label="Type of interest"
          onChange={setMode}
          options={[
            { icon: <AutoGraphIcon fontSize="small" />, label: "Compound", tooltip: "Interest also earns interest", value: "compound" },
            { icon: <ShowChartIcon fontSize="small" />, label: "Simple", tooltip: "Interest on the starting amount only", value: "simple" },
          ]}
          value={mode}
        />
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <DecimalField id="interest-principal" label="Starting amount" onChange={setPrincipal} value={principal} />
            <DecimalField id="interest-rate" label="Interest rate per year" onChange={setRate} suffix="%" value={rate} />
            <NumberField
              helperText={`Up to ${MAX_TERM_YEARS} years.`}
              id="interest-years"
              label="Time (years)"
              max={MAX_TERM_YEARS}
              min={0}
              onChange={setYears}
              value={years}
            />
            <NumberField id="interest-months" label="Time (extra months)" max={11} min={0} onChange={setMonths} value={months} />
            {mode === "compound" ? (
              <SelectField
                id="interest-compounding"
                label="Interest is added"
                onChange={setCompounding}
                options={COMPOUNDING_SELECT_OPTIONS}
                value={compounding}
              />
            ) : null}
            <DecimalField
              helperText="Optional. Added at the end of every month."
              id="interest-monthly"
              label="Monthly addition"
              onChange={setMonthly}
              value={monthly}
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter an amount, a yearly rate, and a time to see the balance."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? `Final balance: ${formatAmount(result.finalBalance)}` : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Total put in", value: formatAmount(result.totalDeposited) },
                    { label: "Interest earned", value: formatAmount(result.totalInterest) },
                  ]
                : []
            }
          />
        }
      />
      {result?.ok ? (
        <ScheduleTable
          columns={["Year", "Put in", "Interest", "Balance"]}
          csvFileName={`${mode}-interest-by-year.csv`}
          rows={result.years.map((row) => [
            String(row.year),
            formatAmount(row.deposited),
            formatAmount(row.interest),
            formatAmount(row.balance),
          ])}
          title="Year by year"
        />
      ) : null}
    </ToolWorkspace>
  );
}
