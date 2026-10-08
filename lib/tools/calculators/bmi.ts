import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

const CM_PER_METRE = 100;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const KG_PER_POUND = 0.45359237;
const KG_PER_STONE = 6.35029318;
const MIN_HEIGHT_CM = 50;
const MAX_HEIGHT_CM = 272;
const MIN_WEIGHT_KG = 2;
const MAX_WEIGHT_KG = 650;

/** The World Health Organization's adult BMI boundaries. */
export const BMI_UNDERWEIGHT_BELOW = 18.5;
export const BMI_OVERWEIGHT_FROM = 25;
export const BMI_OBESE_FROM = 30;
const HEALTHY_UPPER_BMI = 24.9;

export type BmiCategory = "Underweight" | "Healthy weight" | "Overweight" | "Obesity";

/** "ftin" takes feet and inches as two numbers. */
export type HeightUnit = "cm" | "m" | "in" | "ftin";
export type WeightUnit = "kg" | "lb" | "st";

export const HEIGHT_UNIT_OPTIONS: readonly { label: string; value: HeightUnit }[] = [
  { label: "cm", value: "cm" },
  { label: "m", value: "m" },
  { label: "in", value: "in" },
  { label: "ft and in", value: "ftin" },
];

export const WEIGHT_UNIT_OPTIONS: readonly { label: string; value: WeightUnit }[] = [
  { label: "kg", value: "kg" },
  { label: "lb", value: "lb" },
  { label: "st (stone)", value: "st" },
];

const KG_PER_WEIGHT_UNIT: Readonly<Record<WeightUnit, number>> = {
  kg: 1,
  lb: KG_PER_POUND,
  st: KG_PER_STONE,
};

export interface BmiInput {
  /** The number in the chosen unit, or the feet part for "ftin". */
  height: number;
  heightUnit: HeightUnit;
  /** The inches part, used only for "ftin". */
  heightInches: number;
  weight: number;
  weightUnit: WeightUnit;
}

export interface BmiSuccess {
  ok: true;
  bmi: number;
  category: BmiCategory;
  heightCm: number;
  /** The weights that give a healthy BMI at this height, in the unit the user chose. */
  healthyRange: { max: number; min: number; unit: WeightUnit };
  weightKg: number;
}

export type BmiResult = BmiSuccess | CalculationFailure;

/**
 * Names the BMI range a value falls in, using the WHO adult boundaries.
 */
export function categoryFor(bmi: number): BmiCategory {
  if (bmi < BMI_UNDERWEIGHT_BELOW) {
    return "Underweight";
  }

  if (bmi < BMI_OVERWEIGHT_FROM) {
    return "Healthy weight";
  }

  return bmi < BMI_OBESE_FROM ? "Overweight" : "Obesity";
}

/**
 * Converts a height in any supported unit to centimetres.
 */
export function heightToCm(height: number, heightInches: number, unit: HeightUnit): number {
  switch (unit) {
    case "cm":
      return height;
    case "m":
      return height * CM_PER_METRE;
    case "in":
      return height * CM_PER_INCH;
    case "ftin":
      return (height * INCHES_PER_FOOT + heightInches) * CM_PER_INCH;
  }
}

/**
 * Calculates body mass index (weight in kilograms divided by height in metres, squared), and
 * the weights that would be healthy at the same height. It is a screening number for adults,
 * not a diagnosis. Height and weight may each be given in any supported unit.
 */
export function calculateBmi(input: BmiInput): BmiResult {
  const { height, heightInches, heightUnit, weight, weightUnit } = input;

  if (![height, heightInches, weight].every(Number.isFinite)) {
    return failure("Enter your height and weight.");
  }

  if (height < 0 || heightInches < 0 || weight < 0) {
    return failure("Height and weight cannot be negative.");
  }

  const heightCm = heightToCm(height, heightInches, heightUnit);
  const weightKg = weight * KG_PER_WEIGHT_UNIT[weightUnit];

  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return failure(`Enter a height between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.`);
  }

  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return failure(`Enter a weight between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.`);
  }

  const heightMetres = heightCm / CM_PER_METRE;
  const bmi = weightKg / heightMetres ** 2;
  const perUnit = KG_PER_WEIGHT_UNIT[weightUnit];

  return {
    bmi,
    category: categoryFor(bmi),
    healthyRange: {
      max: (HEALTHY_UPPER_BMI * heightMetres ** 2) / perUnit,
      min: (BMI_UNDERWEIGHT_BELOW * heightMetres ** 2) / perUnit,
      unit: weightUnit,
    },
    heightCm,
    ok: true,
    weightKg,
  };
}
