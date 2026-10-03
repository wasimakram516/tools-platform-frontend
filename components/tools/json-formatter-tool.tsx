"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  MAX_JSON_INPUT_CHARACTERS,
  type JsonIndentation,
  type JsonTransformMode,
} from "@/lib/tools/json-formatter";
import {
  transformJsonInWorker,
  type JsonTransformRunner,
} from "@/lib/tools/json-formatter-worker";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { formatCharacterCount } from "@/lib/tools/text-metrics";

const EXAMPLE_JSON = '{"project":"QuicklySorted","private":true,"categories":["developer","image"]}';

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

    if (await copyToClipboard(output)) {
      setStatusMessage("Formatted JSON copied.");
      setErrorMessage(null);
    } else {
      setErrorMessage(copyBlockedMessage("result"));
    }
  }

  return (
    <ToolWorkspace
      actions={
        <>
          <Button
            disabled={isProcessing || isInputOverLimit}
            onClick={() => void runTransform("format")}
            startIcon={<FormatAlignLeftIcon />}
            variant="contained"
          >
            {isProcessing ? "Processing…" : "Format JSON"}
          </Button>
          <Button
            disabled={isProcessing || isInputOverLimit}
            onClick={() => void runTransform("minify")}
            startIcon={<UnfoldLessIcon />}
            variant="outlined"
          >
            Minify
          </Button>
        </>
      }
      label="JSON formatter workspace"
      options={
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
      }
      secondaryActions={
        <>
          <Button
            color="inherit"
            disabled={isProcessing}
            onClick={handleLoadExample}
            size="small"
            startIcon={<LightbulbOutlinedIcon />}
          >
            Load example
          </Button>
          <Button
            color="inherit"
            disabled={isProcessing}
            onClick={handleClear}
            size="small"
            startIcon={<DeleteOutlinedIcon />}
          >
            Clear
          </Button>
        </>
      }
    >
      {isProcessing ? <LinearProgress aria-label="Processing JSON" sx={{ mb: 2 }} /> : null}
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
          loading={isProcessing}
          value={output}
          placeholder="Formatted JSON appears here."
          readOnly
        />
      </Box>
      <ToolFooter
        message={statusMessage || "Paste JSON above, then format or minify it locally in your browser."}
      >
        <Button
          disabled={!output}
          onClick={handleCopy}
          startIcon={<ContentCopyIcon />}
          variant="outlined"
        >
          Copy result
        </Button>
      </ToolFooter>
    </ToolWorkspace>
  );
}
