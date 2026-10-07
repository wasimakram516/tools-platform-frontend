"use client";

import type { ReactNode } from "react";
import {
  BidirectionalTextTool,
  type TextConversionDirection,
  type TextTransformRunner,
} from "@/components/tools/bidirectional-text-tool";
import {
  MAX_TIMESTAMP_INPUT_CHARACTERS,
  runUnixTimestampTransform,
  type UnixTimestampMode,
} from "@/lib/tools/dates/unix-timestamp";

const UNIX_TIMESTAMP_DIRECTIONS: readonly [
  TextConversionDirection<UnixTimestampMode>,
  TextConversionDirection<UnixTimestampMode>,
] = [
  {
    mode: "toDate",
    toggleLabel: "Timestamp to date",
    actionLabel: "Convert to date",
    inputLabel: "Unix timestamp",
    inputPlaceholder: "Enter seconds or milliseconds, for example 1760000000",
    outputLabel: "Date and time",
    outputPlaceholder: "The converted date appears here.",
    example: "1760000000",
    processingMessage: "Converting the timestamp…",
    successVerb: "Converted",
  },
  {
    mode: "toTimestamp",
    toggleLabel: "Date to timestamp",
    actionLabel: "Convert to timestamp",
    inputLabel: "Date and time",
    inputPlaceholder: "For example 2026-10-07 or 2026-10-07T12:30:00Z",
    outputLabel: "Unix timestamp",
    outputPlaceholder: "The timestamp appears here.",
    example: "2026-10-07T12:30:00Z",
    processingMessage: "Converting the date…",
    successVerb: "Converted",
  },
];

interface UnixTimestampToolProps {
  maxCharacters?: number;
  transform?: TextTransformRunner<UnixTimestampMode>;
}

/**
 * Configures the shared two-way converter for Unix timestamps.
 */
export function UnixTimestampTool({
  maxCharacters = MAX_TIMESTAMP_INPUT_CHARACTERS,
  transform = runUnixTimestampTransform,
}: UnixTimestampToolProps = {}): ReactNode {
  return (
    <BidirectionalTextTool
      directions={UNIX_TIMESTAMP_DIRECTIONS}
      idleMessage="Values of 12 digits or more are read as milliseconds. Dates with no time zone are read as UTC."
      inputIdPrefix="unix-timestamp"
      maxCharacters={maxCharacters}
      progressLabel="Converting"
      transform={transform}
      workspaceLabel="Unix timestamp converter workspace"
    />
  );
}
