"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Alert, Box, Button, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { hintFor } from "@/components/ui/field-hint";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import {
  findMatchingAlgorithms,
  HASH_ALGORITHMS,
  hashText,
  MAX_HASH_INPUT_CHARACTERS,
  MAX_HMAC_KEY_CHARACTERS,
  type HashAlgorithm,
  type HashResult,
  type HashSet,
} from "@/lib/tools/hash-generator";

interface HashGeneratorToolProps {
  hash?: (text: string, secretKey: string) => Promise<HashResult>;
}

const IDLE_MESSAGE = "Type or paste text to see its hashes. The text and key never leave this device.";

/**
 * Hashes text with SHA-1, SHA-256, SHA-384, and SHA-512 as you type, and can check the text
 * against a checksum you paste.
 */
export function HashGeneratorTool({ hash = (text, key) => hashText(text, key) }: HashGeneratorToolProps = {}): ReactNode {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashSet | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [expected, setExpected] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const latestRequest = useRef(0);
  const matches = hashes ? findMatchingAlgorithms(hashes, expected) : [];

  /**
   * Shows a hash in the chosen letter case.
   */
  function display(value: string): string {
    return uppercase ? value.toUpperCase() : value;
  }

  /**
   * Hashes the text with the key, and ignores the answer if newer input arrived while it worked.
   */
  async function rehash(text: string, key: string): Promise<void> {
    const request = ++latestRequest.current;

    setStatusMessage("");

    if (!text) {
      setHashes(null);
      setErrorMessage(null);
      return;
    }

    const result = await hash(text, key);

    if (request !== latestRequest.current) {
      return;
    }

    setHashes(result.ok ? result.hashes : null);
    setErrorMessage(result.ok ? null : result.message);
  }

  /**
   * Takes new text and hashes it with the current key.
   */
  async function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> {
    setInput(event.target.value);
    await rehash(event.target.value, secretKey);
  }

  /**
   * Takes a new secret key and hashes the current text with it.
   */
  async function handleKeyChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> {
    setSecretKey(event.target.value);
    await rehash(input, event.target.value);
  }

  /**
   * Copies one hash in the letter case currently shown.
   */
  async function handleCopy(algorithm: HashAlgorithm): Promise<void> {
    if (!hashes) {
      return;
    }

    if (await copyToClipboard(display(hashes[algorithm]))) {
      setStatusMessage(`${algorithm} hash copied.`);
      setErrorMessage(null);
    } else {
      setErrorMessage(copyBlockedMessage("hash"));
    }
  }

  /**
   * Clears the text, the pasted checksum, and every hash.
   */
  function handleClear(): void {
    latestRequest.current += 1;
    setInput("");
    setHashes(null);
    setExpected("");
    setSecretKey("");
    setErrorMessage(null);
    setStatusMessage("Cleared.");
  }

  /**
   * Describes whether the pasted checksum matches the text.
   */
  function compareMessage(): string | null {
    if (!hashes || !expected.trim()) {
      return null;
    }

    return matches.length > 0
      ? `Matches the ${matches.join(" and ")} hash of this text.`
      : "Does not match any hash of this text.";
  }

  const comparison = compareMessage();

  return (
    <ToolWorkspace
      label="Hash generator workspace"
      options={
        <FormControlLabel
          control={<Switch checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} />}
          label="Uppercase"
        />
      }
      secondaryActions={
        <Button color="inherit" onClick={handleClear} size="small" startIcon={<DeleteOutlinedIcon />}>
          Clear
        </Button>
      }
    >
      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}
      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <Stack sx={{ gap: 2.5 }}>
          <TextEditorPanel
            characterLimit={MAX_HASH_INPUT_CHARACTERS}
            id="hash-input"
            label="Text to hash"
            onChange={(event) => void handleInputChange(event)}
            placeholder="Type or paste the text to hash."
            value={input}
          />
          <TextField
            autoComplete="off"
            fullWidth
            helperText={hintFor(
              "Optional. With a key, the results become HMACs, which are used to sign and verify messages.",
            )}
            id="hash-secret-key"
            label="Secret key (optional)"
            placeholder="Leave empty for a plain hash"
            onChange={(event) => void handleKeyChange(event)}
            slotProps={{
              htmlInput: { maxLength: MAX_HMAC_KEY_CHARACTERS, spellCheck: false },
              inputLabel: { shrink: true },
            }}
            value={secretKey}
          />
          <TextField
            fullWidth
            helperText={
              comparison
                ? undefined
                : hintFor(
                    "Optional. Paste a hash you were given, such as a download checksum, to see if it matches the text.",
                  )
            }
            id="hash-expected"
            label="Hash to check (optional)"
            placeholder="Paste the hash you want to compare"
            onChange={(event) => setExpected(event.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { spellCheck: false } }}
            value={expected}
          />
          {comparison ? (
            <Alert
              icon={matches.length > 0 ? <CheckCircleOutlinedIcon /> : undefined}
              severity={matches.length > 0 ? "success" : "warning"}
            >
              {comparison}
            </Alert>
          ) : null}
        </Stack>
        <Stack aria-label="Hashes" role="group" sx={{ gap: 1.25 }}>
          {hashes ? (
            HASH_ALGORITHMS.map((algorithm) => (
              <CopyableValueRow
                highlighted={matches.includes(algorithm)}
                id={algorithm}
                key={algorithm}
                onCopy={() => void handleCopy(algorithm)}
                title={secretKey ? `HMAC-${algorithm}` : algorithm}
                value={display(hashes[algorithm])}
              />
            ))
          ) : (
            <Typography
              color="text.secondary"
              sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, p: 3 }}
            >
              The hashes appear here as you type.
            </Typography>
          )}
        </Stack>
      </Box>
      <ToolFooter message={statusMessage || IDLE_MESSAGE} />
    </ToolWorkspace>
  );
}
