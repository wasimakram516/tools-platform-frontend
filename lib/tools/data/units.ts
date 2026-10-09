import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

export interface Unit {
  id: string;
  name: string;
  /** How many of the category's base unit make one of this unit. Not used for temperature. */
  factor: number;
  symbol: string;
}

export interface UnitCategory {
  /** The units chosen when the category is opened. */
  defaultFrom: string;
  defaultTo: string;
  id: string;
  name: string;
  /** Short note about how these units are defined, shown under the converter. */
  note?: string;
  units: readonly Unit[];
}

/**
 * Every unit is defined by an exact factor to its category's base unit (the one with factor 1),
 * taken from the international definitions: the inch is exactly 25.4 millimetres, the pound is
 * exactly 0.45359237 kilograms, and so on. United States and imperial units are named as such.
 */
export const UNIT_CATEGORIES: readonly UnitCategory[] = [
  {
    defaultFrom: "km",
    defaultTo: "mi",
    id: "length",
    name: "Length",
    units: [
      { factor: 1, id: "m", name: "Metre", symbol: "m" },
      { factor: 1000, id: "km", name: "Kilometre", symbol: "km" },
      { factor: 0.01, id: "cm", name: "Centimetre", symbol: "cm" },
      { factor: 0.001, id: "mm", name: "Millimetre", symbol: "mm" },
      { factor: 1e-6, id: "um", name: "Micrometre", symbol: "µm" },
      { factor: 1e-9, id: "nm", name: "Nanometre", symbol: "nm" },
      { factor: 1609.344, id: "mi", name: "Mile", symbol: "mi" },
      { factor: 0.9144, id: "yd", name: "Yard", symbol: "yd" },
      { factor: 0.3048, id: "ft", name: "Foot", symbol: "ft" },
      { factor: 0.0254, id: "in", name: "Inch", symbol: "in" },
      { factor: 1852, id: "nmi", name: "Nautical mile", symbol: "nmi" },
    ],
  },
  {
    defaultFrom: "kg",
    defaultTo: "lb",
    id: "mass",
    name: "Weight and mass",
    units: [
      { factor: 1, id: "kg", name: "Kilogram", symbol: "kg" },
      { factor: 0.001, id: "g", name: "Gram", symbol: "g" },
      { factor: 1e-6, id: "mg", name: "Milligram", symbol: "mg" },
      { factor: 1000, id: "t", name: "Tonne (metric ton)", symbol: "t" },
      { factor: 0.45359237, id: "lb", name: "Pound", symbol: "lb" },
      { factor: 0.028349523125, id: "oz", name: "Ounce", symbol: "oz" },
      { factor: 6.35029318, id: "st", name: "Stone", symbol: "st" },
      { factor: 907.18474, id: "ust", name: "US ton (short ton)", symbol: "short ton" },
    ],
  },
  {
    defaultFrom: "c",
    defaultTo: "f",
    id: "temperature",
    name: "Temperature",
    units: [
      { factor: 1, id: "c", name: "Celsius", symbol: "°C" },
      { factor: 1, id: "f", name: "Fahrenheit", symbol: "°F" },
      { factor: 1, id: "k", name: "Kelvin", symbol: "K" },
    ],
  },
  {
    defaultFrom: "m2",
    defaultTo: "ft2",
    id: "area",
    name: "Area",
    units: [
      { factor: 1, id: "m2", name: "Square metre", symbol: "m²" },
      { factor: 1e6, id: "km2", name: "Square kilometre", symbol: "km²" },
      { factor: 0.0001, id: "cm2", name: "Square centimetre", symbol: "cm²" },
      { factor: 1e-6, id: "mm2", name: "Square millimetre", symbol: "mm²" },
      { factor: 10000, id: "ha", name: "Hectare", symbol: "ha" },
      { factor: 4046.8564224, id: "ac", name: "Acre", symbol: "ac" },
      { factor: 2589988.110336, id: "mi2", name: "Square mile", symbol: "mi²" },
      { factor: 0.83612736, id: "yd2", name: "Square yard", symbol: "yd²" },
      { factor: 0.09290304, id: "ft2", name: "Square foot", symbol: "ft²" },
      { factor: 0.00064516, id: "in2", name: "Square inch", symbol: "in²" },
    ],
  },
  {
    defaultFrom: "l",
    defaultTo: "gal",
    id: "volume",
    name: "Volume",
    note: "Gallons, quarts, pints, cups, and fluid ounces are US measures unless marked imperial.",
    units: [
      { factor: 1, id: "l", name: "Litre", symbol: "L" },
      { factor: 0.001, id: "ml", name: "Millilitre", symbol: "mL" },
      { factor: 1000, id: "m3", name: "Cubic metre", symbol: "m³" },
      { factor: 3.785411784, id: "gal", name: "US gallon", symbol: "gal" },
      { factor: 0.946352946, id: "qt", name: "US quart", symbol: "qt" },
      { factor: 0.473176473, id: "pt", name: "US pint", symbol: "pt" },
      { factor: 0.2365882365, id: "cup", name: "US cup", symbol: "cup" },
      { factor: 0.0295735295625, id: "floz", name: "US fluid ounce", symbol: "fl oz" },
      { factor: 0.01478676478125, id: "tbsp", name: "US tablespoon", symbol: "tbsp" },
      { factor: 0.00492892159375, id: "tsp", name: "US teaspoon", symbol: "tsp" },
      { factor: 4.54609, id: "igal", name: "Imperial gallon", symbol: "imp gal" },
    ],
  },
  {
    defaultFrom: "kmh",
    defaultTo: "mph",
    id: "speed",
    name: "Speed",
    units: [
      { factor: 1, id: "ms", name: "Metre per second", symbol: "m/s" },
      { factor: 1 / 3.6, id: "kmh", name: "Kilometre per hour", symbol: "km/h" },
      { factor: 0.44704, id: "mph", name: "Mile per hour", symbol: "mph" },
      { factor: 1852 / 3600, id: "kn", name: "Knot", symbol: "kn" },
      { factor: 0.3048, id: "fts", name: "Foot per second", symbol: "ft/s" },
    ],
  },
  {
    defaultFrom: "h",
    defaultTo: "min",
    id: "time",
    name: "Time",
    note: "A year here is 365.25 days, the average length of a calendar year.",
    units: [
      { factor: 1, id: "s", name: "Second", symbol: "s" },
      { factor: 0.001, id: "ms", name: "Millisecond", symbol: "ms" },
      { factor: 60, id: "min", name: "Minute", symbol: "min" },
      { factor: 3600, id: "h", name: "Hour", symbol: "h" },
      { factor: 86400, id: "d", name: "Day", symbol: "d" },
      { factor: 604800, id: "wk", name: "Week", symbol: "wk" },
      { factor: 31557600, id: "yr", name: "Year (365.25 days)", symbol: "yr" },
    ],
  },
  {
    defaultFrom: "gb",
    defaultTo: "mb",
    id: "data",
    name: "Data storage",
    note: "kB, MB, and GB count in thousands, as drives are sold. KiB, MiB, and GiB count in 1,024s, as operating systems often show.",
    units: [
      { factor: 1, id: "b", name: "Byte", symbol: "B" },
      { factor: 0.125, id: "bit", name: "Bit", symbol: "bit" },
      { factor: 1e3, id: "kb", name: "Kilobyte", symbol: "kB" },
      { factor: 1e6, id: "mb", name: "Megabyte", symbol: "MB" },
      { factor: 1e9, id: "gb", name: "Gigabyte", symbol: "GB" },
      { factor: 1e12, id: "tb", name: "Terabyte", symbol: "TB" },
      { factor: 1e15, id: "pb", name: "Petabyte", symbol: "PB" },
      { factor: 1024, id: "kib", name: "Kibibyte", symbol: "KiB" },
      { factor: 1024 ** 2, id: "mib", name: "Mebibyte", symbol: "MiB" },
      { factor: 1024 ** 3, id: "gib", name: "Gibibyte", symbol: "GiB" },
      { factor: 1024 ** 4, id: "tib", name: "Tebibyte", symbol: "TiB" },
      { factor: 1024 ** 5, id: "pib", name: "Pebibyte", symbol: "PiB" },
    ],
  },
];

const ABSOLUTE_ZERO_CELSIUS = -273.15;
const KELVIN_OFFSET = 273.15;
const MAX_MAGNITUDE = 1e300;
/** Significant digits shown, which hides floating point dust such as 0.30000000000000004. */
const SIGNIFICANT_DIGITS = 10;
const EXPONENT_ABOVE = 1e15;
const EXPONENT_BELOW = 1e-6;

/**
 * Finds a category by id.
 */
export function getUnitCategory(categoryId: string): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((category) => category.id === categoryId);
}

/**
 * Converts a temperature through kelvin, which is the same scale as Celsius moved by 273.15.
 */
function convertTemperature(value: number, from: string, to: string): number {
  const celsius = from === "c" ? value : from === "f" ? ((value - 32) * 5) / 9 : value - KELVIN_OFFSET;

  return to === "c" ? celsius : to === "f" ? (celsius * 9) / 5 + 32 : celsius + KELVIN_OFFSET;
}

export type UnitResult = { ok: true; value: number } | CalculationFailure;

/**
 * Converts a value between two units of one category. Nothing colder than absolute zero is
 * accepted for temperatures.
 */
export function convertUnit(categoryId: string, value: number, fromId: string, toId: string): UnitResult {
  const category = getUnitCategory(categoryId);
  const from = category?.units.find((unit) => unit.id === fromId);
  const to = category?.units.find((unit) => unit.id === toId);

  if (!category || !from || !to) {
    return failure("Choose a category and two units.");
  }

  if (!Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE) {
    return failure("Enter a number.");
  }

  if (category.id === "temperature") {
    if (convertTemperature(value, from.id, "c") < ABSOLUTE_ZERO_CELSIUS) {
      return failure("That is colder than absolute zero (−273.15 °C), which is not possible.");
    }

    return { ok: true, value: convertTemperature(value, from.id, to.id) };
  }

  return { ok: true, value: (value * from.factor) / to.factor };
}

/**
 * Shows a quantity to ten significant digits, with thousands separators, and in scientific
 * notation only when it is very large or very small.
 */
export function formatQuantity(value: number): string {
  if (value === 0 || Object.is(value, -0)) {
    return "0";
  }

  const magnitude = Math.abs(value);

  if (magnitude >= EXPONENT_ABOVE || magnitude < EXPONENT_BELOW) {
    return Number(value.toPrecision(SIGNIFICANT_DIGITS)).toExponential().replace("e+", "e");
  }

  return value.toLocaleString("en-US", { maximumFractionDigits: 20, maximumSignificantDigits: SIGNIFICANT_DIGITS });
}
