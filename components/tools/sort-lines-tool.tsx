"use client";

import ShuffleIcon from "@mui/icons-material/Shuffle";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { LiveTextTool } from "@/components/tools/live-text-tool";
import { OptionSwitch } from "@/components/tools/option-switch";
import { formatCount } from "@/lib/tools/dates/format";
import { newShuffleSeed, seededRandom, sortLines, type SortOrder } from "@/lib/tools/text/line-tools";

const ORDERS: readonly { label: string; value: SortOrder }[] = [
  { label: "A to Z", value: "ascending" },
  { label: "Z to A", value: "descending" },
  { label: "Shortest line first", value: "shortest" },
  { label: "Longest line first", value: "longest" },
  { label: "Reverse the current order", value: "reverse" },
  { label: "Shuffle randomly", value: "shuffle" },
];

/**
 * Puts a list in order, one item per line: alphabetical, by length, reversed, or shuffled, with
 * trimming, empty-line removal, and duplicate removal built in.
 */
export function SortLinesTool(): ReactNode {
  const [order, setOrder] = useState<SortOrder>("ascending");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [naturalNumbers, setNaturalNumbers] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(newShuffleSeed);
  const orderLabel = ORDERS.find((entry) => entry.value === order)?.label ?? "";

  return (
    <LiveTextTool
      example={"pear\nApple\nbanana\ncherry\nitem 10\nitem 2\nbanana"}
      idPrefix="sort-lines"
      idleMessage="Put one item on each line. The list is put in order as you type."
      inputLabel="Your list"
      inputPlaceholder="Type or paste a list, one item per line."
      options={
        <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <TextField
            id="sort-order"
            label="Sort by"
            onChange={(event) => setOrder(event.target.value as SortOrder)}
            select
            size="small"
            sx={{ minWidth: 220 }}
            value={order}
          >
            {ORDERS.map((entry) => (
              <MenuItem key={entry.value} value={entry.value}>
                {entry.label}
              </MenuItem>
            ))}
          </TextField>
          {order === "shuffle" ? (
            <Button onClick={() => setShuffleSeed(newShuffleSeed())} size="small" startIcon={<ShuffleIcon />}>
              Shuffle again
            </Button>
          ) : null}
          <OptionSwitch
            checked={caseSensitive}
            label="Match case"
            onChange={setCaseSensitive}
            tooltip="Treat a and A as different, with lower case first"
          />
          <OptionSwitch
            checked={naturalNumbers}
            label="Numbers in order"
            onChange={setNaturalNumbers}
            tooltip="Put item 2 before item 10"
          />
          <OptionSwitch
            checked={trimLines}
            label="Trim lines"
            onChange={setTrimLines}
            tooltip="Remove spaces at the start and end of every line"
          />
          <OptionSwitch checked={removeEmptyLines} label="Remove empty lines" onChange={setRemoveEmptyLines} />
          <OptionSwitch
            checked={removeDuplicates}
            label="Remove duplicates"
            onChange={setRemoveDuplicates}
            tooltip="Keep only the first of each repeated line"
          />
        </Stack>
      }
      outputLabel="Sorted list"
      outputPlaceholder="The sorted list appears here."
      transform={(text) => {
        const result = sortLines(
          text,
          { caseSensitive, naturalNumbers, order, removeDuplicates, removeEmptyLines, trimLines },
          seededRandom(shuffleSeed),
        );

        return { output: result.output, summary: `${formatCount(result.lines, "line")} sorted: ${orderLabel}.` };
      }}
      workspaceLabel="Sort lines workspace"
    />
  );
}
