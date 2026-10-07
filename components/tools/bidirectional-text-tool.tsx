"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { formatCharacterCount } from "@/lib/tools/text-metrics";

export interface TextTransformSuccess {
  ok: true;
  output: string;
  characterCount: number;
}

export interface TextTransformFailure {
  ok: false;
  message: string;
}

export type TextTransformResult = TextTransformSuccess | TextTransformFailure;

export interface TextConversionDirection<Mode extends string> {
  mode: Mode;
  toggleLabel: string;
  toggleIcon?: ReactNode;
  actionLabel: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  outputPlaceholder: string;
  example: string;
  processingMessage: string;
  successVerb: string;
}

export type TextTransformRunner<Mode extends string> = (
  input: string,
  mode: Mode,
) => Promise<TextTransformResult>;

interface BidirectionalTextToolProps<Mode extends string> {
  directions: readonly [TextConversionDirection<Mode>, TextConversionDirection<Mode>];
  idleMessage: string;
  inputIdPrefix: string;
  maxCharacters: number;
  progressLabel: string;
  transform: TextTransformRunner<Mode>;
  workspaceLabel: string;
}

/**
 * Renders a reusable two-way text converter with local-processing feedback.
 */
export function BidirectionalTextTool<Mode extends string>({
  directions,
  idleMessage,
  inputIdPrefix,
  maxCharacters,
  progressLabel,
  transform,
  workspaceLabel,
}: BidirectionalTextToolProps<Mode>): ReactNode {
  const [mode, setMode] = useState<Mode>(directions[0].mode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const activeDirection = directions.find((direction) => direction.mode === mode) ?? directions[0];
  const reverseDirection = directions.find((direction) => direction.mode !== mode) ?? directions[1];
  const charactersOverLimit = Math.max(input.length - maxCharacters, 0);
  const isInputOverLimit = charactersOverLimit > 0;
  const limitErrorMessage = isInputOverLimit
    ? `Input is ${formatCharacterCount(charactersOverLimit)} ${
        charactersOverLimit === 1 ? "character" : "characters"
      } over the ${formatCharacterCount(maxCharacters)}-character limit. Remove some content before processing.`
    : null;
  const visibleErrorMessage = limitErrorMessage ?? errorMessage;

  /** Updates the conversion mode and clears stale output. */
  function handleModeChange(nextMode: Mode): void {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("");
  }

  /** Updates the source text and clears stale feedback. */
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setInput(event.target.value);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("");
  }

  /** Runs the selected conversion outside the browser's main thread. */
  async function handleTransform(): Promise<void> {
    if (isInputOverLimit) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(activeDirection.processingMessage);

    try {
      const result = await transform(input, mode);

      if (!result.ok) {
        setOutput("");
        setErrorMessage(result.message);
        setStatusMessage("");
        return;
      }

      setOutput(result.output);
      setStatusMessage(
        `${activeDirection.successVerb} successfully · ${formatCharacterCount(
          result.characterCount,
        )} output characters`,
      );
    } catch (error: unknown) {
      setOutput("");
      setStatusMessage("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Local processing failed. Reload the page and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  /** Loads a mode-appropriate example without processing automatically. */
  function handleLoadExample(): void {
    setInput(activeDirection.example);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Example loaded. Choose the primary action to process it.");
  }

  /** Moves the current result into the input and selects the inverse operation. */
  function handleUseResult(): void {
    if (!output) {
      return;
    }

    setInput(output);
    setOutput("");
    setMode(reverseDirection.mode);
    setErrorMessage(null);
    setStatusMessage("Result moved to input and conversion direction reversed.");
  }

  /** Clears all text and feedback while preserving the selected mode. */
  function handleClear(): void {
    setInput("");
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Workspace cleared.");
  }

  /** Copies the current result and reports browser permission failures. */
  async function handleCopy(): Promise<void> {
    if (!output) {
      return;
    }

    if (await copyToClipboard(output)) {
      setStatusMessage("Result copied.");
      setErrorMessage(null);
    } else {
      setErrorMessage(copyBlockedMessage("result"));
    }
  }

  return (
    <ToolWorkspace
      actions={
        <Button
          disabled={isProcessing || isInputOverLimit}
          onClick={() => void handleTransform()}
          startIcon={<PlayArrowIcon />}
          variant="contained"
        >
          {isProcessing ? "Processing…" : activeDirection.actionLabel}
        </Button>
      }
      label={workspaceLabel}
      options={
        <ModeToggle
          label={`${workspaceLabel} direction`}
          onChange={handleModeChange}
          options={directions.map((direction) => ({
            icon: direction.toggleIcon,
            label: direction.toggleLabel,
            tooltip: direction.actionLabel,
            value: direction.mode,
          }))}
          value={mode}
        />
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
            disabled={isProcessing || !output}
            onClick={handleUseResult}
            size="small"
            startIcon={<SwapHorizIcon />}
          >
            Use result as input
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
      {isProcessing ? <LinearProgress aria-label={progressLabel} sx={{ mb: 2 }} /> : null}
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
          id={`${inputIdPrefix}-input`}
          label={activeDirection.inputLabel}
          value={input}
          onChange={handleInputChange}
          placeholder={activeDirection.inputPlaceholder}
        />
        <TextEditorPanel
          id={`${inputIdPrefix}-output`}
          label={activeDirection.outputLabel}
          loading={isProcessing}
          value={output}
          placeholder={activeDirection.outputPlaceholder}
          readOnly
        />
      </Box>
      <ToolFooter message={statusMessage || idleMessage}>
        <Button
          disabled={!output}
          onClick={() => void handleCopy()}
          startIcon={<ContentCopyIcon />}
          variant="outlined"
        >
          Copy result
        </Button>
      </ToolFooter>
    </ToolWorkspace>
  );
}
