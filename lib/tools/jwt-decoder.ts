export const MAX_JWT_INPUT_CHARACTERS = 100_000;

type JsonObject = Record<string, unknown>;

export interface JwtDecodeSuccess {
  ok: true;
  header: JsonObject;
  payload: JsonObject;
  headerJson: string;
  payloadJson: string;
  algorithm: string;
  hasSignature: boolean;
}

export interface JwtDecodeFailure {
  ok: false;
  message: string;
}

export type JwtDecodeResult = JwtDecodeSuccess | JwtDecodeFailure;

const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Reports whether a non-empty value can represent unpadded Base64URL data.
 */
function isBase64UrlSegment(segment: string): boolean {
  return BASE64_URL_PATTERN.test(segment) && segment.length % 4 !== 1;
}

/**
 * Reports whether a parsed JSON value is an object suitable for JWT claims.
 */
function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Decodes one Base64URL token segment as strict UTF-8 text.
 */
function decodeBase64Url(segment: string, sectionName: string): string {
  if (!isBase64UrlSegment(segment)) {
    throw new Error(`The JWT ${sectionName} is not valid Base64URL data.`);
  }

  const standardBase64 = segment.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = standardBase64.padEnd(
    standardBase64.length + ((4 - (standardBase64.length % 4)) % 4),
    "=",
  );

  try {
    const binary = globalThis.atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`The JWT ${sectionName} could not be decoded as UTF-8 text.`);
  }
}

/**
 * Parses one decoded JWT section and requires a JSON object.
 */
function parseJwtSection(segment: string, sectionName: string): JsonObject {
  const decodedText = decodeBase64Url(segment, sectionName);
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(decodedText);
  } catch {
    throw new Error(`The JWT ${sectionName} does not contain valid JSON.`);
  }

  if (!isJsonObject(parsedValue)) {
    throw new Error(`The JWT ${sectionName} must contain a JSON object.`);
  }

  return parsedValue;
}

/**
 * Decodes a compact JWT locally without verifying its signature or authenticity.
 */
export function decodeJwt(
  input: string,
  maxCharacters = MAX_JWT_INPUT_CHARACTERS,
): JwtDecodeResult {
  const token = input.trim();

  if (!token) {
    return { ok: false, message: "Enter a JWT to decode." };
  }

  if (token.length > maxCharacters) {
    return {
      ok: false,
      message: `This JWT exceeds the ${maxCharacters.toLocaleString("en-US")} character local-processing limit.`,
    };
  }

  const segments = token.split(".");

  if (segments.length !== 3 || !segments[0] || !segments[1]) {
    return {
      ok: false,
      message: "Enter a JWT with three dot-separated parts: header.payload.signature.",
    };
  }

  try {
    const header = parseJwtSection(segments[0], "header");
    const payload = parseJwtSection(segments[1], "payload");

    if (segments[2] && !isBase64UrlSegment(segments[2])) {
      throw new Error("The JWT signature is not valid Base64URL data.");
    }

    return {
      ok: true,
      header,
      payload,
      headerJson: JSON.stringify(header, null, 2),
      payloadJson: JSON.stringify(payload, null, 2),
      algorithm: typeof header.alg === "string" ? header.alg : "Not specified",
      hasSignature: (segments[2] ?? "").length > 0,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The JWT could not be decoded safely.",
    };
  }
}
