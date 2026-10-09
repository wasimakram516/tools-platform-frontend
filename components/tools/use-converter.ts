"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useState } from "react";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import type { DataConversionResult } from "@/lib/tools/data/csv-json";
import { downloadBlob } from "@/lib/tools/download";

export interface ConverterDirection<Value extends string> {
  /** The file name offered when the result is downloaded. */
  fileName: string;
  /** A small icon shown beside the direction's label. */
  icon?: ReactNode;
  example: string;
  inputLabel: string;
  inputPlaceholder: string;
  label: string;
  mime: string;
  outputLabel: string;
  outputPlaceholder: string;
  /** A short explanation shown on hover. */
  tooltip?: string;
  value: Value;
}

interface UseConverterInput<Value extends string> {
  /** Turns the input into the output for one direction. It must not throw. */
  convert: (input: string, mode: Value) => DataConversionResult;
  directions: readonly [ConverterDirection<Value>, ConverterDirection<Value>];
}

/**
 * Holds everything a two-way converter needs: the direction, the text, the live result, and the
 * actions on it. The conversion runs as the text changes. The text is deferred a moment so that
 * typing stays smooth even with a large input.
 */
export function useConverter<Value extends string>({ convert, directions }: UseConverterInput<Value>) {
  const [mode, setMode] = useState<Value>(directions[0].value);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const deferredInput = useDeferredValue(input);
  const direction = directions.find((entry) => entry.value === mode) ?? directions[0];
  const otherDirection = directions.find((entry) => entry.value !== mode) ?? directions[1];
  const result = deferredInput.trim() === "" ? null : convert(deferredInput, mode);
  const output = result?.ok ? result.output : "";
  const errorMessage = result && !result.ok ? result.message : null;

  /**
   * Switches direction and clears the note about the last copy or download.
   */
  function changeMode(next: Value): void {
    setMode(next);
    setStatus("");
  }

  /**
   * Edits the input and clears the note about the last copy or download.
   */
  function changeInput(next: string): void {
    setInput(next);
    setStatus("");
  }

  /**
   * Copies the result as plain text.
   */
  async function copyResult(): Promise<void> {
    setStatus((await copyToClipboard(output)) ? "Result copied." : copyBlockedMessage("result"));
  }

  /**
   * Saves the result as a file on the device.
   */
  function downloadResult(): void {
    downloadBlob(new Blob([output], { type: `${direction.mime};charset=utf-8` }), direction.fileName);
    setStatus(`Saved as ${direction.fileName}.`);
  }

  /**
   * Moves the result into the input and converts the other way, which checks a round trip.
   */
  function swap(): void {
    if (output === "") {
      return;
    }

    setInput(output);
    setMode(otherDirection.value);
    setStatus("");
  }

  /**
   * Fills the input with the direction's example.
   */
  function loadExample(): void {
    setInput(direction.example);
    setStatus("Example loaded.");
  }

  /**
   * Empties the input.
   */
  function clear(): void {
    setInput("");
    setStatus("");
  }

  return {
    changeInput,
    changeMode,
    clear,
    copyResult,
    direction,
    downloadResult,
    errorMessage,
    input,
    isPending: input !== deferredInput,
    loadExample,
    mode,
    output,
    result,
    status,
    swap,
  };
}

export type ConverterState<Value extends string> = ReturnType<typeof useConverter<Value>>;
