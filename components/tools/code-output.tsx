"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { downloadBlob } from "@/lib/tools/download";

interface CodeOutputProps {
  /** The name offered for the downloaded file. Leave out to show no download button. */
  fileName?: string;
  id: string;
  label: string;
  mime?: string;
  placeholder: string;
  value: string;
}

/**
 * A read-only box for generated text such as HTML or XML, with a character count, a copy button,
 * and an optional download button.
 */
export function CodeOutput({ fileName, id, label, mime = "text/plain", placeholder, value }: CodeOutputProps): ReactNode {
  const [status, setStatus] = useState("");

  /**
   * Copies the text and says so.
   */
  async function handleCopy(): Promise<void> {
    setStatus((await copyToClipboard(value)) ? `${label} copied.` : copyBlockedMessage("text"));
  }

  /**
   * Saves the text as a file on the device.
   */
  function handleDownload(): void {
    if (fileName) {
      downloadBlob(new Blob([value], { type: `${mime};charset=utf-8` }), fileName);
      setStatus(`Saved as ${fileName}.`);
    }
  }

  return (
    <Box>
      <TextEditorPanel id={id} label={label} placeholder={placeholder} readOnly value={value} />
      <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, mt: 1.5 }}>
        <Button disabled={value === ""} onClick={() => void handleCopy()} startIcon={<ContentCopyIcon />} variant="outlined">
          Copy
        </Button>
        {fileName ? (
          <Button disabled={value === ""} onClick={handleDownload} startIcon={<DownloadIcon />} variant="outlined">
            Download
          </Button>
        ) : null}
        <Typography aria-live="polite" color="text.secondary" role="status" sx={{ fontSize: "0.85rem" }}>
          {status}
        </Typography>
      </Stack>
    </Box>
  );
}
