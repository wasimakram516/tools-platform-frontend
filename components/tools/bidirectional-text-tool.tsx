"use client";

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
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
  function handleModeChange(_event: MouseEvent<HTMLElement>, nextMode: Mode | null): void {
    if (!nextMode || nextMode === mode) {
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

    try {
      await navigator.clipboard.writeText(output);
      setStatusMessage("Result copied.");
      setErrorMessage(null);
    } catch {
      setErrorMessage("Copy was blocked by the browser. Select the result and copy it manually.");
    }
  }

  return (
    <Paper
      component="section"
      aria-label={workspaceLabel}
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
          gap: 1.5,
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button
            disabled={isProcessing || isInputOverLimit}
            onClick={() => void handleTransform()}
            variant="contained"
          >
            {isProcessing ? "Processing…" : activeDirection.actionLabel}
          </Button>
          <Button disabled={isProcessing} onClick={handleLoadExample} color="inherit">
            Load example
          </Button>
          <Button disabled={isProcessing || !output} onClick={handleUseResult} color="inherit">
            Use result as input
          </Button>
          <Button disabled={isProcessing} onClick={handleClear} color="inherit">
            Clear
          </Button>
        </Stack>

        <ToggleButtonGroup
          aria-label={`${workspaceLabel} direction`}
          color="primary"
          exclusive
          size="small"
          value={mode}
          onChange={handleModeChange}
        >
          {directions.map((direction) => (
            <ToggleButton key={direction.mode} value={direction.mode}>
              {direction.toggleLabel}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {isProcessing ? <LinearProgress aria-label={progressLabel} /> : null}

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
            id={`${inputIdPrefix}-input`}
            label={activeDirection.inputLabel}
            value={input}
            onChange={handleInputChange}
            placeholder={activeDirection.inputPlaceholder}
          />
          <TextEditorPanel
            id={`${inputIdPrefix}-output`}
            label={activeDirection.outputLabel}
            value={output}
            placeholder={activeDirection.outputPlaceholder}
            readOnly
          />
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "center" }, gap: 1.5, justifyContent: "space-between", mt: 2 }}
        >
          <Typography role="status" aria-live="polite" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
            {statusMessage || idleMessage}
          </Typography>
          <Button disabled={!output} onClick={() => void handleCopy()} variant="outlined">
            Copy result
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
