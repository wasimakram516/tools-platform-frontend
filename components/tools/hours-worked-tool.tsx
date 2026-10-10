"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { NumberField, TimeField } from "@/components/tools/form-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { calculateHoursWorked, formatDuration } from "@/lib/tools/dates/hours-worked";
import {
  MAX_SHIFTS,
  toWeekShift,
  totalWeek,
  weekToCsv,
  weekToText,
  type WeekShift,
} from "@/lib/tools/dates/week-hours";
import { browserWeekStorage, loadWeek, saveWeek } from "@/lib/tools/dates/week-storage";
import { downloadBlob } from "@/lib/tools/download";

const DEFAULT_BREAK_MINUTES = "0";
const MAX_BREAK_MINUTES = 1440;

interface HoursWorkedToolProps {
  /** Saves a file; replaced in tests so nothing is downloaded. */
  download?: (blob: Blob, fileName: string) => void;
}

/**
 * Calculates the time worked in a shift, live as the times change. Shifts can be added to a
 * list to total a week, and the list can be copied or downloaded as a CSV.
 */
export function HoursWorkedTool({ download = downloadBlob }: HoursWorkedToolProps = {}): ReactNode {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [shifts, setShifts] = useState<WeekShift[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  // Saving waits until the saved week has been read, or an empty week would replace it.
  const hasLoaded = useRef(false);
  const result =
    startTime && endTime
      ? calculateHoursWorked(startTime, endTime, Number(breakMinutes === "" ? "0" : breakMinutes))
      : null;
  const total = totalWeek(shifts);
  const isFull = shifts.length >= MAX_SHIFTS;

  useEffect(() => {
    // Storage is only read in the browser, after the first render, so the page and its first
    // HTML agree. This is the one place the saved week comes in.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShifts(loadWeek(browserWeekStorage()));
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (hasLoaded.current) {
      saveWeek(browserWeekStorage(), shifts);
    }
  }, [shifts]);

  /**
   * Clears the times and puts the break back to zero. The week's list is kept.
   */
  function handleReset(): void {
    setStartTime("");
    setEndTime("");
    setBreakMinutes(DEFAULT_BREAK_MINUTES);
  }

  /**
   * Adds the shift on screen to the week.
   */
  function handleAdd(): void {
    if (!result?.ok || isFull) {
      return;
    }

    setShifts((current) => [...current, toWeekShift(startTime, endTime, result)]);
    setStatusMessage(`Shift ${shifts.length + 1} added to the week.`);
  }

  /**
   * Takes one shift out of the week.
   */
  function handleRemove(index: number): void {
    setShifts((current) => current.filter((_shift, position) => position !== index));
    setStatusMessage("Shift removed.");
  }

  /**
   * Empties the week, and with it the copy saved in this browser.
   */
  function handleClearWeek(): void {
    setShifts([]);
    setStatusMessage("Week cleared.");
  }

  /**
   * Copies the week as plain text.
   */
  async function handleCopy(): Promise<void> {
    setStatusMessage((await copyToClipboard(weekToText(shifts))) ? "Week copied." : copyBlockedMessage("week"));
  }

  /**
   * Saves the week as a CSV file.
   */
  function handleDownload(): void {
    download(new Blob([weekToCsv(shifts)], { type: "text/csv" }), "hours-worked.csv");
    setStatusMessage("CSV downloaded.");
  }

  return (
    <ToolWorkspace
      actions={
        <Button
          disabled={!result?.ok || isFull}
          onClick={handleAdd}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Add shift to week
        </Button>
      }
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

      {shifts.length > 0 ? (
        <Box aria-labelledby="week-heading" component="section" sx={{ mt: 3 }}>
          <Typography component="h2" id="week-heading" variant="h5">
            Week total: {total.label}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {total.decimalHours.toFixed(2)} decimal hours across {total.shifts} {total.shifts === 1 ? "shift" : "shifts"}
          </Typography>
          <Box component="ol" sx={{ display: "grid", gap: 0.75, listStyle: "none", m: 0, mt: 2, p: 0 }}>
            {shifts.map((shift, index) => (
              <Stack
                component="li"
                direction="row"
                // The position is the identity of a shift, because two shifts can be identical.
                key={`${index}-${shift.startTime}-${shift.endTime}`}
                sx={{ alignItems: "center", gap: 1, justifyContent: "space-between" }}
              >
                <Typography>
                  Shift {index + 1}: {shift.startTime} to {shift.endTime}, break {shift.breakMinutes} min,{" "}
                  <strong>{formatDuration(shift.netMinutes)}</strong>
                </Typography>
                <IconButton aria-label={`Remove shift ${index + 1}`} onClick={() => handleRemove(index)} size="small">
                  <RemoveCircleOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Box>
        </Box>
      ) : null}

      <ToolFooter
        message={
          statusMessage ||
          (isFull
            ? `The week is full at ${MAX_SHIFTS} shifts.`
            : "Add each shift to total a week, then copy it or download a CSV. The week is remembered in this browser only.")
        }
      >
        {shifts.length > 0 ? (
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button onClick={() => void handleCopy()} startIcon={<ContentCopyIcon />} variant="outlined">
              Copy week
            </Button>
            <Button onClick={handleDownload} startIcon={<DownloadIcon />} variant="outlined">
              Download CSV
            </Button>
            <Button onClick={handleClearWeek} variant="text">
              Clear week
            </Button>
          </Stack>
        ) : null}
      </ToolFooter>
    </ToolWorkspace>
  );
}
