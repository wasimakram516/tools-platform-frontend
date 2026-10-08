"use client";

import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { toCsv } from "@/lib/tools/calculators/csv";
import { downloadBlob } from "@/lib/tools/download";
import { SURFACE_RADIUS } from "@/theme/surface";

interface ScheduleTableProps {
  /** The column headings. The first column is left-aligned and the rest are right-aligned. */
  columns: readonly string[];
  /** The file name offered for the CSV download. */
  csvFileName: string;
  /** Rows shown before "Show all". */
  previewRows?: number;
  /** One array of ready-to-show text per row, in column order. */
  rows: readonly (readonly string[])[];
  title: string;
}

const DEFAULT_PREVIEW_ROWS = 12;

/**
 * A long table of figures (an amortization schedule, or growth year by year). It shows the
 * first rows, offers the rest on request, and lets the person download all of it as CSV.
 */
export function ScheduleTable({ columns, csvFileName, previewRows = DEFAULT_PREVIEW_ROWS, rows, title }: ScheduleTableProps): ReactNode {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, previewRows);
  const hiddenCount = rows.length - visibleRows.length;

  /**
   * Saves every row, not only the visible ones, as a CSV file.
   */
  function handleDownload(): void {
    downloadBlob(new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8" }), csvFileName);
  }

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, mt: 3, overflow: "hidden" }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", bgcolor: "action.hover", gap: 1.5, justifyContent: "space-between", px: 2, py: 1.25 }}
      >
        <Typography component="h3" sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {title}
        </Typography>
        <Button onClick={handleDownload} size="small" startIcon={<DownloadIcon />} variant="outlined">
          Download CSV
        </Button>
      </Stack>
      <Box sx={{ maxHeight: showAll ? 480 : "none", overflow: "auto" }}>
        <Box component="table" sx={{ borderCollapse: "collapse", fontVariantNumeric: "tabular-nums", width: "100%" }}>
          <Box component="thead" sx={{ bgcolor: "background.paper", position: "sticky", top: 0 }}>
            <Box component="tr">
              {columns.map((column, index) => (
                <Typography
                  component="th"
                  key={column}
                  scope="col"
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    color: "text.secondary",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    textAlign: index === 0 ? "left" : "right",
                  }}
                >
                  {column}
                </Typography>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {visibleRows.map((row) => (
              <Box component="tr" key={row[0]} sx={{ "&:not(:last-child) td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                {row.map((value, index) => (
                  <Box
                    component="td"
                    key={columns[index]}
                    sx={{ fontSize: "0.9rem", px: 2, py: 0.9, textAlign: index === 0 ? "left" : "right" }}
                  >
                    {value}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {rows.length > previewRows ? (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 1, textAlign: "center" }}>
          <Button onClick={() => setShowAll((current) => !current)} size="small">
            {showAll ? "Show fewer rows" : `Show all ${rows.length} rows (${hiddenCount} more)`}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
