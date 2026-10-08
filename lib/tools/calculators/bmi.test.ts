// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateBmi, categoryFor, heightToCm, type BmiInput } from "@/lib/tools/calculators/bmi";

const METRIC: BmiInput = { height: 175, heightInches: 0, heightUnit: "cm", weight: 70, weightUnit: "kg" };

describe("calculateBmi", () => {
  it("divides weight in kilograms by height in metres squared", () => {
    const result = calculateBmi(METRIC);

    expect(result.ok && result.bmi).toBeCloseTo(22.857143, 5);
    expect(result.ok && result.category).toBe("Healthy weight");
  });

  it("gives the healthy weight range for the height", () => {
    const result = calculateBmi(METRIC);

    expect(result.ok && result.healthyRange.unit).toBe("kg");
    expect(result.ok && result.healthyRange.min).toBeCloseTo(56.65625, 5);
    expect(result.ok && result.healthyRange.max).toBeCloseTo(76.25625, 5);
  });

  it("gives the same answer whichever height unit is used", () => {
    const inMetres = calculateBmi({ ...METRIC, height: 1.75, heightUnit: "m" });
    const inInches = calculateBmi({ ...METRIC, height: 175 / 2.54, heightUnit: "in" });

    expect(inMetres.ok && inMetres.bmi).toBeCloseTo(22.857143, 5);
    expect(inInches.ok && inInches.bmi).toBeCloseTo(22.857143, 5);
  });

  it("converts feet, inches, and pounds", () => {
    const result = calculateBmi({ height: 5, heightInches: 9, heightUnit: "ftin", weight: 160, weightUnit: "lb" });

    expect(result.ok && result.heightCm).toBeCloseTo(175.26, 8);
    expect(result.ok && result.weightKg).toBeCloseTo(72.5747792, 6);
    expect(result.ok && result.bmi).toBeCloseTo(23.627627, 5);
    expect(result.ok && result.healthyRange.unit).toBe("lb");
    expect(result.ok && result.healthyRange.min).toBeCloseTo(125.277074, 4);
    expect(result.ok && result.healthyRange.max).toBeCloseTo(168.616170, 4);
  });

  it("converts stone and shows the healthy range in stone", () => {
    const result = calculateBmi({ ...METRIC, weight: 11, weightUnit: "st" });

    expect(result.ok && result.weightKg).toBeCloseTo(69.85322498, 6);
    expect(result.ok && result.bmi).toBeCloseTo(22.80921632, 6);
    expect(result.ok && result.healthyRange.unit).toBe("st");
    expect(result.ok && result.healthyRange.min).toBeCloseTo(8.921832, 5);
    expect(result.ok && result.healthyRange.max).toBeCloseTo(12.008304, 5);
  });

  it("refuses heights and weights that cannot be real", () => {
    expect(calculateBmi({ ...METRIC, height: 20 }).ok).toBe(false);
    expect(calculateBmi({ ...METRIC, height: 300 }).ok).toBe(false);
    expect(calculateBmi({ ...METRIC, weight: 1 }).ok).toBe(false);
    expect(calculateBmi({ ...METRIC, weight: -70 }).ok).toBe(false);
    expect(calculateBmi({ ...METRIC, height: Number.NaN }).ok).toBe(false);
    // 2 metres typed with the centimetre unit still selected is far too short.
    expect(calculateBmi({ ...METRIC, height: 1.75 }).ok).toBe(false);
  });
});

describe("heightToCm", () => {
  it("converts every unit to centimetres", () => {
    expect(heightToCm(175, 0, "cm")).toBe(175);
    expect(heightToCm(1.75, 0, "m")).toBe(175);
    expect(heightToCm(10, 0, "in")).toBeCloseTo(25.4, 8);
    expect(heightToCm(5, 9, "ftin")).toBeCloseTo(175.26, 8);
  });
});

describe("categoryFor", () => {
  it("uses the World Health Organization adult boundaries", () => {
    expect(categoryFor(17.9)).toBe("Underweight");
    expect(categoryFor(18.5)).toBe("Healthy weight");
    expect(categoryFor(24.99)).toBe("Healthy weight");
    expect(categoryFor(25)).toBe("Overweight");
    expect(categoryFor(29.99)).toBe("Overweight");
    expect(categoryFor(30)).toBe("Obesity");
  });
});
