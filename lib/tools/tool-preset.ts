/**
 * Settings a tool page opens with. A page made for one job, such as PNG to JPG, reuses another
 * tool and passes the settings that job needs, so the tool's code is shared and never copied.
 *
 * Values are plain strings so the server can hand them to the client component as they are.
 * Each tool reads only the keys it knows and checks every value, so a wrong value falls back to
 * the tool's usual default instead of breaking the page.
 */
export type ToolPreset = Readonly<Record<string, string>>;

/** The props every tool component accepts. */
export interface ToolPresetProps {
  preset?: ToolPreset;
}

/**
 * Reads a preset value that must be one of a known set, or returns the fallback.
 */
export function presetChoice<T extends string>(
  preset: ToolPreset | undefined,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = preset && Object.hasOwn(preset, key) ? preset[key] : undefined;

  return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
