"use client";

import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { NumberField } from "@/components/tools/form-fields";
import type { Uint32Source } from "@/lib/tools/generators/random";
import {
  flipCoins,
  MAX_COINS,
  MAX_DICE,
  MAX_SIDES,
  rollDice,
  type CoinResult,
  type DiceResult,
} from "@/lib/tools/generators/random-tools";
import { FONT_HEADING } from "@/theme/typography";

const DICE_PRESETS = [4, 6, 8, 10, 12, 20, 100] as const;
/** Showing thousands of flips as chips would swamp the page, so only the first are listed. */
const MAX_FLIPS_SHOWN = 100;

interface DiceCoinPanelProps {
  onStatus: (message: string) => void;
  source?: Uint32Source;
}

/**
 * Rolls dice of any size with a modifier, and flips coins, keeping the results where you can
 * see them until the next roll.
 */
export function DiceCoinPanel({ onStatus, source }: DiceCoinPanelProps): ReactNode {
  const [diceCount, setDiceCount] = useState("2");
  const [sides, setSides] = useState("6");
  const [modifier, setModifier] = useState("0");
  const [dice, setDice] = useState<DiceResult | null>(null);
  const [rolledModifier, setRolledModifier] = useState(0);
  const [coinCount, setCoinCount] = useState("1");
  const [coins, setCoins] = useState<CoinResult | null>(null);

  /**
   * Rolls the dice with the current settings.
   */
  function handleRoll(): void {
    setDice(rollDice({ count: Number(diceCount), modifier: Number(modifier), sides: Number(sides) }, source));
    setRolledModifier(Number(modifier));
    onStatus("");
  }

  /**
   * Flips the coins.
   */
  function handleFlip(): void {
    setCoins(flipCoins(Number(coinCount), source));
    onStatus("");
  }

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" } }}>
      <Stack sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, gap: 2, p: 2.5 }}>
        <Typography component="h2" sx={{ fontFamily: FONT_HEADING, fontSize: "1.2rem", fontWeight: 700 }}>
          Dice
        </Typography>
        <Stack direction="row" sx={{ gap: 1.5 }}>
          <NumberField id="dice-count" label="Dice" max={MAX_DICE} min={1} onChange={setDiceCount} value={diceCount} />
          <NumberField id="dice-sides" label="Sides" max={MAX_SIDES} min={2} onChange={setSides} value={sides} />
          <NumberField id="dice-modifier" label="Add" onChange={setModifier} value={modifier} />
        </Stack>
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
          {DICE_PRESETS.map((preset) => (
            <Chip
              color={Number(sides) === preset ? "primary" : "default"}
              key={preset}
              label={`d${preset}`}
              onClick={() => setSides(String(preset))}
              variant={Number(sides) === preset ? "filled" : "outlined"}
            />
          ))}
        </Stack>
        <Button onClick={handleRoll} startIcon={<CasinoOutlinedIcon />} sx={{ alignSelf: "flex-start" }} variant="contained">
          {dice?.ok ? "Roll again" : "Roll the dice"}
        </Button>
        {dice && !dice.ok ? <Alert severity="error">{dice.message}</Alert> : null}
        {dice?.ok ? (
          <Stack aria-label="Dice result" aria-live="polite" role="status" sx={{ gap: 1.25 }}>
            <Typography sx={{ fontFamily: FONT_HEADING, fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.1 }}>
              {dice.total}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              Total{rolledModifier === 0 ? "" : ` (the rolls ${rolledModifier > 0 ? "plus" : "minus"} ${Math.abs(rolledModifier)})`}
            </Typography>
            <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {dice.rolls.map((roll, index) => (
                <Chip key={`${index}-${roll}`} label={roll} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>

      <Stack sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, gap: 2, p: 2.5 }}>
        <Typography component="h2" sx={{ fontFamily: FONT_HEADING, fontSize: "1.2rem", fontWeight: 700 }}>
          Coin
        </Typography>
        <NumberField id="coin-count" label="Coins" max={MAX_COINS} min={1} onChange={setCoinCount} value={coinCount} />
        <Button onClick={handleFlip} startIcon={<MonetizationOnOutlinedIcon />} sx={{ alignSelf: "flex-start" }} variant="contained">
          {coins?.ok ? "Flip again" : "Flip the coin"}
        </Button>
        {coins && !coins.ok ? <Alert severity="error">{coins.message}</Alert> : null}
        {coins?.ok ? (
          <Stack aria-label="Coin result" aria-live="polite" role="status" sx={{ gap: 1.25 }}>
            <Typography sx={{ fontFamily: FONT_HEADING, fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.1 }}>
              {coins.flips.length === 1 ? coins.flips[0] : `${coins.heads} heads, ${coins.tails} tails`}
            </Typography>
            {coins.flips.length > 1 ? (
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {coins.flips.slice(0, MAX_FLIPS_SHOWN).map((side, index) => (
                  <Chip
                    color={side === "Heads" ? "primary" : "default"}
                    key={`${index}-${side}`}
                    label={side === "Heads" ? "H" : "T"}
                    size="small"
                    variant={side === "Heads" ? "filled" : "outlined"}
                  />
                ))}
                {coins.flips.length > MAX_FLIPS_SHOWN ? (
                  <Typography color="text.secondary" sx={{ alignSelf: "center", fontSize: "0.85rem" }}>
                    and {coins.flips.length - MAX_FLIPS_SHOWN} more
                  </Typography>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
