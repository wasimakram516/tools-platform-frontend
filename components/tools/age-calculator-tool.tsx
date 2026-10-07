"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DateField } from "@/components/tools/form-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { calculateAge } from "@/lib/tools/dates/age";
import { formatCount, formatNumber, formatYmd } from "@/lib/tools/dates/format";
import { todayIsoDate } from "@/lib/tools/dates/today";

interface AgeCalculatorToolProps {
  /** Supplies today's date as YYYY-MM-DD; replaced in tests so they do not depend on the clock. */
  getToday?: () => string;
}

/**
 * Calculates an exact age from a date of birth, live as the dates change.
 */
export function AgeCalculatorTool({ getToday = todayIsoDate }: AgeCalculatorToolProps = {}): ReactNode {
  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const result = birthDate ? calculateAge(birthDate, asOfDate || getToday()) : null;

  /**
   * Clears both dates.
   */
  function handleReset(): void {
    setBirthDate("");
    setAsOfDate("");
  }

  return (
    <ToolWorkspace
      label="Age calculator workspace"
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <DateField id="age-birth-date" label="Date of birth" onChange={setBirthDate} value={birthDate} />
            <DateField
              helperText="Leave empty to use today."
              id="age-as-of-date"
              label="Age at date"
              onChange={setAsOfDate}
              value={asOfDate}
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage="Enter a date of birth to see the exact age."
            errorMessage={result && !result.ok ? result.message : null}
            headline={result?.ok ? formatYmd(result) : undefined}
            rows={
              result?.ok
                ? [
                    { label: "Total months", value: formatNumber(result.totalMonths) },
                    { label: "Total weeks", value: formatNumber(result.totalWeeks) },
                    { label: "Total days", value: formatNumber(result.totalDays) },
                    { label: "Born on a", value: result.birthWeekday },
                    { label: "Next birthday", value: result.nextBirthday.longDate },
                    {
                      label: "Days until then",
                      value:
                        result.nextBirthday.daysUntil === 0
                          ? "Today"
                          : formatCount(result.nextBirthday.daysUntil, "day"),
                    },
                    { label: "Turning", value: String(result.nextBirthday.turningAge) },
                  ]
                : []
            }
          />
        }
      />
    </ToolWorkspace>
  );
}
