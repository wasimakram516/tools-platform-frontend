"use client";

import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { LiveTextTool } from "@/components/tools/live-text-tool";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { RankedCountTable } from "@/components/tools/ranked-count-table";
import { formatCount } from "@/lib/tools/dates/format";
import { removeDuplicateLines, type DuplicateMode } from "@/lib/tools/text/line-tools";

const MODE_OPTIONS = [
  {
    icon: <DeleteSweepOutlinedIcon />,
    label: "Remove duplicates",
    tooltip: "Keep the first of each line and drop the repeats",
    value: "remove",
  },
  {
    icon: <LooksOneOutlinedIcon />,
    label: "Keep only unique lines",
    tooltip: "Keep only the lines that appear exactly once",
    value: "uniqueOnly",
  },
  {
    icon: <FileCopyOutlinedIcon />,
    label: "Keep only repeated lines",
    tooltip: "Keep one copy of each line that appears more than once",
    value: "duplicatesOnly",
  },
] as const;

/**
 * Cleans a list of repeated lines, or finds them: remove the repeats, keep only the lines that
 * appear once, or keep only the ones that repeat, with a table of the most repeated lines.
 */
export function RemoveDuplicateLinesTool(): ReactNode {
  const [mode, setMode] = useState<DuplicateMode>("remove");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);

  return (
    <LiveTextTool
      example={"apple\nbanana\nApple\ncherry\nbanana\n cherry\napple"}
      idPrefix="remove-duplicate-lines"
      idleMessage="Put one item on each line. Repeated lines are handled as you type."
      inputLabel="Your list"
      inputPlaceholder="Type or paste a list, one item per line."
      options={
        <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <ModeToggle label="What to keep" onChange={setMode} options={MODE_OPTIONS} value={mode} />
          <OptionSwitch
            checked={caseSensitive}
            label="Match case"
            onChange={setCaseSensitive}
            tooltip="Treat Apple and apple as different lines"
          />
          <OptionSwitch
            checked={trimWhitespace}
            label="Ignore spaces at the ends"
            onChange={setTrimWhitespace}
            tooltip="Treat ' apple' and 'apple' as the same line"
          />
          <OptionSwitch checked={removeEmptyLines} label="Remove empty lines" onChange={setRemoveEmptyLines} />
        </Stack>
      }
      outputLabel={mode === "remove" ? "List without duplicates" : "Resulting list"}
      outputPlaceholder="The cleaned list appears here."
      transform={(text) => {
        const result = removeDuplicateLines(text, { caseSensitive, mode, removeEmptyLines, trimWhitespace });

        return {
          details: (
            <RankedCountTable
              emptyMessage="No line appears more than once."
              labelHeading="Line"
              rows={result.repeated.map((entry) => ({ count: entry.count, label: entry.line }))}
              title="Most repeated lines"
            />
          ),
          output: result.output,
          summary: `${formatCount(result.removed, "line")} removed, ${formatCount(result.kept, "line")} kept.`,
        };
      }}
      workspaceLabel="Remove duplicate lines workspace"
    />
  );
}
