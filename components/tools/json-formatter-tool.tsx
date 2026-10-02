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
  Typography,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import {
  MAX_JSON_INPUT_CHARACTERS,
  type JsonIndentation,
  type JsonTransformMode,
} from "@/lib/tools/json-formatter";
import {
  transformJsonInWorker,
  type JsonTransformRunner,
} from "@/lib/tools/json-formatter-worker";
import { formatCharacterCount } from "@/lib/tools/text-metrics";

const EXAMPLE_JSON = '{"project":"Tools Platform","private":true,"categories":["developer","image"]}';

interface JsonFormatterToolProps {
  maxCharacters?: number;
  transform?: JsonTransformRunner;
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
          <TextEditorPanel
            characterLimit={maxCharacters}
            id="json-input"
            label="Input"
            value={input}
            onChange={handleInputChange}
            placeholder={'Paste JSON, for example {"ready":true}'}
          />
          <TextEditorPanel
            id="json-output"
            label="Output"
            value={output}
            placeholder="Formatted JSON appears here."
            readOnly
          />
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
