export const HASH_ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

/** Hashing happens on this device in one pass, so the limit only protects the page's memory. */
export const MAX_HASH_INPUT_CHARACTERS = 1_000_000;

/** A secret key is a short string, so this only stops accidental huge pastes. */
export const MAX_HMAC_KEY_CHARACTERS = 10_000;

/**
 * Computes one digest. With a key it is an HMAC (a hash mixed with a secret); without, a plain hash.
 */
export type HashDigest = (
  algorithm: HashAlgorithm,
  data: Uint8Array<ArrayBuffer>,
  key: Uint8Array<ArrayBuffer> | null,
) => Promise<ArrayBuffer>;

export type HashSet = Readonly<Record<HashAlgorithm, string>>;

export interface HashSuccess {
  ok: true;
  hashes: HashSet;
}

export interface HashFailure {
  ok: false;
  message: string;
}

export type HashResult = HashSuccess | HashFailure;

/**
 * The browser's own digest function, or null where Web Crypto is unavailable
 * (for example a page served over plain HTTP).
 */
function browserDigest(): HashDigest | null {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    return null;
  }

  return async (algorithm, data, key) => {
    if (!key) {
      return subtle.digest(algorithm, data);
    }

    const cryptoKey = await subtle.importKey("raw", key, { hash: algorithm, name: "HMAC" }, false, ["sign"]);

    return subtle.sign("HMAC", cryptoKey, data);
  };
}

/**
 * Writes bytes as lowercase hexadecimal.
 */
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Hashes text, read as UTF-8, with every supported algorithm. A non-empty secret key turns each
 * hash into an HMAC with that key. Nothing leaves the device.
 */
export async function hashText(
  text: string,
  secretKey = "",
  digest: HashDigest | null = browserDigest(),
): Promise<HashResult> {
  if (text.length > MAX_HASH_INPUT_CHARACTERS) {
    return {
      message: `Text is limited to ${MAX_HASH_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`,
      ok: false,
    };
  }

  if (secretKey.length > MAX_HMAC_KEY_CHARACTERS) {
    return {
      message: `The secret key is limited to ${MAX_HMAC_KEY_CHARACTERS.toLocaleString("en-US")} characters.`,
      ok: false,
    };
  }

  if (!digest) {
    return {
      message: "This browser cannot hash here. Open the site over HTTPS or use a current browser.",
      ok: false,
    };
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = secretKey ? encoder.encode(secretKey) : null;
    const results = await Promise.all(
      HASH_ALGORITHMS.map(async (algorithm) => [algorithm, toHex(await digest(algorithm, data, key))] as const),
    );

    return { hashes: Object.fromEntries(results) as HashSet, ok: true };
  } catch {
    return { message: "The text could not be hashed. Try again.", ok: false };
  }
}

/**
 * Finds the algorithms whose hash equals a pasted checksum, ignoring case and surrounding
 * spaces. Returns an empty list when nothing matches.
 */
export function findMatchingAlgorithms(hashes: HashSet, expected: string): HashAlgorithm[] {
  const wanted = expected.trim().toLowerCase();

  if (!wanted) {
    return [];
  }

  return HASH_ALGORITHMS.filter((algorithm) => hashes[algorithm] === wanted);
}
