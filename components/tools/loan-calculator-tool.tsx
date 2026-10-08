"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult, type ResultRow } from "@/components/tools/calculator-result";
import { DecimalField } from "@/components/tools/calculator-fields";
import { NumberField } from "@/components/tools/form-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ScheduleTable } from "@/components/tools/schedule-table";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { formatAmount, formatNumber, parseDecimal } from "@/lib/tools/calculators/format";
import { calculateLoan, MAX_LOAN_YEARS, type LoanSuccess } from "@/lib/tools/calculators/loan";

const MONTHS_PER_YEAR = 12;

/**
 * Words a number of months as years and months, for example 252 becomes "21 years".
 */
function describeDuration(months: number): string {
  const years = Math.floor(months / MONTHS_PER_YEAR);
  const rest = months % MONTHS_PER_YEAR;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "",
    rest > 0 ? `${rest} ${rest === 1 ? "month" : "months"}` : "",
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Lists the figures beside the monthly payment, adding the savings when extra is paid.
 */
function rowsFor(result: LoanSuccess, extraMonthly: number): ResultRow[] {
  const hasExtra = extraMonthly > 0;

  return [
    ...(hasExtra ? [{ label: "Monthly payment with the extra", value: formatAmount(result.monthlyPayment + extraMonthly) }] : []),
    { label: "Total interest", value: formatAmount(result.totalInterest) },
    { label: "Total paid back", value: formatAmount(result.totalPaid) },
    { label: "Paid off in", value: describeDuration(result.payoffMonths) },
    ...(hasExtra && result.monthsSaved > 0
      ? [
          { label: "Interest saved by paying extra", value: formatAmount(result.interestSaved) },
          { label: "Time saved", value: describeDuration(result.monthsSaved) },
        ]
      : []),
  ];
}

/**
 * Works out a loan's monthly payment, total interest, and full repayment schedule, with an
 * optional extra monthly payment to show how much it saves. It suits a mortgage, a car loan,
 * or a personal loan at a fixed rate.
 */
export function LoanCalculatorTool(): ReactNode {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [extra, setExtra] = useState("");
  const termMonths = Number(years || "0") * MONTHS_PER_YEAR + Number(months || "0");
  const hasInputs = amount.trim() !== "" && rate.trim() !== "" && (years.trim() !== "" || months.trim() !== "");
  const result = hasInputs
    ? calculateLoan({
        annualRatePercent: parseDecimal(rate) ?? Number.NaN,
        extraMonthly: parseDecimal(extra) ?? 0,
        principal: parseDecimal(amount) ?? Number.NaN,
        termMonths,
      })
    : null;
  const extraMonthly = parseDecimal(extra) ?? 0;

  /**
   * Clears every field.
   */
  function handleReset(): void {
    setAmount("");
    setRate("");
    setYears("");
    setMonths("");
    setExtra("");
  }

  return (
    <ToolWorkspace label="Loan calculator workspace" secondaryActions={<ResetButton onClick={handleReset} />}>
      <CalculatorLayout
        inputs={
          <>
            <DecimalField id="loan-amount" label="Loan amount" onChange={setAmount} value={amount} />
            <DecimalField id="loan-rate" label="Interest rate per year" onChange={setRate} suffix="%" value={rate} />
            <NumberField
              helperText={`Up to ${MAX_LOAN_YEARS} years.`}
              id="loan-years"
              label="Term (years)"
              max={MAX_LOAN_YEARS}
              min={0}
              onChange={setYears}
              value={years}
            />
            <NumberField id="loan-months" label="Term (extra months)" max={11} min={0} onChange={setMonths} value={months} />
            <DecimalField
              helperText="Optional. Paying a little more each month shortens the loan and saves interest."
              id="loan-extra"
              label="Extra payment each month"
              onChange={setExtra}
              value={extra}
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter the loan amount, the yearly rate, and the term to see the monthly payment."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? `Monthly payment: ${formatAmount(result.monthlyPayment)}` : undefined}
            rows={result?.ok ? rowsFor(result, extraMonthly) : []}
          />
        }
      />
      {result?.ok ? (
        <ScheduleTable
          columns={["Month", "Payment", "Principal", "Interest", "Balance"]}
          csvFileName="loan-repayment-schedule.csv"
          rows={result.schedule.map((row) => [
            formatNumber(row.month, 0),
            formatAmount(row.payment),
            formatAmount(row.principal),
            formatAmount(row.interest),
            formatAmount(row.balance),
          ])}
          title="Repayment schedule"
        />
      ) : null}
    </ToolWorkspace>
  );
}
