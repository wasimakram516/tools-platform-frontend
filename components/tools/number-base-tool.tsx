"use client";

import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import NumbersIcon from "@mui/icons-material/Numbers";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TranslateIcon from "@mui/icons-material/Translate";
import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { ConverterDirectionToggle, ConverterHelpers, ConverterPanes } from "@/components/tools/converter-tool";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { ToolbarSelect, type ToolbarSelectOption } from "@/components/tools/converter-options";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { useConverter, type ConverterDirection } from "@/components/tools/use-converter";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import type { DataConversionResult } from "@/lib/tools/data/csv-json";
import {
  bitLength,
  bytesToText,
  COMMON_BASES,
  formatInteger,
  fromRoman,
  groupDigits,
  MAX_BASE,
  MIN_BASE,
  parseInteger,
  textToBytes,
  toRoman,
  type ByteBase,
} from "@/lib/tools/data/number-bases";

type Panel = "bases" | "bytes" | "roman";
type BytesMode = "textToBytes" | "bytesToText";

const DEFAULT_FROM_BASE = 10;
const DEFAULT_OTHER_BASE = 36;
const ROMAN_PATTERN_DIGITS = /^\d+$/;

/** Names for the bases people know, and plain numbers for the rest. */
const BASE_OPTIONS: readonly ToolbarSelectOption<number>[] = Array.from({ length: MAX_BASE - MIN_BASE + 1 }, (_, index) => {
  const base = index + MIN_BASE;
  const name = COMMON_BASES.find((entry) => entry.base === base)?.label;

  return { label: name ? `${name} (${base})` : `Base ${base}`, value: base };
});

const BYTE_BASE_OPTIONS: readonly ToolbarSelectOption<ByteBase>[] = COMMON_BASES.map((entry) => ({
  label: entry.label,
  value: entry.base,
}));

const SEPARATORS: Readonly<Record<string, string>> = { comma: ",", commaSpace: ", ", newline: "\n", none: "", space: " " };
const SEPARATOR_OPTIONS: readonly ToolbarSelectOption<string>[] = [
  { label: "Space", value: "space" },
  { label: "Comma", value: "comma" },
  { label: "Comma and space", value: "commaSpace" },
  { label: "New line", value: "newline" },
  { label: "None", value: "none" },
];

const BYTE_DIRECTIONS: readonly [ConverterDirection<BytesMode>, ConverterDirection<BytesMode>] = [
  {
    example: "Hello, QuicklySorted! €",
    fileName: "bytes.txt",
    icon: <TextFieldsIcon fontSize="small" />,
    inputLabel: "Text",
    inputPlaceholder: "Type or paste text.",
    label: "Text to bytes",
    mime: "text/plain",
    outputLabel: "Bytes",
    outputPlaceholder: "The bytes appear here.",
    tooltip: "Write text as the bytes it is stored as",
    value: "textToBytes",
  },
  {
    example: "48 65 6c 6c 6f 2c 20 e2 82 ac",
    fileName: "text.txt",
    icon: <TranslateIcon fontSize="small" />,
    inputLabel: "Bytes",
    inputPlaceholder: "Paste bytes, such as 48 65 6c 6c 6f.",
    label: "Bytes to text",
    mime: "text/plain",
    outputLabel: "Text",
    outputPlaceholder: "The text appears here.",
    tooltip: "Read bytes back into text",
    value: "bytesToText",
  },
];

/**
 * Three small converters in one place: whole numbers between any bases from 2 to 36, text to
 * and from its bytes in binary, octal, decimal, or hexadecimal, and Roman numerals.
 */
export function NumberBaseTool(): ReactNode {
  const [panel, setPanel] = useState<Panel>("bases");
  const [status, setStatus] = useState("");

  const [numberText, setNumberText] = useState("");
  const [fromBase, setFromBase] = useState(DEFAULT_FROM_BASE);
  const [otherBase, setOtherBase] = useState(DEFAULT_OTHER_BASE);
  const [group, setGroup] = useState(false);

  const [byteBase, setByteBase] = useState<ByteBase>(16);
  const [separatorId, setSeparatorId] = useState("space");
  const [padded, setPadded] = useState(true);
  const [uppercase, setUppercase] = useState(false);

  const [romanText, setRomanText] = useState("");

  const converter = useConverter<BytesMode>({
    convert: (input, mode): DataConversionResult => {
      const result =
        mode === "textToBytes"
          ? textToBytes(input, byteBase, SEPARATORS[separatorId] ?? " ", padded, uppercase)
          : bytesToText(input, byteBase);

      if (!result.ok) {
        return result;
      }

      const count = mode === "textToBytes" ? new TextEncoder().encode(input).length : Array.from(result.output).length;

      return {
        ok: true,
        output: result.output,
        summary: mode === "textToBytes" ? `${count} ${count === 1 ? "byte" : "bytes"}.` : `${count} ${count === 1 ? "character" : "characters"}.`,
      };
    },
    directions: BYTE_DIRECTIONS,
  });

  /**
   * Copies one value and notes it for assistive technology.
   */
  async function copyValue(value: string, label: string): Promise<void> {
    setStatus((await copyToClipboard(value)) ? `${label} copied.` : copyBlockedMessage(label.toLowerCase()));
  }

  /**
   * Switches between the three converters.
   */
  function changePanel(next: Panel): void {
    setPanel(next);
    setStatus("");
  }

  const parsed = numberText.trim() === "" ? null : parseInteger(numberText, fromBase);
  const rows = parsed?.ok
    ? [
        ...COMMON_BASES.map((entry) => ({ base: entry.base, title: `${entry.label} (base ${entry.base})` })),
        ...(COMMON_BASES.some((entry) => entry.base === otherBase) ? [] : [{ base: otherBase, title: `Base ${otherBase}` }]),
      ].map((row) => {
        const digits = formatInteger(parsed.value, row.base);

        return { ...row, text: group ? groupDigits(digits, row.base === 10 ? 3 : row.base === 8 ? 3 : 4, row.base === 10 ? "," : " ") : digits };
      })
    : [];
  const trimmedRoman = romanText.trim();
  const roman =
    trimmedRoman === ""
      ? null
      : ROMAN_PATTERN_DIGITS.test(trimmedRoman)
        ? toRoman(Number(trimmedRoman))
        : (() => {
            const value = fromRoman(trimmedRoman);

            return value.ok ? ({ ok: true, output: String(value.value) } as const) : value;
          })();

  return (
    <ToolWorkspace
      label="Number base converter workspace"
      options={
        <>
          <ModeToggle
            label="What to convert"
            onChange={changePanel}
            options={[
              { icon: <NumbersIcon fontSize="small" />, label: "Number bases", tooltip: "Binary, octal, decimal, hexadecimal, and more", value: "bases" },
              { icon: <TextFieldsIcon fontSize="small" />, label: "Text and bytes", tooltip: "Text as binary, hex, or decimal bytes", value: "bytes" },
              { icon: <ArrowRightAltIcon fontSize="small" />, label: "Roman numerals", tooltip: "Numbers to Roman numerals and back", value: "roman" },
            ]}
            value={panel}
          />
          {panel === "bases" ? (
            <>
              <ToolbarSelect id="base-from" label="From base" onChange={setFromBase} options={BASE_OPTIONS} value={fromBase} />
              <ToolbarSelect id="base-other" label="Also show base" onChange={setOtherBase} options={BASE_OPTIONS} value={otherBase} />
              <OptionSwitch checked={group} label="Group digits" onChange={setGroup} tooltip="Split long numbers into groups, so they are easier to read" />
            </>
          ) : null}
          {panel === "bytes" ? (
            <>
              <ConverterDirectionToggle directions={BYTE_DIRECTIONS} state={converter} toggleLabel="Conversion direction" />
              <ToolbarSelect id="byte-base" label="Bytes in" onChange={setByteBase} options={BYTE_BASE_OPTIONS} value={byteBase} />
              {converter.mode === "textToBytes" ? (
                <>
                  <ToolbarSelect id="byte-separator" label="Separator" onChange={setSeparatorId} options={SEPARATOR_OPTIONS} value={separatorId} />
                  <OptionSwitch checked={padded} label="Pad to full width" onChange={setPadded} tooltip="Write every byte with the same number of digits, such as 01000001" />
                  {byteBase === 16 ? <OptionSwitch checked={uppercase} label="Capital letters" onChange={setUppercase} /> : null}
                </>
              ) : null}
            </>
          ) : null}
        </>
      }
      secondaryActions={panel === "bytes" ? <ConverterHelpers state={converter} /> : undefined}
    >
      {panel === "bases" ? (
        <Stack sx={{ gap: 2 }}>
          <TextField
            error={parsed !== null && !parsed.ok}
            fullWidth
            helperText={parsed && !parsed.ok ? parsed.message : "Whole numbers of any size, with an optional minus sign. Prefixes such as 0x are fine."}
            id="base-number"
            label="Number"
            onChange={(event) => setNumberText(event.target.value)}
            placeholder="255"
            slotProps={{ htmlInput: { autoComplete: "off", maxLength: 10_000, spellCheck: false }, inputLabel: { shrink: true } }}
            value={numberText}
          />
          {parsed?.ok ? (
            <>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
                {rows.map((row) => (
                  <CopyableValueRow
                    id={`base-${row.base}`}
                    key={row.base}
                    onCopy={() => void copyValue(row.text, row.title)}
                    title={row.title}
                    value={row.text}
                  />
                ))}
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
                This number needs {bitLength(parsed.value)} {bitLength(parsed.value) === 1 ? "bit" : "bits"}.
              </Typography>
            </>
          ) : null}
          <ToolFooter message={status || "Type a number and read it in every base."} />
        </Stack>
      ) : null}

      {panel === "bytes" ? (
        <ConverterPanes
          idleMessage="Type text, or paste bytes, and the result appears here. Text is stored as UTF-8, so a symbol such as € takes three bytes."
          idPrefix="number-bytes"
          state={converter}
        />
      ) : null}

      {panel === "roman" ? (
        <Stack sx={{ gap: 2 }}>
          <TextField
            error={roman !== null && !roman.ok}
            fullWidth
            helperText={roman && !roman.ok ? roman.message : "Type a number from 1 to 3999, or a Roman numeral such as MCMXCIV."}
            id="roman-input"
            label="Number or Roman numeral"
            onChange={(event) => setRomanText(event.target.value)}
            placeholder="1994"
            slotProps={{ htmlInput: { autoComplete: "off", maxLength: 40, spellCheck: false }, inputLabel: { shrink: true } }}
            value={romanText}
          />
          {roman?.ok ? (
            <CopyableValueRow
              id="roman-result"
              onCopy={() => void copyValue(roman.output, ROMAN_PATTERN_DIGITS.test(trimmedRoman) ? "Roman numeral" : "Number")}
              title={ROMAN_PATTERN_DIGITS.test(trimmedRoman) ? "Roman numeral" : "Number"}
              value={roman.output}
            />
          ) : roman === null ? (
            <Alert severity="info" variant="outlined">
              Roman numerals in their standard form run from I (1) to MMMCMXCIX (3,999).
            </Alert>
          ) : null}
          <ToolFooter message={status || "The result appears as you type."} />
        </Stack>
      ) : null}
    </ToolWorkspace>
  );
}
