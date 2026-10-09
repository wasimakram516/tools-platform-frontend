"use client";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Alert, Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { DecimalField } from "@/components/tools/calculator-fields";
import { ToolbarSelect } from "@/components/tools/converter-options";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { parseDecimal } from "@/lib/tools/calculators/format";
import { convertUnit, formatQuantity, getUnitCategory, UNIT_CATEGORIES } from "@/lib/tools/data/units";
import { SURFACE_RADIUS } from "@/theme/surface";

const DEFAULT_CATEGORY = "length";
const DEFAULT_VALUE = "1";

const CATEGORY_OPTIONS = UNIT_CATEGORIES.map((category) => ({ label: category.name, value: category.id }));

/**
 * Converts a value between units of length, weight, temperature, area, volume, speed, time, and
 * data storage. It shows the chosen conversion and the value in every other unit of the category.
 */
export function UnitConverterTool(): ReactNode {
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY);
  const category = getUnitCategory(categoryId) ?? UNIT_CATEGORIES[0];
  const [valueText, setValueText] = useState(DEFAULT_VALUE);
  const [fromId, setFromId] = useState(category?.defaultFrom ?? "");
  const [toId, setToId] = useState(category?.defaultTo ?? "");
  const [status, setStatus] = useState("");

  if (!category) {
    return null;
  }

  const unitOptions = category.units.map((unit) => ({ label: `${unit.name} (${unit.symbol})`, value: unit.id }));
  const value = parseDecimal(valueText);
  const from = category.units.find((unit) => unit.id === fromId);
  const to = category.units.find((unit) => unit.id === toId);
  const main = value === null ? null : convertUnit(category.id, value, fromId, toId);
  const everyUnit =
    value === null || !from
      ? []
      : category.units
          .filter((unit) => unit.id !== fromId)
          .map((unit) => ({ result: convertUnit(category.id, value, fromId, unit.id), unit }));

  /**
   * Opens another category on its default units.
   */
  function changeCategory(nextId: string): void {
    const next = getUnitCategory(nextId);

    if (next) {
      setCategoryId(next.id);
      setFromId(next.defaultFrom);
      setToId(next.defaultTo);
      setStatus("");
    }
  }

  /**
   * Swaps the two units.
   */
  function swapUnits(): void {
    setFromId(toId);
    setToId(fromId);
  }

  /**
   * Puts the category, the value, and the units back to how they started.
   */
  function reset(): void {
    setValueText(DEFAULT_VALUE);
    changeCategory(DEFAULT_CATEGORY);
  }

  /**
   * Copies the main answer as a number.
   */
  async function copyAnswer(): Promise<void> {
    if (main?.ok) {
      setStatus((await copyToClipboard(formatQuantity(main.value).replaceAll(",", ""))) ? "Result copied." : copyBlockedMessage("result"));
    }
  }

  return (
    <ToolWorkspace
      label="Unit converter workspace"
      options={<ToolbarSelect id="unit-category" label="Category" onChange={changeCategory} options={CATEGORY_OPTIONS} value={category.id} />}
      secondaryActions={<ResetButton onClick={reset} />}
    >
      <Stack sx={{ gap: 2.5 }}>
        <Box sx={{ alignItems: "center", display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1.3fr) auto minmax(0, 1.3fr)" } }}>
          <DecimalField id="unit-value" label="Value" onChange={setValueText} value={valueText} />
          <ToolbarSelect id="unit-from" label="From" minWidth={0} onChange={setFromId} options={unitOptions} value={fromId} />
          <Tooltip arrow describeChild title="Swap the two units">
            <Button aria-label="Swap units" color="inherit" onClick={swapUnits} sx={{ justifySelf: "center", minWidth: 44 }}>
              <SwapHorizIcon />
            </Button>
          </Tooltip>
          <ToolbarSelect id="unit-to" label="To" minWidth={0} onChange={setToId} options={unitOptions} value={toId} />
        </Box>

        {main && !main.ok ? <Alert severity="error">{main.message}</Alert> : null}

        {main?.ok && from && to ? (
          <Box
            aria-label="Conversion result"
            aria-live="polite"
            role="status"
            sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: SURFACE_RADIUS, p: { xs: 2, md: 2.5 } }}
          >
            <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
              {formatQuantity(value ?? 0)} {from.symbol} equals
            </Typography>
            <Typography component="p" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere" }}>
              {formatQuantity(main.value)} {to.symbol}
            </Typography>
            <Button onClick={() => void copyAnswer()} size="small" sx={{ mt: 1 }} variant="outlined">
              Copy result
            </Button>
          </Box>
        ) : null}

        {everyUnit.length > 0 ? (
          <Box component="section" aria-label={`${formatQuantity(value ?? 0)} ${from?.symbol ?? ""} in every ${category.name.toLowerCase()} unit`}>
            <Typography component="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1 }}>
              The same value in every unit
            </Typography>
            <Box component="ul" sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, listStyle: "none", m: 0, p: 0 }}>
              {everyUnit.map(({ result, unit }) => (
                <Box
                  component="li"
                  key={unit.id}
                  sx={{
                    alignItems: "baseline",
                    bgcolor: unit.id === toId ? "action.selected" : "transparent",
                    border: "1px solid",
                    borderColor: unit.id === toId ? "primary.main" : "divider",
                    borderRadius: SURFACE_RADIUS,
                    display: "flex",
                    gap: 1,
                    justifyContent: "space-between",
                    px: 1.75,
                    py: 1,
                  }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
                    {unit.name}
                  </Typography>
                  <Typography sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, overflowWrap: "anywhere", textAlign: "right" }}>
                    {result.ok ? `${formatQuantity(result.value)} ${unit.symbol}` : "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        <ToolFooter message={status || category.note || "Type a value, choose two units, and read the result as you type."} />
      </Stack>
    </ToolWorkspace>
  );
}
