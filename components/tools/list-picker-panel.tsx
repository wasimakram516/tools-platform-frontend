"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import type { Uint32Source } from "@/lib/tools/generators/random";
import {
  MAX_LIST_ITEMS,
  parseList,
  pickFromList,
  shuffleList,
  splitIntoTeams,
  type ListResult,
  type TeamsResult,
} from "@/lib/tools/generators/random-tools";
import { FONT_HEADING } from "@/theme/typography";

type Action = "pick" | "shuffle" | "teams";
type SplitBy = "teams" | "size";

const ACTIONS = [
  { icon: <EmojiEventsOutlinedIcon />, label: "Pick winners", tooltip: "Choose one or more items at random", value: "pick" },
  { icon: <ShuffleIcon />, label: "Shuffle", tooltip: "Put the list in a random order", value: "shuffle" },
  { icon: <GroupsOutlinedIcon />, label: "Make teams", tooltip: "Split the list into fair teams", value: "teams" },
] as const;

const SPLIT_OPTIONS = [
  { label: "Number of teams", tooltip: "Say how many teams you want", value: "teams" },
  { label: "Team size", tooltip: "Say how many people go in each team", value: "size" },
] as const;

const MAX_LIST_CHARACTERS = 200_000;

interface ListPickerPanelProps {
  onStatus: (message: string) => void;
  source?: Uint32Source;
}

/**
 * Picks winners from a list of names, shuffles it, or splits it into fair teams, using the
 * browser's secure random numbers.
 */
export function ListPickerPanel({ onStatus, source }: ListPickerPanelProps): ReactNode {
  const [text, setText] = useState("");
  const [action, setAction] = useState<Action>("pick");
  const [winners, setWinners] = useState("1");
  const [splitBy, setSplitBy] = useState<SplitBy>("teams");
  const [splitAmount, setSplitAmount] = useState("2");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [list, setList] = useState<ListResult | null>(null);
  const [teams, setTeams] = useState<TeamsResult | null>(null);
  const items = parseList(text, { removeDuplicates });

  /**
   * Runs the chosen action on the list as it stands now.
   */
  function handleRun(): void {
    const amount = Number(action === "pick" ? winners : splitAmount);

    setList(null);
    setTeams(null);
    onStatus("");

    if (action === "pick") {
      setList(pickFromList(items, amount, source));
    } else if (action === "shuffle") {
      setList(shuffleList(items, source));
    } else {
      setTeams(splitIntoTeams(items, splitBy === "teams" ? { by: "teams", teams: amount } : { by: "size", size: amount }, source));
    }
  }

  /**
   * Copies the result as plain text.
   */
  async function handleCopy(): Promise<void> {
    const lines = teams?.ok
      ? teams.teams.map((team, index) => `Team ${index + 1}: ${team.join(", ")}`)
      : list?.ok
        ? list.items
        : [];

    onStatus((await copyToClipboard(lines.join("\n"))) ? "Result copied." : copyBlockedMessage("result"));
  }

  const hasResult = Boolean((list && list.ok) || (teams && teams.ok));
  const failure = list && !list.ok ? list.message : teams && !teams.ok ? teams.message : null;

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" } }}>
      <Stack sx={{ gap: 2 }}>
        <TextEditorPanel
          characterLimit={MAX_LIST_CHARACTERS}
          id="list-picker-input"
          label="Your list"
          onChange={(event) => setText(event.target.value)}
          placeholder="One name or item per line."
          value={text}
        />
        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
          {items.length.toLocaleString("en-US")} {items.length === 1 ? "item" : "items"}
          {items.length > MAX_LIST_ITEMS ? ` (the limit is ${MAX_LIST_ITEMS.toLocaleString("en-US")})` : ""}
        </Typography>
      </Stack>

      <Stack sx={{ gap: 2 }}>
        <ModeToggle label="What to do with the list" onChange={setAction} options={ACTIONS} value={action} />
        {action === "pick" ? (
          <NumberField id="list-winners" label="How many winners" min={1} onChange={setWinners} value={winners} />
        ) : null}
        {action === "teams" ? (
          <>
            <ModeToggle fullWidth label="Split by" onChange={setSplitBy} options={SPLIT_OPTIONS} value={splitBy} />
            <NumberField
              id="list-split-amount"
              label={splitBy === "teams" ? "Number of teams" : "People in each team"}
              min={1}
              onChange={setSplitAmount}
              value={splitAmount}
            />
          </>
        ) : null}
        <OptionSwitch
          checked={removeDuplicates}
          label="Ignore repeated names"
          onChange={setRemoveDuplicates}
          tooltip="Counts Ann and ann as one entry"
        />
        <Button onClick={handleRun} startIcon={hasResult ? <RefreshIcon /> : undefined} sx={{ alignSelf: "flex-start" }} variant="contained">
          {hasResult ? "Again" : action === "pick" ? "Pick" : action === "shuffle" ? "Shuffle" : "Make teams"}
        </Button>

        {failure ? <Alert severity="error">{failure}</Alert> : null}

        {list?.ok ? (
          <Box aria-label="Result" component="ol" role="group" sx={{ m: 0, pl: 3 }}>
            {list.items.map((item, index) => (
              <Typography component="li" key={`${index}-${item}`} sx={{ fontSize: "1.05rem", py: 0.25 }}>
                {item}
              </Typography>
            ))}
          </Box>
        ) : null}

        {teams?.ok ? (
          <Box aria-label="Teams" role="group" sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
            {teams.teams.map((team, index) => (
              <Box key={index} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, p: 2 }}>
                <Typography component="h3" sx={{ fontFamily: FONT_HEADING, fontSize: "1rem", fontWeight: 700 }}>
                  Team {index + 1} ({team.length})
                </Typography>
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
                  {team.map((person, personIndex) => (
                    <li key={`${personIndex}-${person}`}>{person}</li>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}

        {hasResult ? (
          <Button color="inherit" onClick={() => void handleCopy()} startIcon={<ContentCopyIcon />} sx={{ alignSelf: "flex-start" }}>
            Copy result
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
