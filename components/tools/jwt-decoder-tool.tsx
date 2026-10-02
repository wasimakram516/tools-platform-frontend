"use client";

import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import {
  decodeJwt,
  MAX_JWT_INPUT_CHARACTERS,
  type JwtDecodeResult,
} from "@/lib/tools/jwt-decoder";

const EXAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0.c2lnbmF0dXJl";

export type JwtDecoder = (input: string, maxCharacters?: number) => JwtDecodeResult;

interface JwtDecoderToolProps {
  decode?: JwtDecoder;
  maxCharacters?: number;
}

interface DecodedOutput {
  algorithm: string;
  hasSignature: boolean;
  headerJson: string;
  payloadJson: string;
}

/**
 * Provides local JWT inspection while clearly separating decoding from verification.
 */
export function JwtDecoderTool({
  decode = decodeJwt,
  maxCharacters = MAX_JWT_INPUT_CHARACTERS,
}: JwtDecoderToolProps = {}): ReactNode {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<DecodedOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const isOverLimit = input.length > maxCharacters;

  /**
   * Updates token input and removes results that no longer match it.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setInput(event.target.value);
    setOutput(null);
    setErrorMessage(null);
    setStatusMessage("");
  }

  /**
   * Decodes the current token into display-safe JSON sections.
   */
  function handleDecode(): void {
    const result = decode(input, maxCharacters);

    if (!result.ok) {
      setOutput(null);
      setErrorMessage(result.message);
      setStatusMessage("");
      return;
    }

    setOutput({
      algorithm: result.algorithm,
      hasSignature: result.hasSignature,
      headerJson: result.headerJson,
      payloadJson: result.payloadJson,
    });
    setErrorMessage(null);
    setStatusMessage("Decoded locally. Signature not verified.");
  }

  /**
   * Loads a harmless demonstration token without decoding it automatically.
   */
  function handleLoadExample(): void {
    setInput(EXAMPLE_JWT);
    setOutput(null);
    setErrorMessage(null);
    setStatusMessage("Example loaded. Select Decode token to inspect it.");
  }

  /**
   * Resets the complete decoder workspace.
   */
  function handleClear(): void {
    setInput("");
    setOutput(null);
    setErrorMessage(null);
    setStatusMessage("JWT workspace cleared.");
  }

  /**
   * Copies one decoded JSON section and reports clipboard failures safely.
   */
  async function handleCopy(value: string, sectionName: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setErrorMessage(null);
      setStatusMessage(`${sectionName} copied. Signature not verified.`);
    } catch {
      setErrorMessage(
        `Copy was blocked by the browser. Select the decoded ${sectionName.toLowerCase()} and copy it manually.`,
      );
    }
  }

  const limitError = isOverLimit
    ? `This JWT exceeds the ${maxCharacters.toLocaleString("en-US")} character local-processing limit.`
    : null;

  return (
    <Paper
      component="section"
      aria-label="JWT decoder workspace"
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
          <Button disabled={isOverLimit} onClick={handleDecode} variant="contained">
            Decode token
          </Button>
          <Button onClick={handleLoadExample} variant="outlined">
            Load example
          </Button>
          <Button color="inherit" onClick={handleClear}>
            Clear
          </Button>
        </Stack>

        {output ? (
          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Algorithm: ${output.algorithm}`} size="small" variant="outlined" />
            <Chip
              color={output.hasSignature ? "warning" : "default"}
              label={output.hasSignature ? "Signature present" : "No signature"}
              size="small"
              variant="outlined"
            />
          </Stack>
        ) : null}
      </Stack>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Decoding does not verify this token&apos;s signature or authenticity. Treat all decoded
          claims as untrusted.
        </Alert>

        {limitError || errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {limitError ?? errorMessage}
          </Alert>
        ) : null}

        <TextEditorPanel
          characterLimit={maxCharacters}
          id="jwt-input"
          label="JWT input"
          onChange={handleInputChange}
          placeholder="Paste a compact JWT in header.payload.signature format."
          value={input}
        />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            mt: 2.5,
          }}
        >
          <Box>
            <TextEditorPanel
              id="jwt-header-output"
              label="Decoded header"
              placeholder="Decoded JWT header appears here."
              readOnly
              value={output?.headerJson ?? ""}
            />
            <Button
              disabled={!output}
              onClick={() => void handleCopy(output?.headerJson ?? "", "Header")}
              size="small"
              sx={{ mt: 1 }}
              variant="outlined"
            >
              Copy header
            </Button>
          </Box>

          <Box>
            <TextEditorPanel
              id="jwt-payload-output"
              label="Decoded payload"
              placeholder="Decoded JWT payload appears here."
              readOnly
              value={output?.payloadJson ?? ""}
            />
            <Button
              disabled={!output}
              onClick={() => void handleCopy(output?.payloadJson ?? "", "Payload")}
              size="small"
              sx={{ mt: 1 }}
              variant="outlined"
            >
              Copy payload
            </Button>
          </Box>
        </Box>

        <Typography
          aria-live="polite"
          color="text.secondary"
          role="status"
          sx={{ fontSize: "0.82rem", mt: 2 }}
        >
          {statusMessage || "JWT content stays in this browser. No signature verification is performed."}
        </Typography>
      </Box>
    </Paper>
  );
}
