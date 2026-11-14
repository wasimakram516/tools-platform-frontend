"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DateField } from "@/components/tools/form-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ShareLinkButton, useFillFromLink } from "@/components/tools/share-link";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  calculateDateDifference,
  type DateDifferenceSuccess,
  type DifferenceDirection,
} from "@/lib/tools/dates/date-difference";
import { formatCount, formatNumber, formatYmd } from "@/lib/tools/dates/format";
import { acceptIsoDate } from "@/lib/tools/share-link";

const DIRECTION_LABELS: Readonly<Record<DifferenceDirection, string>> = {
  earlier: "The end date is before the start date",
  later: "The end date is after the start date",
  same: "Both dates are the same day",
};

/**
 * Describes the span as weeks and days, for example "52 weeks and 0 days".
 */
function describeWeeks(result: DateDifferenceSuccess): string {
  return `${formatCount(result.weeks, "week")} and ${formatCount(result.remainingDays, "day")}`;
}

/**
 * Calculates the time between two dates, live as the dates change.
 */
export function DateDifferenceTool(): ReactNode {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(false);

  useFillFromLink({
    end: (value) => setIncludeEndDate(value === "1"),
    from: acceptIsoDate(setFromDate),
    to: acceptIsoDate(setToDate),
  });

  const result = fromDate && toDate ? calculateDateDifference(fromDate, toDate, includeEndDate) : null;

  /**
   * Clears both dates and the end-date option.
   */
  function handleReset(): void {
    setFromDate("");
    setToDate("");
    setIncludeEndDate(false);
  }

  return (
    <ToolWorkspace
      label="Date difference calculator workspace"
      secondaryActions={
        <>
          <ShareLinkButton ready={result !== null} values={{ end: includeEndDate ? "1" : "", from: fromDate, to: toDate }} />
          <ResetButton onClick={handleReset} />
        </>
      }
    >
      <CalculatorLayout
        inputs={
          <>
            <DateField id="difference-from" label="Start date" onChange={setFromDate} value={fromDate} />
            <DateField id="difference-to" label="End date" onChange={setToDate} value={toDate} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeEndDate}
                  onChange={(event) => setIncludeEndDate(event.target.checked)}
                />
              }
              label="Include the end date"
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter a start date and an end date to see the time between them."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? formatYmd(result) : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Total days", value: formatNumber(result.totalDays) },
                    { label: "In weeks", value: describeWeeks(result) },
                    { label: "Order", value: DIRECTION_LABELS[result.direction] },
                  ]
                : []
            }
          />
        }
      />
    </ToolWorkspace>
  );
}
