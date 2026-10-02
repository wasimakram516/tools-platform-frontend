export type JsonIndentation = 2 | 4;
export type JsonTransformMode = "format" | "minify";

export interface JsonTransformSuccess {
  ok: true;
  output: string;
  characterCount: number;
}

export interface JsonTransformFailure {
  ok: false;
  message: string;
  line?: number;
  column?: number;
}

export type JsonTransformResult = JsonTransformSuccess | JsonTransformFailure;

export const MAX_JSON_INPUT_CHARACTERS = 5_000_000;

const JSON_POSITION_PATTERN = /position\s+(\d+)/i;

/**
 * Converts a zero-based string position into a one-based line and column.
 */
function getLineAndColumn(input: string, position: number): Pick<JsonTransformFailure, "line" | "column"> {
  const prefix = input.slice(0, position);
  const lines = prefix.split("\n");

  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

/**
 * Converts an unknown parser failure into a safe validation result.
 */
function createJsonFailure(input: string, error: unknown): JsonTransformFailure {
  const nativeMessage = error instanceof Error ? error.message : "The JSON could not be parsed.";
  const positionMatch = JSON_POSITION_PATTERN.exec(nativeMessage);
  const position = positionMatch?.[1] ? Number.parseInt(positionMatch[1], 10) : undefined;

  return {
    ok: false,
    message: nativeMessage.replace(/^JSON\.parse:\s*/i, ""),
    ...(position === undefined ? {} : getLineAndColumn(input, position)),
  };
}

/**
 * Parses JSON and returns either formatted or minified output.
 */
export function transformJson(
  input: string,
  mode: JsonTransformMode,
  indentation: JsonIndentation = 2,
): JsonTransformResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      message: "Enter JSON to format or validate.",
    };
  }

  if (input.length > MAX_JSON_INPUT_CHARACTERS) {
    return {
      ok: false,
      message: "This JSON exceeds the 5 million character local-processing limit.",
    };
  }

  try {
    const value: unknown = JSON.parse(input);
    const output = JSON.stringify(value, null, mode === "format" ? indentation : 0);

    return {
      ok: true,
      output,
      characterCount: output.length,
    };
  } catch (error: unknown) {
    return createJsonFailure(input, error);
  }
}
