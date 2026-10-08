/** The pause between one item and the next when a group is revealed in sequence. */
export const REVEAL_STAGGER_MS = 80;
/** No item waits longer than this, so a long list never feels slow. */
const REVEAL_MAX_DELAY_MS = 480;

/**
 * Works out how long item `index` of a group waits, so a group arrives one after another.
 * It lives outside the client component so server components can call it too.
 */
export function revealDelay(index: number): number {
  return Math.min(index * REVEAL_STAGGER_MS, REVEAL_MAX_DELAY_MS);
}
