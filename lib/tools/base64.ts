export type Base64TransformMode = "encode" | "decode";

export interface Base64TransformSuccess {
  ok: true;
  output: string;
  characterCount: number;
}

export interface Base64TransformFailure {
  ok: false;
  message: string;
}

export type Base64TransformResult = Base64TransformSuccess | Base64TransformFailure;

export const MAX_BASE64_INPUT_CHARACTERS = 5_000_000;

const BASE64_CHUNK_SIZE = 32_768;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Converts UTF-8 bytes into the binary string required by the browser Base64 API.
 */
function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";

  for (let index = 0; index < bytes.length; index += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(index, index + BASE64_CHUNK_SIZE));
  }

  return binary;
}

/**
 * Normalizes whitespace and optional padding before Base64 validation.
 */
function normalizeBase64(input: string): string {
  const compactInput = input.replace(/\s+/g, "");
  const remainder = compactInput.length % 4;

  if (remainder === 0 || remainder === 1) {
    return compactInput;
  }

  return compactInput.padEnd(compactInput.length + (4 - remainder), "=");
}

/**
 * Encodes Unicode text as standard Base64 using UTF-8 bytes.
 */
function encodeBase64(input: string): string {
  return btoa(bytesToBinary(new TextEncoder().encode(input)));
}

/**
 * Decodes standard Base64 into Unicode text and rejects non-UTF-8 byte sequences.
 */
function decodeBase64(input: string): string {
  const normalizedInput = normalizeBase64(input);

  if (!BASE64_PATTERN.test(normalizedInput)) {
    throw new Error("Enter valid Base64 text using the standard Base64 alphabet.");
  }

  const binary = atob(normalizedInput);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("This Base64 value does not contain valid UTF-8 text.");
  }
}

/**
 * Encodes or decodes text locally and returns a UI-safe result.
 */
export function transformBase64(
  input: string,
  mode: Base64TransformMode,
): Base64TransformResult {
  const isEmptyInput = mode === "encode" ? input.length === 0 : input.trim().length === 0;

  if (isEmptyInput) {
    return {
      ok: false,
      message: mode === "encode" ? "Enter text to encode." : "Enter Base64 text to decode.",
    };
  }

  if (input.length > MAX_BASE64_INPUT_CHARACTERS) {
    return {
      ok: false,
      message: "This input exceeds the 5 million character local-processing limit.",
    };
  }

  try {
    const output = mode === "encode" ? encodeBase64(input) : decodeBase64(input);

    return {
      ok: true,
      output,
      characterCount: output.length,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The Base64 conversion failed.",
    };
  }
}
