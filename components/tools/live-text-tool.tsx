"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Alert, Box, Button } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { MAX_TEXT_TOOL_CHARACTERS } from "@/lib/tools/text/text-stats";

export interface LiveTextOutput {
  /** Optional content shown under the two panels, such as a table of repeated lines. */
  details?: ReactNode;
  output: string;
  /** A short outcome shown under the panels, such as how many lines were removed. */
  summary: string;
}

interface LiveTextToolProps {
  /** Optional content under the two panels. It can copy any text through the shared helper. */
  extra?: (text: string, copy: (value: string, label: string) => void) => ReactNode;
  example: string;
  idPrefix: string;
  idleMessage: string;
  inputLabel: string;
  inputPlaceholder: string;
  /** Controls that shape the result, shown in the toolbar. */
  options: ReactNode;
  outputLabel: string;
  outputPlaceholder: string;
  /** Turns the text into the result. Called as you type, so it must be quick. */
  transform: (text: string) => LiveTextOutput;
  workspaceLabel: string;
}

/**
 * The shared shell for tools that reshape text: the original on the left and the live result on
 * the right, with an example, Clear, and Copy. Each tool supplies only its options and transform.
 */
export function LiveTextTool({
  extra,
  example,
  idPrefix,
  idleMessage,
  inputLabel,
  inputPlaceholder,
  options,
  outputLabel,
  outputPlaceholder,
  transform,
  workspaceLabel,
}: LiveTextToolProps): ReactNode {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isTooLong = text.length > MAX_TEXT_TOOL_CHARACTERS;
  const result = text && !isTooLong ? transform(text) : null;

  /**
   * Copies text to the clipboard, says what was copied, and reports a blocked clipboard.
   */
  async function copyValue(value: string, label: string): Promise<void> {
    if (await copyToClipboard(value)) {
      setFeedback(`${label} copied.`);
      setErrorMessage(null);
    } else {
      setErrorMessage(copyBlockedMessage("text"));
    }
  }

  /**
   * Replaces the text with the tool's example.
   */
  function handleExample(): void {
    setText(example);
    setFeedback("");
    setErrorMessage(null);
  }

  /**
   * Clears the text and any message.
   */
  function handleClear(): void {
    setText("");
    setFeedback("Cleared.");
    setErrorMessage(null);
  }

  return (
    <ToolWorkspace
      actions={
        <Button
          disabled={!result?.output}
          onClick={() => void copyValue(result?.output ?? "", "Result")}
          startIcon={<ContentCopyIcon />}
          variant="contained"
        >
          Copy result
        </Button>
      }
      label={workspaceLabel}
      options={options}
      secondaryActions={
        <>
          <Button color="inherit" onClick={handleExample} size="small" startIcon={<LightbulbOutlinedIcon />}>
            Load example
          </Button>
          <Button
            color="inherit"
            disabled={!text}
            onClick={handleClear}
            size="small"
            startIcon={<DeleteOutlinedIcon />}
          >
            Clear
          </Button>
        </>
      }
    >
      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}
      {isTooLong ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This text is over the limit, so it is not processed. Shorten it to see the result.
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
          characterLimit={MAX_TEXT_TOOL_CHARACTERS}
          id={`${idPrefix}-input`}
          label={inputLabel}
          onChange={(event) => {
            setText(event.target.value);
            setFeedback("");
          }}
          placeholder={inputPlaceholder}
          value={text}
        />
        <TextEditorPanel
          id={`${idPrefix}-output`}
          label={outputLabel}
          placeholder={outputPlaceholder}
          readOnly
          value={result?.output ?? ""}
        />
      </Box>
      {result?.details ? <Box sx={{ mt: 2.5 }}>{result.details}</Box> : null}
      {extra && result ? <Box sx={{ mt: 2.5 }}>{extra(text, (value, label) => void copyValue(value, label))}</Box> : null}
      <ToolFooter message={feedback || result?.summary || idleMessage} />
    </ToolWorkspace>
  );
}
