"use client";

import type { ReactNode } from "react";
import {
  BidirectionalTextTool,
  type TextConversionDirection,
} from "@/components/tools/bidirectional-text-tool";
import {
  MAX_BASE64_INPUT_CHARACTERS,
  type Base64TransformMode,
} from "@/lib/tools/base64";
import {
  transformBase64InWorker,
  type Base64TransformRunner,
} from "@/lib/tools/base64-worker";

const BASE64_DIRECTIONS: readonly [
  TextConversionDirection<Base64TransformMode>,
  TextConversionDirection<Base64TransformMode>,
] = [
  {
    mode: "encode",
    toggleLabel: "Encode",
    actionLabel: "Encode text",
    inputLabel: "Plain text",
    inputPlaceholder: "Enter or paste text to encode.",
    outputLabel: "Base64 output",
    outputPlaceholder: "Encoded Base64 appears here.",
    example: "Tools Platform keeps this text on your device. ✓",
    processingMessage: "Encoding text locally…",
    successVerb: "Encoded",
  },
  {
    mode: "decode",
    toggleLabel: "Decode",
    actionLabel: "Decode Base64",
    inputLabel: "Base64 input",
    inputPlaceholder: "Paste Base64 text to decode.",
    outputLabel: "Decoded text",
    outputPlaceholder: "Decoded text appears here.",
    example: "VG9vbHMgUGxhdGZvcm0ga2VlcHMgdGhpcyB0ZXh0IG9uIHlvdXIgZGV2aWNlLiDinJM=",
    processingMessage: "Decoding Base64 locally…",
    successVerb: "Decoded",
  },
];

interface Base64EncoderDecoderToolProps {
  maxCharacters?: number;
  transform?: Base64TransformRunner;
}

/**
 * Configures the reusable text converter for UTF-8 Base64 processing.
 */
export function Base64EncoderDecoderTool({
  maxCharacters = MAX_BASE64_INPUT_CHARACTERS,
  transform = transformBase64InWorker,
}: Base64EncoderDecoderToolProps = {}): ReactNode {
  return (
    <BidirectionalTextTool
      directions={BASE64_DIRECTIONS}
      idleMessage="UTF-8 text is converted locally in your browser."
      inputIdPrefix="base64"
      maxCharacters={maxCharacters}
      progressLabel="Processing Base64"
      transform={transform}
      workspaceLabel="Base64 encoder and decoder workspace"
    />
  );
}
