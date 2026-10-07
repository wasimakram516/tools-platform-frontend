// @vitest-environment node
import { describe, expect, it } from "vitest";
import { presetById, SIZE_PRESETS } from "@/lib/tools/image/presets";

describe("SIZE_PRESETS", () => {
  it("lists whole-pixel sizes with unique ids, and sizes that appear in their labels", () => {
    expect(new Set(SIZE_PRESETS.map((preset) => preset.id)).size).toBe(SIZE_PRESETS.length);

    for (const preset of SIZE_PRESETS) {
      expect(Number.isInteger(preset.width) && preset.width > 0).toBe(true);
      expect(Number.isInteger(preset.height) && preset.height > 0).toBe(true);
      expect(preset.label).toContain(`${preset.width} × ${preset.height}`);
    }
  });

  it("finds a preset by id", () => {
    expect(presetById("full-hd")).toMatchObject({ height: 1080, width: 1920 });
    expect(presetById("nope")).toBeUndefined();
  });
});
