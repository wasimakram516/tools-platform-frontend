import { Box, LinearProgress, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { formatCharacterCount } from "@/lib/tools/text-metrics";
import { FONT_MONO } from "@/theme/typography";
import { SURFACE_RADIUS } from "@/theme/surface";

export interface RankedCount {
  count: number;
  label: string;
  /** Share of the whole, 0 to 100. Draws a bar and a percentage when given. */
  percent?: number;
}

interface RankedCountTableProps {
  /** Shown instead of the table when there are no rows. */
  emptyMessage: string;
  /** The column heading for what is counted, such as "Word". */
  labelHeading: string;
  rows: readonly RankedCount[];
  title: string;
}

/**
 * A short ranked list of things and how many times each appears, such as the most used words.
 */
export function RankedCountTable({ emptyMessage, labelHeading, rows, title }: RankedCountTableProps): ReactNode {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 2 }}>
      <Typography component="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
          {emptyMessage}
        </Typography>
      ) : (
        <Box component="table" sx={{ borderCollapse: "collapse", width: "100%" }}>
          <Box component="thead">
            <Box component="tr" sx={{ textAlign: "left" }}>
              <Typography component="th" scope="col" sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: 600, pb: 0.5 }}>
                {labelHeading}
              </Typography>
              <Typography component="th" scope="col" sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: 600, pb: 0.5, textAlign: "right" }}>
                Count
              </Typography>
            </Box>
          </Box>
          <Box component="tbody">
            {rows.map((row) => (
              <Box component="tr" key={row.label} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                <Box component="td" sx={{ fontFamily: FONT_MONO, fontSize: "0.88rem", overflowWrap: "anywhere", py: 0.75, width: "65%" }}>
                  {row.label}
                  {row.percent !== undefined ? (
                    <LinearProgress
                      aria-hidden="true"
                      sx={{ borderRadius: 1, height: 4, mt: 0.5 }}
                      value={Math.min(row.percent, 100)}
                      variant="determinate"
                    />
                  ) : null}
                </Box>
                <Box component="td" sx={{ fontSize: "0.88rem", fontVariantNumeric: "tabular-nums", py: 0.75, textAlign: "right" }}>
                  {formatCharacterCount(row.count)}
                  {row.percent !== undefined ? (
                    <Typography component="span" color="text.secondary" sx={{ fontSize: "0.8rem", ml: 1 }}>
                      {row.percent}%
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
