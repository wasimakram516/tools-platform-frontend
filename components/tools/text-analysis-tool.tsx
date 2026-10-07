"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Button, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { useDeferredValue, useState } from "react";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { analyzeText, MAX_TEXT_TOOL_CHARACTERS, type TextStats } from "@/lib/tools/text/text-stats";

interface TextAnalysisToolProps {
  idPrefix: string;
  inputLabel: string;
  inputPlaceholder: string;
  /** Optional controls shown above the results, such as a character limit. */
  options?: ReactNode;
  /** Draws the results for the text as it stands, given its basic counts and the text itself. */
  renderResults: (stats: TextStats, text: string) => ReactNode;
  statusMessage: string;
  workspaceLabel: string;
}

/**
 * The shared shell for tools that measure text: the editor on one side and live results on the
 * other. Measuring waits for a pause in typing, so very long text never makes the editor lag.
 */
export function TextAnalysisTool({
  idPrefix,
  inputLabel,
  inputPlaceholder,
  options,
  renderResults,
  statusMessage,
  workspaceLabel,
}: TextAnalysisToolProps): ReactNode {
  const [text, setText] = useState("");
  const measuredText = useDeferredValue(text);
  const isTooLong = measuredText.length > MAX_TEXT_TOOL_CHARACTERS;
  const stats = analyzeText(isTooLong ? "" : measuredText);

  return (
    <ToolWorkspace
      label={workspaceLabel}
      secondaryActions={
        <Button
          color="inherit"
          disabled={!text}
          onClick={() => setText("")}
          size="small"
          startIcon={<DeleteOutlinedIcon />}
        >
          Clear
        </Button>
      }
    >
      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <TextEditorPanel
          characterLimit={MAX_TEXT_TOOL_CHARACTERS}
          id={`${idPrefix}-input`}
          label={inputLabel}
          onChange={(event) => setText(event.target.value)}
          placeholder={inputPlaceholder}
          value={text}
        />
        <Stack sx={{ gap: 2.5 }}>
          {options}
          {renderResults(stats, isTooLong ? "" : measuredText)}
        </Stack>
      </Box>
      <ToolFooter
        message={
          isTooLong
            ? "This text is over the limit, so it is not measured. Shorten it to see the results."
            : statusMessage
        }
      />
    </ToolWorkspace>
  );
}
