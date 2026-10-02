export type UrlTransformMode = "encode" | "decode";

export interface UrlTransformSuccess {
  ok: true;
  output: string;
  characterCount: number;
}

export interface UrlTransformFailure {
  ok: false;
  message: string;
}

export type UrlTransformResult = UrlTransformSuccess | UrlTransformFailure;

export const MAX_URL_INPUT_CHARACTERS = 5_000_000;

/**
 * Encodes or decodes a URL component and returns a UI-safe result.
 */
export function transformUrlComponent(
  input: string,
  mode: UrlTransformMode,
): UrlTransformResult {
  if (input.length === 0) {
    return {
      ok: false,
      message: mode === "encode" ? "Enter text to URL-encode." : "Enter text to URL-decode.",
    };
  }

  if (input.length > MAX_URL_INPUT_CHARACTERS) {
    return {
      ok: false,
      message: "This input exceeds the 5 million character local-processing limit.",
    };
  }

  try {
    const output = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);

    return {
      ok: true,
      output,
      characterCount: output.length,
    };
  } catch {
    return {
      ok: false,
      message:
        mode === "encode"
          ? "The input contains an unmatched Unicode surrogate. Remove the invalid character and try again."
          : "Enter valid percent-encoded text. Every % must be followed by two hexadecimal characters.",
    };
  }
}
