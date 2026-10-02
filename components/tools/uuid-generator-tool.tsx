"use client";

import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import {
  generateUuidBatch,
  MAX_UUID_BATCH_SIZE,
  MIN_UUID_BATCH_SIZE,
  type UuidGenerationResult,
} from "@/lib/tools/uuid-generator";

export type UuidBatchGenerator = (count: number, uppercase: boolean) => UuidGenerationResult;

interface UuidGeneratorToolProps {
  generate?: UuidBatchGenerator;
}

/**
 * Provides secure browser-native UUID v4 batch generation and export actions.
 */
export function UuidGeneratorTool({
  generate = generateUuidBatch,
}: UuidGeneratorToolProps = {}): ReactNode {
  const [quantity, setQuantity] = useState("1");
  const [uppercase, setUppercase] = useState(false);
  const [output, setOutput] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * Updates the requested batch size and clears stale validation feedback.
   */
  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuantity(event.target.value);
    setErrorMessage(null);
    setStatusMessage("");
  }

  /**
   * Applies output casing immediately without regenerating UUID values.
   */
  function handleUppercaseChange(event: ChangeEvent<HTMLInputElement>): void {
    const shouldUppercase = event.target.checked;
    setUppercase(shouldUppercase);
    setOutput((currentOutput) =>
      shouldUppercase ? currentOutput.toUpperCase() : currentOutput.toLowerCase(),
    );
    setStatusMessage(output ? "Output casing updated." : "");
  }

  /**
   * Generates a validated batch using the browser's secure random UUID API.
   */
  function handleGenerate(): void {
    const result = generate(Number(quantity), uppercase);

    if (!result.ok) {
      setOutput("");
      setGeneratedCount(0);
      setErrorMessage(result.message);
      setStatusMessage("");
      return;
    }

    setOutput(result.uuids.join("\n"));
    setGeneratedCount(result.uuids.length);
    setErrorMessage(null);
    setStatusMessage(
      `${result.uuids.length} ${result.uuids.length === 1 ? "UUID" : "UUIDs"} generated securely on this device.`,
    );
  }

  /**
   * Clears generated output while preserving the selected generation options.
   */
  function handleClear(): void {
    setOutput("");
    setGeneratedCount(0);
    setErrorMessage(null);
    setStatusMessage("Generated UUIDs cleared.");
  }

  /**
   * Copies every generated UUID and reports clipboard permission failures.
   */
  async function handleCopy(): Promise<void> {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setStatusMessage(`${generatedCount} ${generatedCount === 1 ? "UUID" : "UUIDs"} copied.`);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Copy was blocked by the browser. Select the UUIDs and copy them manually.");
    }
  }

  return (
    <Paper
      component="section"
      aria-label="UUID generator workspace"
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
          <Button onClick={handleGenerate} variant="contained">
            Generate UUIDs
          </Button>
          <Button disabled={!output} onClick={() => void handleCopy()} variant="outlined">
            Copy all
          </Button>
          <Button onClick={handleClear} color="inherit">
            Clear
          </Button>
        </Stack>

        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
          <TextField
            id="uuid-quantity"
            label="Quantity"
            size="small"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                max: MAX_UUID_BATCH_SIZE,
                min: MIN_UUID_BATCH_SIZE,
                step: 1,
              },
            }}
            sx={{ width: 120 }}
          />
          <FormControlLabel
            control={<Switch checked={uppercase} onChange={handleUppercaseChange} />}
            label="Uppercase"
          />
        </Stack>
      </Stack>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <TextEditorPanel
          id="uuid-output"
          label="Generated UUIDs"
          value={output}
          placeholder="Generated UUID v4 values appear here, one per line."
          readOnly
        />

        <Typography
          role="status"
          aria-live="polite"
          color="text.secondary"
          sx={{ fontSize: "0.82rem", mt: 2 }}
        >
          {statusMessage || `Generate between ${MIN_UUID_BATCH_SIZE} and ${MAX_UUID_BATCH_SIZE} secure UUID v4 values.`}
        </Typography>
      </Box>
    </Paper>
  );
}
