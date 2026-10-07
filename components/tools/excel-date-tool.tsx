"use client";

import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import EventIcon from "@mui/icons-material/Event";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import NumbersIcon from "@mui/icons-material/Numbers";
import { TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult, type ResultRow } from "@/components/tools/calculator-result";
import { DateField, TimeField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  dateToExcelSerial,
  excelSerialToDate,
  type ExcelDateSystem,
} from "@/lib/tools/dates/excel-date";

type ExcelMode = "toSerial" | "toDate";

const MODE_OPTIONS = [
  { icon: <NumbersIcon />, label: "Date to Excel number", tooltip: "Turn a date into the number Excel stores", value: "toSerial" },
  { icon: <EventIcon />, label: "Excel number to date", tooltip: "Turn an Excel serial number into a date", value: "toDate" },
] as const;

const SYSTEM_OPTIONS = [
  { icon: <DesktopWindowsIcon />, label: "Windows (1900)", tooltip: "Excel for Windows and current Mac files count from 1900", value: "1900" },
  { icon: <LaptopMacIcon />, label: "Mac (1904)", tooltip: "Older Mac workbooks count from 1 Jan 1904", value: "1904" },
] as const;

const MAX_SERIAL_CHARACTERS = 20;

interface ShownResult {
  errorMessage: string | null;
  headline?: string;
  rows: ResultRow[];
}

const EMPTY_RESULT: ShownResult = { errorMessage: null, rows: [] };

/**
 * Works out what to show for a date being turned into an Excel serial number.
 */
function showSerial(dateValue: string, timeValue: string, system: ExcelDateSystem): ShownResult {
  if (!dateValue) {
    return EMPTY_RESULT;
  }

  const result = dateToExcelSerial(dateValue, timeValue, system);

  if (!result.ok) {
    return { errorMessage: result.message, rows: [] };
  }

  return {
    errorMessage: null,
    headline: result.serial,
    rows: [
      { label: "Whole days", value: String(result.wholeDays) },
      ...(result.timeFraction !== undefined
        ? [{ label: "Time as a fraction of a day", value: result.timeFraction }]
        : []),
    ],
  };
}

/**
 * Works out what to show for an Excel serial number being turned back into a date.
 */
function showDate(serial: string, system: ExcelDateSystem): ShownResult {
  if (!serial.trim()) {
    return EMPTY_RESULT;
  }

  const result = excelSerialToDate(serial, system);

  if (!result.ok) {
    return { errorMessage: result.message, rows: [] };
  }

  return {
    errorMessage: null,
    headline: result.longDate,
    rows: [
      ...(result.shortDate ? [{ label: "Date", value: result.shortDate }] : []),
      ...(result.time ? [{ label: "Time", value: result.time }] : []),
      ...(result.note ? [{ label: "Note", value: result.note }] : []),
    ],
  };
}

/**
 * Converts between dates and the serial numbers Excel stores them as, live as the input changes.
 */
export function ExcelDateTool(): ReactNode {
  const [mode, setMode] = useState<ExcelMode>("toSerial");
  const [system, setSystem] = useState<ExcelDateSystem>("1900");
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [serial, setSerial] = useState("");
  const shown = mode === "toSerial" ? showSerial(dateValue, timeValue, system) : showDate(serial, system);

  /**
   * Clears every input and goes back to the Windows date system.
   */
  function handleReset(): void {
    setDateValue("");
    setTimeValue("");
    setSerial("");
    setSystem("1900");
  }

  return (
    <ToolWorkspace
      label="Excel date converter workspace"
      options={
        <ModeToggle label="Conversion direction" onChange={setMode} options={MODE_OPTIONS} value={mode} />
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            {mode === "toSerial" ? (
              <>
                <DateField id="excel-date" label="Date" onChange={setDateValue} value={dateValue} />
                <TimeField
                  helperText="Optional. Adds the time as a fraction of a day."
                  id="excel-time"
                  label="Time"
                  onChange={setTimeValue}
                  value={timeValue}
                />
              </>
            ) : (
              <TextField
                fullWidth
                helperText="A whole number is a date. A decimal also carries the time of day."
                id="excel-serial"
                label="Excel serial number"
                onChange={(event) => setSerial(event.target.value)}
                placeholder="For example 46302"
                slotProps={{
                  htmlInput: { inputMode: "decimal", maxLength: MAX_SERIAL_CHARACTERS },
                  inputLabel: { shrink: true },
                }}
                value={serial}
              />
            )}
            <ModeToggle
              fullWidth
              label="Excel date system"
              onChange={setSystem}
              options={SYSTEM_OPTIONS}
              value={system}
            />
          </>
        }
        result={
          <CalculatorResult
            emptyMessage={
              mode === "toSerial"
                ? "Pick a date to see its Excel number."
                : "Enter an Excel serial number to see the date."
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
