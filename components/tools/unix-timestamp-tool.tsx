"use client";

import EventIcon from "@mui/icons-material/Event";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PublicIcon from "@mui/icons-material/Public";
import UpdateIcon from "@mui/icons-material/Update";
import { TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult, type ResultRow } from "@/components/tools/calculator-result";
import { DateTimeField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  MAX_TIMESTAMP_INPUT_CHARACTERS,
  pickerValueToTimestamp,
  transformUnixTimestamp,
  type TimestampTransformResult,
  type TimestampZone,
  type UnixTimestampMode,
} from "@/lib/tools/dates/unix-timestamp";

const MODE_OPTIONS = [
  { icon: <UpdateIcon />, label: "Date to timestamp", tooltip: "Turn a date and time into a Unix timestamp", value: "toTimestamp" },
  { icon: <EventIcon />, label: "Timestamp to date", tooltip: "Turn seconds or milliseconds into a date", value: "toDate" },
] as const;

const ZONE_OPTIONS = [
  { icon: <PublicIcon />, label: "UTC", tooltip: "Read the date as Coordinated Universal Time", value: "utc" },
  { icon: <MyLocationIcon />, label: "My time zone", tooltip: "Read the date in this device's time zone", value: "local" },
] as const;

/** The line whose value is shown large, by direction. */
const HEADLINE_LABEL: Readonly<Record<UnixTimestampMode, string>> = {
  toDate: "UTC",
  toTimestamp: "Seconds",
};

interface ShownResult {
  errorMessage: string | null;
  headline?: string;
  rows: ResultRow[];
}

/**
 * Splits the converter's "Label: value" lines into a headline and result rows.
 */
function toShownResult(result: TimestampTransformResult | null, mode: UnixTimestampMode): ShownResult {
  if (!result) {
    return { errorMessage: null, rows: [] };
  }

  if (!result.ok) {
    return { errorMessage: result.message, rows: [] };
  }

  const rows = result.output.split("\n").map((line): ResultRow => {
    const separator = line.indexOf(": ");

    return { label: line.slice(0, separator), value: line.slice(separator + 2) };
  });
  const headline = rows.find((row) => row.label === HEADLINE_LABEL[mode]);

  return {
    errorMessage: null,
    headline: headline?.value,
    rows: rows.filter((row) => row !== headline),
  };
}

/**
 * Converts between Unix timestamps and dates, live as the input changes. The date side uses a
 * date and time picker and lets you choose whether the time is UTC or your own time zone.
 */
export function UnixTimestampTool(): ReactNode {
  const [mode, setMode] = useState<UnixTimestampMode>("toTimestamp");
  const [timestamp, setTimestamp] = useState("");
  const [pickedDateTime, setPickedDateTime] = useState("");
  const [zone, setZone] = useState<TimestampZone>("utc");

  let result: TimestampTransformResult | null = null;

  if (mode === "toDate" && timestamp.trim()) {
    result = transformUnixTimestamp(timestamp, "toDate");
  } else if (mode === "toTimestamp" && pickedDateTime) {
    result = pickerValueToTimestamp(pickedDateTime, zone);
  }

  const shown = toShownResult(result, mode);

  /**
   * Clears both inputs and goes back to UTC.
   */
  function handleReset(): void {
    setTimestamp("");
    setPickedDateTime("");
    setZone("utc");
  }

  return (
    <ToolWorkspace
      label="Unix timestamp converter workspace"
      options={
        <ModeToggle label="Conversion direction" onChange={setMode} options={MODE_OPTIONS} value={mode} />
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          mode === "toDate" ? (
            <TextField
              fullWidth
              helperText="Values of 12 digits or more are read as milliseconds."
              id="unix-timestamp-input"
              label="Unix timestamp"
              onChange={(event) => setTimestamp(event.target.value)}
              placeholder="For example 1760000000"
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: MAX_TIMESTAMP_INPUT_CHARACTERS },
                inputLabel: { shrink: true },
              }}
              value={timestamp}
            />
          ) : (
            <>
              <DateTimeField
                id="unix-date-time"
                label="Date and time"
                onChange={setPickedDateTime}
                value={pickedDateTime}
              />
              <ModeToggle
                fullWidth
                label="Time zone of the date"
                onChange={setZone}
                options={ZONE_OPTIONS}
                value={zone}
              />
            </>
          )
        }
        result={
          <CalculatorResult
            emptyMessage={
              mode === "toDate"
                ? "Enter a Unix timestamp to see the date."
                : "Pick a date and time to see the Unix timestamp."
            }
            errorMessage={shown.errorMessage}
            headline={shown.headline}
            rows={shown.rows}
          />
        }
      />
    </ToolWorkspace>
  );
}
