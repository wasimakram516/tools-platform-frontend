"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import {
  MAX_JSON_INPUT_CHARACTERS,
  type JsonIndentation,
  type JsonTransformMode,
} from "@/lib/tools/json-formatter";
import {
  transformJsonInWorker,
  type JsonTransformRunner,
} from "@/lib/tools/json-formatter-worker";

const EXAMPLE_JSON = '{"project":"Tools Platform","private":true,"categories":["developer","image"]}';
const CHARACTER_COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const CHARACTER_LIMIT_WARNING_RATIO = 0.8;

interface JsonPanelProps {
  characterLimit?: number;
  label: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readOnly?: boolean;
}

interface JsonFormatterToolProps {
  maxCharacters?: number;
  transform?: JsonTransformRunner;
}

/**
 * Formats a character count with stable thousands separators.
 */
function formatCharacterCount(count: number): string {
  return CHARACTER_COUNT_FORMATTER.format(count);
}

/**
 * Renders one side of the JSON input/output workspace.
 */
function JsonPanel({
  characterLimit,
  label,
  value,
  onChange,
  readOnly = false,
}: JsonPanelProps): ReactNode {
  const characterCount = value.length;
  const isOverLimit = characterLimit !== undefined && characterCount > characterLimit;
  const isNearLimit =
    characterLimit !== undefined && characterCount / characterLimit >= CHARACTER_LIMIT_WARNING_RATIO;
  const remainingCharacters = characterLimit === undefined ? 0 : characterLimit - characterCount;
  const usagePercentage =
    characterLimit === undefined ? 0 : Math.min((characterCount / characterLimit) * 100, 100);
  const countDescriptionId = `${label.toLowerCase()}-character-count`;
  const limitStatus = isOverLimit
    ? `${formatCharacterCount(Math.abs(remainingCharacters))} over limit`
    : `${formatCharacterCount(remainingCharacters)} remaining`;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ alignItems: { sm: "baseline" }, gap: { xs: 0.25, sm: 1 }, justifyContent: "space-between", mb: 1 }}
      >
        <Typography
          component="label"
          htmlFor={label === "Input" ? "json-input" : "json-output"}
          sx={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          id={countDescriptionId}
          color={isOverLimit ? "error.main" : isNearLimit ? "warning.dark" : "text.secondary"}
          sx={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.74rem",
            fontVariantNumeric: "tabular-nums",
            fontWeight: isNearLimit ? 700 : 500,
          }}
        >
          {formatCharacterCount(characterCount)} {characterCount === 1 ? "character" : "characters"}
          {characterLimit === undefined ? "" : ` · ${limitStatus}`}
        </Typography>
      </Stack>
      {characterLimit === undefined ? null : (
        <LinearProgress
          aria-label={`Input character limit: ${limitStatus}`}
          color={isOverLimit ? "error" : isNearLimit ? "warning" : "primary"}
          value={usagePercentage}
          variant="determinate"
          sx={{ height: 3, mb: 1 }}
        />
      )}
      <TextField
        id={label === "Input" ? "json-input" : "json-output"}
        multiline
        rows={16}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={readOnly ? "Formatted JSON appears here." : 'Paste JSON, for example {"ready":true}'}
        slotProps={{
          htmlInput: {
            "aria-describedby": countDescriptionId,
            "aria-invalid": isOverLimit || undefined,
            readOnly,
            spellCheck: false,
            sx: {
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.86rem",
              lineHeight: 1.65,
            },
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            alignItems: "start",
            bgcolor: readOnly ? "grey.50" : "common.white",
          },
        }}
      />
    </Box>
  );
}

/**
 * Provides the interactive JSON format, minify, validate, copy, example, and clear workflow.
 */
export function JsonFormatterTool({
  maxCharacters = MAX_JSON_INPUT_CHARACTERS,
  transform = transformJsonInWorker,
}: JsonFormatterToolProps = {}): ReactNode {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentation, setIndentation] = useState<JsonIndentation>(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const charactersOverLimit = Math.max(input.length - maxCharacters, 0);
  const isInputOverLimit = charactersOverLimit > 0;
  const limitErrorMessage = isInputOverLimit
    ? `Input is ${formatCharacterCount(charactersOverLimit)} ${
        charactersOverLimit === 1 ? "character" : "characters"
      } over the ${formatCharacterCount(maxCharacters)}-character limit. Remove some content or split it into smaller JSON documents.`
    : null;
  const visibleErrorMessage = limitErrorMessage ?? errorMessage;

  /**
   * Applies the selected JSON transformation and updates the visible result.
   */
  async function runTransform(mode: JsonTransformMode): Promise<void> {
    if (isInputOverLimit) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(mode === "format" ? "Formatting JSON in a local worker…" : "Minifying JSON in a local worker…");

    try {
      const result = await transform(input, mode, indentation);

      if (!result.ok) {
        const location =
          result.line && result.column ? ` Line ${result.line}, column ${result.column}.` : "";
        setErrorMessage(`${result.message}${location}`);
        setOutput("");
        setStatusMessage("");
        return;
      }

      setOutput(result.output);
      setErrorMessage(null);
      setStatusMessage(
        mode === "format"
          ? `Valid JSON · ${formatCharacterCount(result.characterCount)} formatted characters`
          : `Valid JSON · ${formatCharacterCount(result.characterCount)} minified characters`,
      );
    } catch (error: unknown) {
      setOutput("");
      setStatusMessage("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Local JSON processing failed. Reload the page and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * Updates the source input and clears stale validation messages.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setInput(event.target.value);
    setErrorMessage(null);
    setStatusMessage("");
  }

  /**
   * Updates the selected output indentation.
   */
  function handleIndentationChange(value: string | number): void {
    setIndentation(Number(value) === 4 ? 4 : 2);
  }

  /**
   * Loads a realistic sample without running a transformation automatically.
   */
  function handleLoadExample(): void {
    setInput(EXAMPLE_JSON);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Example loaded. Choose Format JSON to process it.");
  }

  /**
   * Clears the full workspace.
   */
  function handleClear(): void {
    setInput("");
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Workspace cleared.");
  }

  /**
   * Copies the current result and reports clipboard failures safely.
   */
  async function handleCopy(): Promise<void> {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setStatusMessage("Formatted JSON copied.");
      setErrorMessage(null);
    } catch {
      setErrorMessage("Copy was blocked by the browser. Select the result and copy it manually.");
    }
  }

  return (
    <Paper
      component="section"
      aria-label="JSON formatter workspace"
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          bgcolor: "grey.50",
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1,
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button
            disabled={isProcessing || isInputOverLimit}
            onClick={() => void runTransform("format")}
            variant="contained"
          >
            {isProcessing ? "Processing…" : "Format JSON"}
          </Button>
          <Button
            disabled={isProcessing || isInputOverLimit}
            onClick={() => void runTransform("minify")}
            variant="outlined"
          >
            Minify
          </Button>
          <Button disabled={isProcessing} onClick={handleLoadExample} color="inherit">
            Load example
          </Button>
          <Button disabled={isProcessing} onClick={handleClear} color="inherit">
            Clear
          </Button>
        </Stack>
        <FormControl size="small" sx={{ minWidth: 126 }}>
          <InputLabel id="indentation-label">Indent</InputLabel>
          <Select
            labelId="indentation-label"
            label="Indent"
            value={indentation}
            disabled={isProcessing}
            onChange={(event) => handleIndentationChange(event.target.value)}
          >
            <MenuItem value={2}>2 spaces</MenuItem>
            <MenuItem value={4}>4 spaces</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isProcessing ? <LinearProgress aria-label="Processing JSON" /> : null}

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        {visibleErrorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {visibleErrorMessage}
          </Alert>
        ) : null}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          <JsonPanel
            characterLimit={maxCharacters}
            label="Input"
            value={input}
            onChange={handleInputChange}
          />
          <JsonPanel label="Output" value={output} readOnly />
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "center" }, gap: 1.5, justifyContent: "space-between", mt: 2 }}
        >
          <Typography role="status" aria-live="polite" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
            {statusMessage || "Paste JSON above, then format or minify it locally in your browser."}
          </Typography>
          <Button disabled={!output} onClick={handleCopy} variant="outlined">
            Copy result
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
