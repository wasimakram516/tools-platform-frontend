export const MIN_UUID_BATCH_SIZE = 1;
export const MAX_UUID_BATCH_SIZE = 100;

export type UuidFactory = () => string;

export interface UuidGenerationSuccess {
  ok: true;
  uuids: readonly string[];
}

export interface UuidGenerationFailure {
  ok: false;
  message: string;
}

export type UuidGenerationResult = UuidGenerationSuccess | UuidGenerationFailure;

/**
 * Creates one cryptographically secure UUID using the browser Web Crypto API.
 */
function createSecureUuid(): string {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("Secure UUID generation is not supported by this browser.");
  }

  return globalThis.crypto.randomUUID();
}

/**
 * Generates a validated batch of UUID v4 values with optional uppercase formatting.
 */
export function generateUuidBatch(
  count: number,
  uppercase = false,
  uuidFactory: UuidFactory = createSecureUuid,
): UuidGenerationResult {
  if (!Number.isInteger(count) || count < MIN_UUID_BATCH_SIZE || count > MAX_UUID_BATCH_SIZE) {
    return {
      ok: false,
      message: `Choose a whole number between ${MIN_UUID_BATCH_SIZE} and ${MAX_UUID_BATCH_SIZE}.`,
    };
  }

  try {
    const uuids = Array.from({ length: count }, () => {
      const uuid = uuidFactory();
      return uppercase ? uuid.toUpperCase() : uuid.toLowerCase();
    });

    return { ok: true, uuids };
  } catch (error: unknown) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Secure UUID generation failed. Reload the page and try again.",
    };
  }
}
