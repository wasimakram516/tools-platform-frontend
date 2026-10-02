"use client";

import type { ReactNode } from "react";
import {
  BidirectionalTextTool,
  type TextConversionDirection,
} from "@/components/tools/bidirectional-text-tool";
import {
  MAX_URL_INPUT_CHARACTERS,
  type UrlTransformMode,
} from "@/lib/tools/url-encoder";
import {
  transformUrlInWorker,
  type UrlTransformRunner,
} from "@/lib/tools/url-encoder-worker";

const URL_DIRECTIONS: readonly [
  TextConversionDirection<UrlTransformMode>,
  TextConversionDirection<UrlTransformMode>,
] = [
  {
    mode: "encode",
    toggleLabel: "Encode",
    actionLabel: "Encode component",
    inputLabel: "Plain text",
    inputPlaceholder: "Enter a query value, path segment, or other URL component.",
    outputLabel: "Encoded component",
    outputPlaceholder: "Percent-encoded text appears here.",
    example: "tools platform/json?ready=true",
    processingMessage: "Encoding URL component locally…",
    successVerb: "Encoded",
  },
  {
    mode: "decode",
    toggleLabel: "Decode",
    actionLabel: "Decode component",
    inputLabel: "Encoded component",
    inputPlaceholder: "Paste percent-encoded URL component text.",
    outputLabel: "Decoded text",
    outputPlaceholder: "Decoded URL component text appears here.",
    example: "tools%20platform%2Fjson%3Fready%3Dtrue",
    processingMessage: "Decoding URL component locally…",
    successVerb: "Decoded",
  },
];

interface UrlEncoderDecoderToolProps {
  maxCharacters?: number;
  transform?: UrlTransformRunner;
}

/**
 * Configures the reusable text converter for URL component processing.
 */
export function UrlEncoderDecoderTool({
  maxCharacters = MAX_URL_INPUT_CHARACTERS,
  transform = transformUrlInWorker,
}: UrlEncoderDecoderToolProps = {}): ReactNode {
  return (
    <BidirectionalTextTool
      directions={URL_DIRECTIONS}
      idleMessage="Uses URL component encoding: spaces become %20, while + remains a plus sign."
      inputIdPrefix="url"
      maxCharacters={maxCharacters}
      progressLabel="Processing URL component"
      transform={transform}
      workspaceLabel="URL encoder and decoder workspace"
    />
  );
}
