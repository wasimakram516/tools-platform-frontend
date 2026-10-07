export interface SizePreset {
  height: number;
  id: string;
  label: string;
  width: number;
}

/**
 * Sizes people ask for most often. Platforms change their guidelines now and then, so the page
 * describes these as common sizes and not as rules.
 */
export const SIZE_PRESETS: readonly SizePreset[] = [
  { height: 1080, id: "instagram-post", label: "Instagram post (1080 × 1080)", width: 1080 },
  { height: 1920, id: "story", label: "Story or Reel (1080 × 1920)", width: 1080 },
  { height: 900, id: "x-post", label: "X post image (1600 × 900)", width: 1600 },
  { height: 630, id: "link-preview", label: "Link preview, Open Graph (1200 × 630)", width: 1200 },
  { height: 396, id: "linkedin-banner", label: "LinkedIn banner (1584 × 396)", width: 1584 },
  { height: 720, id: "youtube-thumbnail", label: "YouTube thumbnail (1280 × 720)", width: 1280 },
  { height: 1080, id: "full-hd", label: "Full HD (1920 × 1080)", width: 1920 },
  { height: 512, id: "square-512", label: "Square icon (512 × 512)", width: 512 },
];

/**
 * Finds a preset by its id.
 */
export function presetById(id: string): SizePreset | undefined {
  return SIZE_PRESETS.find((preset) => preset.id === id);
}
