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
import {
  MAX_BASE64_INPUT_CHARACTERS,
  type Base64TransformMode,
} from "@/lib/tools/base64";
import {
  transformBase64InWorker,
  type Base64TransformRunner,
} from "@/lib/tools/base64-worker";
import { formatCharacterCount } from "@/lib/tools/text-metrics";

const EXAMPLES: Readonly<Record<Base64TransformMode, string>> = {
  encode: "Tools Platform keeps this text on your device. ✓",
  decode: "VG9vbHMgUGxhdGZvcm0ga2VlcHMgdGhpcyB0ZXh0IG9uIHlvdXIgZGV2aWNlLiDinJM=",
};

interface Base64EncoderDecoderToolProps {
  maxCharacters?: number;
  transform?: Base64TransformRunner;
}

/**
 * Provides local UTF-8 Base64 encoding and decoding with worker-backed processing.
 */
export function Base64EncoderDecoderTool({
  maxCharacters = MAX_BASE64_INPUT_CHARACTERS,
  transform = transformBase64InWorker,
}: Base64EncoderDecoderToolProps = {}): ReactNode {
  const [mode, setMode] = useState<Base64TransformMode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const charactersOverLimit = Math.max(input.length - maxCharacters, 0);
  const isInputOverLimit = charactersOverLimit > 0;
  const limitErrorMessage = isInputOverLimit
    ? `Input is ${formatCharacterCount(charactersOverLimit)} ${
        charactersOverLimit === 1 ? "character" : "characters"
      } over the ${formatCharacterCount(maxCharacters)}-character limit. Remove some content before processing.`
    : null;
  const visibleErrorMessage = limitErrorMessage ?? errorMessage;
  const isEncodeMode = mode === "encode";

  /**
   * Updates the active conversion mode without retaining stale output or messages.
   */
  function handleModeChange(
    _event: MouseEvent<HTMLElement>,
    nextMode: Base64TransformMode | null,
  ): void {
    if (!nextMode || nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("");
  }

  /**
   * Updates the source text and clears stale conversion feedback.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setInput(event.target.value);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("");
  }

  /**
   * Runs the selected conversion outside the browser's main thread.
   */
  async function handleTransform(): Promise<void> {
    if (isInputOverLimit) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(isEncodeMode ? "Encoding text locally…" : "Decoding Base64 locally…");

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
        `${isEncodeMode ? "Encoded" : "Decoded"} successfully · ${formatCharacterCount(
          result.characterCount,
        )} output characters`,
      );
    } catch (error: unknown) {
      setOutput("");
      setStatusMessage("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Local Base64 processing failed. Reload the page and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * Loads a mode-appropriate example without processing automatically.
   */
  function handleLoadExample(): void {
    setInput(EXAMPLES[mode]);
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Example loaded. Choose the primary action to process it.");
  }

  /**
   * Moves the current result into the input and selects the inverse operation.
   */
  function handleUseResult(): void {
    if (!output) {
      return;
    }

    setInput(output);
    setOutput("");
    setMode(isEncodeMode ? "decode" : "encode");
    setErrorMessage(null);
    setStatusMessage("Result moved to input and conversion direction reversed.");
  }

  /**
   * Clears all text and feedback while preserving the selected mode.
   */
  function handleClear(): void {
    setInput("");
    setOutput("");
    setErrorMessage(null);
    setStatusMessage("Workspace cleared.");
  }

  /**
   * Copies the current result and reports browser permission failures.
   */
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
      aria-label="Base64 encoder and decoder workspace"
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
            {isProcessing ? "Processing…" : isEncodeMode ? "Encode text" : "Decode Base64"}
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
          aria-label="Base64 conversion direction"
          color="primary"
          exclusive
          size="small"
          value={mode}
          onChange={handleModeChange}
        >
          <ToggleButton value="encode">Encode</ToggleButton>
          <ToggleButton value="decode">Decode</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {isProcessing ? <LinearProgress aria-label="Processing Base64" /> : null}

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
            id="base64-input"
            label={isEncodeMode ? "Plain text" : "Base64 input"}
            value={input}
            onChange={handleInputChange}
            placeholder={isEncodeMode ? "Enter or paste text to encode." : "Paste Base64 text to decode."}
          />
          <TextEditorPanel
            id="base64-output"
            label={isEncodeMode ? "Base64 output" : "Decoded text"}
            value={output}
            placeholder={isEncodeMode ? "Encoded Base64 appears here." : "Decoded text appears here."}
            readOnly
          />
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "center" }, gap: 1.5, justifyContent: "space-between", mt: 2 }}
        >
          <Typography role="status" aria-live="polite" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
            {statusMessage || "UTF-8 text is converted locally in your browser."}
          </Typography>
          <Button disabled={!output} onClick={() => void handleCopy()} variant="outlined">
            Copy result
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
