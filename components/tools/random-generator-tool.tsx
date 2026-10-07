"use client";

import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { DiceCoinPanel } from "@/components/tools/dice-coin-panel";
import { ListPickerPanel } from "@/components/tools/list-picker-panel";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { RandomNumbersPanel } from "@/components/tools/random-numbers-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import type { Uint32Source } from "@/lib/tools/generators/random";

type Mode = "numbers" | "dice" | "list";

const MODES = [
  { icon: <PlusOneIcon />, label: "Numbers", tooltip: "Random numbers from a range", value: "numbers" },
  { icon: <CasinoOutlinedIcon />, label: "Dice and coin", tooltip: "Roll dice and flip coins", value: "dice" },
  { icon: <FormatListNumberedIcon />, label: "List picker", tooltip: "Pick winners, shuffle, or make teams", value: "list" },
] as const;

interface RandomGeneratorToolProps {
  /** Supplies random numbers; replaced in tests so the results are predictable. */
  source?: Uint32Source;
}

/**
 * Random numbers, dice and coins, and a list picker for winners, shuffles, and teams, all drawn
 * with the browser's secure random numbers on this device.
 */
export function RandomGeneratorTool({ source }: RandomGeneratorToolProps = {}): ReactNode {
  const [mode, setMode] = useState<Mode>("numbers");
  const [statusMessage, setStatusMessage] = useState("");

  // Every panel stays mounted and is only hidden, so a list you typed is still there when you come back.
  return (
    <ToolWorkspace
      label="Random generator workspace"
      options={<ModeToggle label="What to generate" onChange={setMode} options={MODES} value={mode} />}
    >
      <Box hidden={mode !== "numbers"}>
        <RandomNumbersPanel onStatus={setStatusMessage} source={source} />
      </Box>
      <Box hidden={mode !== "dice"}>
        <DiceCoinPanel onStatus={setStatusMessage} source={source} />
      </Box>
      <Box hidden={mode !== "list"}>
        <ListPickerPanel onStatus={setStatusMessage} source={source} />
      </Box>
      <ToolFooter
        message={
          statusMessage ||
          "Drawn with your browser's secure random generator. Nothing is sent, saved, or logged."
        }
      />
    </ToolWorkspace>
  );
}
