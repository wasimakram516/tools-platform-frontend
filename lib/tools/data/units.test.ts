// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convertUnit, formatQuantity, getUnitCategory, UNIT_CATEGORIES } from "@/lib/tools/data/units";

/**
 * Converts a value and returns the number, failing the test if it did not work.
 */
function convert(category: string, value: number, from: string, to: string): number {
  const result = convertUnit(category, value, from, to);

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.value;
}

// These values follow from the international definitions and were checked in Python.
describe("convertUnit", () => {
  it("converts length", () => {
    expect(convert("length", 1, "mi", "km")).toBeCloseTo(1.609344, 9);
    expect(convert("length", 1, "in", "cm")).toBeCloseTo(2.54, 9);
    expect(convert("length", 1, "ft", "m")).toBeCloseTo(0.3048, 9);
    expect(convert("length", 1, "yd", "m")).toBeCloseTo(0.9144, 9);
    expect(convert("length", 1, "nmi", "km")).toBeCloseTo(1.852, 9);
    expect(convert("length", 5280, "ft", "mi")).toBeCloseTo(1, 9);
  });

  it("converts weight and mass", () => {
    expect(convert("mass", 1, "lb", "kg")).toBeCloseTo(0.45359237, 9);
    expect(convert("mass", 1, "oz", "g")).toBeCloseTo(28.349523125, 9);
    expect(convert("mass", 1, "st", "kg")).toBeCloseTo(6.35029318, 9);
    expect(convert("mass", 16, "oz", "lb")).toBeCloseTo(1, 9);
  });

  it("converts temperature through the right formulas", () => {
    expect(convert("temperature", 100, "c", "f")).toBeCloseTo(212, 9);
    expect(convert("temperature", 0, "k", "c")).toBeCloseTo(-273.15, 9);
    expect(convert("temperature", -40, "c", "f")).toBeCloseTo(-40, 9);
    expect(convert("temperature", 98.6, "f", "c")).toBeCloseTo(37, 9);
    expect(convert("temperature", 25, "c", "k")).toBeCloseTo(298.15, 9);
    expect(convert("temperature", 32, "f", "k")).toBeCloseTo(273.15, 9);
  });

  it("does not accept a temperature below absolute zero", () => {
    expect(convertUnit("temperature", -300, "c", "f")).toMatchObject({ message: expect.stringContaining("absolute zero"), ok: false });
    expect(convertUnit("temperature", -1, "k", "c")).toMatchObject({ ok: false });
    expect(convertUnit("temperature", -459.67, "f", "k")).toMatchObject({ ok: true });
  });

  it("converts area, volume, speed, and time", () => {
    expect(convert("area", 1, "ac", "m2")).toBeCloseTo(4046.8564224, 7);
    expect(convert("area", 1, "ha", "ac")).toBeCloseTo(2.471053814671653, 9);
    expect(convert("area", 1, "ft2", "m2")).toBeCloseTo(0.09290304, 9);
    expect(convert("volume", 1, "gal", "l")).toBeCloseTo(3.785411784, 9);
    expect(convert("volume", 1, "cup", "ml")).toBeCloseTo(236.5882365, 7);
    expect(convert("volume", 1, "tbsp", "ml")).toBeCloseTo(14.78676478125, 9);
    expect(convert("volume", 1, "igal", "l")).toBeCloseTo(4.54609, 9);
    expect(convert("speed", 60, "mph", "kmh")).toBeCloseTo(96.56064, 9);
    expect(convert("speed", 1, "kn", "kmh")).toBeCloseTo(1.852, 9);
    expect(convert("time", 1, "d", "s")).toBe(86400);
    expect(convert("time", 1, "wk", "h")).toBe(168);
    expect(convert("time", 1, "yr", "d")).toBeCloseTo(365.25, 9);
  });

  it("keeps decimal and binary data units apart", () => {
    expect(convert("data", 1, "gib", "mb")).toBeCloseTo(1073.741824, 9);
    expect(convert("data", 1, "kib", "b")).toBe(1024);
    expect(convert("data", 1, "tb", "tib")).toBeCloseTo(0.9094947017729282, 12);
    expect(convert("data", 1, "b", "bit")).toBe(8);
    expect(convert("data", 1, "gb", "mb")).toBe(1000);
  });

  it("gives the same value back when converting there and back", () => {
    for (const category of UNIT_CATEGORIES) {
      for (const from of category.units) {
        for (const to of category.units) {
          const there = convert(category.id, 123.456, from.id, to.id);

          expect(convert(category.id, there, to.id, from.id), `${category.id} ${from.id} ${to.id}`).toBeCloseTo(123.456, 6);
        }
      }
    }
  });

  it("explains problems", () => {
    expect(convertUnit("length", Number.NaN, "m", "km")).toMatchObject({ ok: false });
    expect(convertUnit("length", Infinity, "m", "km")).toMatchObject({ ok: false });
    expect(convertUnit("nothing", 1, "m", "km")).toMatchObject({ ok: false });
    expect(convertUnit("length", 1, "m", "zz")).toMatchObject({ ok: false });
  });
});

describe("unit lists", () => {
  it("has a unique id for every unit within a category, and a positive factor", () => {
    for (const category of UNIT_CATEGORIES) {
      const ids = category.units.map((unit) => unit.id);

      expect(new Set(ids).size, category.id).toBe(ids.length);
      expect(category.units.every((unit) => unit.factor > 0), category.id).toBe(true);
    }
  });

  it("has one unit with a factor of one in each category that uses factors", () => {
    for (const category of UNIT_CATEGORIES.filter((entry) => entry.id !== "temperature")) {
      expect(category.units.filter((unit) => unit.factor === 1), category.id).toHaveLength(1);
    }
  });

  it("opens each category on two different units that exist", () => {
    for (const category of UNIT_CATEGORIES) {
      const ids = category.units.map((unit) => unit.id);

      expect(ids, category.id).toContain(category.defaultFrom);
      expect(ids, category.id).toContain(category.defaultTo);
      expect(category.defaultFrom, category.id).not.toBe(category.defaultTo);
    }
  });

  it("finds a category by id", () => {
    expect(getUnitCategory("length")?.name).toBe("Length");
    expect(getUnitCategory("nope")).toBeUndefined();
  });
});

describe("formatQuantity", () => {
  it("hides floating point dust and keeps ten significant digits", () => {
    expect(formatQuantity(0.1 + 0.2)).toBe("0.3");
    expect(formatQuantity(96.56063999999999)).toBe("96.56064");
    expect(formatQuantity(1 / 3)).toBe("0.3333333333");
    expect(formatQuantity(1.609344)).toBe("1.609344");
  });

  it("uses thousands separators", () => {
    expect(formatQuantity(1073741824)).toBe("1,073,741,824");
    expect(formatQuantity(1234.5)).toBe("1,234.5");
  });

  it("uses scientific notation only for very large and very small numbers", () => {
    expect(formatQuantity(1e20)).toBe("1e20");
    expect(formatQuantity(1.2345e-7)).toBe("1.2345e-7");
    expect(formatQuantity(0.000001234)).toBe("0.000001234");
  });

  it("shows zero and negatives plainly", () => {
    expect(formatQuantity(0)).toBe("0");
    expect(formatQuantity(-0)).toBe("0");
    expect(formatQuantity(-273.15)).toBe("-273.15");
  });
});
