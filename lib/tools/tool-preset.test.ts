import { describe, expect, it } from "vitest";
import { presetChoice } from "@/lib/tools/tool-preset";

const MODES = ["quality", "target"] as const;

describe("presetChoice", () => {
  it("returns the preset value when it is allowed", () => {
    expect(presetChoice({ mode: "target" }, "mode", MODES, "quality")).toBe("target");
  });

  it("falls back when the value is missing, unknown, or there is no preset", () => {
    expect(presetChoice({}, "mode", MODES, "quality")).toBe("quality");
    expect(presetChoice({ mode: "huge" }, "mode", MODES, "quality")).toBe("quality");
    expect(presetChoice(undefined, "mode", MODES, "quality")).toBe("quality");
  });

  it("does not read keys from the object prototype", () => {
    expect(presetChoice({}, "constructor", MODES, "quality")).toBe("quality");
  });
});
