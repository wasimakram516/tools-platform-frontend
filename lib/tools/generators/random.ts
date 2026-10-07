/** Returns a random whole number from 0 up to 4,294,967,295. */
export type Uint32Source = () => number;

const UINT32_RANGE = 2 ** 32;

/**
 * Random 32-bit numbers from the browser's secure generator. Never use Math.random for
 * anything a person might rely on as secret.
 */
export function secureUint32(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

/**
 * Picks a whole number from 0 up to but not including the limit, with every number equally
 * likely. A plain remainder would favour small numbers whenever the limit does not divide
 * 2^32 evenly, so values from the unfair tail are thrown away and drawn again.
 * Throws a RangeError for a limit that is not a whole number from 1 to 2^32.
 */
export function randomInt(limit: number, source: Uint32Source = secureUint32): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > UINT32_RANGE) {
    throw new RangeError("The limit must be a whole number from 1 to 4,294,967,296.");
  }

  if (limit === 1) {
    return 0;
  }

  const fairLimit = Math.floor(UINT32_RANGE / limit) * limit;
  let value = source();

  while (value >= fairLimit) {
    value = source();
  }

  return value % limit;
}

/**
 * Picks one item at random.
 */
export function pickOne<T>(items: readonly T[], source: Uint32Source = secureUint32): T {
  return items[randomInt(items.length, source)] as T;
}

/**
 * Shuffles a list into a random order without bias (Fisher-Yates), changing the list itself.
 */
export function shuffleInPlace<T>(items: T[], source: Uint32Source = secureUint32): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapWith = randomInt(index + 1, source);
    const held = items[index] as T;

    items[index] = items[swapWith] as T;
    items[swapWith] = held;
  }

  return items;
}
