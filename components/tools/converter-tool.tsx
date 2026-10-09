"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Alert, Box, Button, Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { useConverter, type ConverterDirection, type ConverterState } from "@/components/tools/use-converter";
import type { DataConversionResult } from "@/lib/tools/data/csv-json";
import { MAX_DATA_INPUT_CHARACTERS } from "@/lib/tools/data/csv";

interface ConverterControlsProps<Value extends string> {
  directions: readonly [ConverterDirection<Value>, ConverterDirection<Value>];
  state: ConverterState<Value>;
  toggleLabel: string;
}

/**
 * The direction toggle for a converter, with an icon and a hint on each option.
 */
export function ConverterDirectionToggle<Value extends string>({
  directions,
  state,
  toggleLabel,
}: ConverterControlsProps<Value>): ReactNode {
  return (
    <ModeToggle
      label={toggleLabel}
      onChange={state.changeMode}
      options={directions.map((entry) => ({ icon: entry.icon, label: entry.label, tooltip: entry.tooltip, value: entry.value }))}
      value={state.mode}
    />
  );
}

/**
 * The helper buttons for a converter: swap the result back in, load an example, and clear.
 */
export function ConverterHelpers<Value extends string>({ state }: { state: ConverterState<Value> }): ReactNode {
  return (
    <>
      <Tooltip arrow describeChild title="Use the result as the new input and convert it back">
        <span>
          <Button color="inherit" disabled={state.output === ""} onClick={state.swap} size="small" startIcon={<SwapHorizIcon />}>
            Swap
          </Button>
        </span>
      </Tooltip>
      <Button color="inherit" onClick={state.loadExample} size="small" startIcon={<LightbulbOutlinedIcon />}>
        Load example
      </Button>
      <Button color="inherit" onClick={state.clear} size="small" startIcon={<DeleteOutlinedIcon />}>
        Clear
      </Button>
    </>
  );
}

interface ConverterPanesProps<Value extends string> {
  idPrefix: string;
  /** Shown beneath the panes until there is a result to describe. */
  idleMessage: string;
  state: ConverterState<Value>;
}

/**
 * The input and output panes of a converter, any problem with the input, and the copy and
 * download buttons. The result appears as the input changes.
 */
export function ConverterPanes<Value extends string>({ idPrefix, idleMessage, state }: ConverterPanesProps<Value>): ReactNode {
  const { direction } = state;
  const summary = state.status || (state.result?.ok ? state.result.summary : "") || idleMessage;

  return (
    <>
      {state.errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.errorMessage}
        </Alert>
      ) : null}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" } }}>
        <TextEditorPanel
          characterLimit={MAX_DATA_INPUT_CHARACTERS}
          id={`${idPrefix}-input`}
          label={direction.inputLabel}
          onChange={(event) => state.changeInput(event.target.value)}
          placeholder={direction.inputPlaceholder}
          value={state.input}
        />
        <TextEditorPanel
          id={`${idPrefix}-output`}
          label={direction.outputLabel}
          loading={state.isPending}
          placeholder={direction.outputPlaceholder}
          readOnly
          value={state.output}
        />
      </Box>
      <ToolFooter message={summary}>
        <Button disabled={state.output === ""} onClick={() => void state.copyResult()} startIcon={<ContentCopyIcon />} variant="outlined">
          Copy result
        </Button>
        <Button disabled={state.output === ""} onClick={state.downloadResult} startIcon={<DownloadIcon />} variant="outlined">
          Download
        </Button>
      </ToolFooter>
    </>
  );
}

interface ConverterToolProps<Value extends string> {
  convert: (input: string, mode: Value) => DataConversionResult;
  directions: readonly [ConverterDirection<Value>, ConverterDirection<Value>];
  idleMessage: string;
  idPrefix: string;
  /** Settings for the chosen direction, shown beside the direction toggle. */
  options?: (mode: Value) => ReactNode;
  toggleLabel: string;
  workspaceLabel: string;
}

/**
 * A complete two-way converter: a direction toggle and settings in the toolbar, live conversion
 * from an input pane to an output pane, and copy and download. The data tools share it.
 */
export function ConverterTool<Value extends string>({
  convert,
  directions,
  idleMessage,
  idPrefix,
  options,
  toggleLabel,
  workspaceLabel,
}: ConverterToolProps<Value>): ReactNode {
  const state = useConverter({ convert, directions });

  return (
    <ToolWorkspace
      label={workspaceLabel}
      options={
        <>
          <ConverterDirectionToggle directions={directions} state={state} toggleLabel={toggleLabel} />
          {options?.(state.mode)}
        </>
      }
      secondaryActions={<ConverterHelpers state={state} />}
    >
      <ConverterPanes idleMessage={idleMessage} idPrefix={idPrefix} state={state} />
    </ToolWorkspace>
  );
}
