"use client";

import { Alert, Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CalculatorResult } from "@/components/tools/calculator-result";
import { DecimalField, SelectField } from "@/components/tools/calculator-fields";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  BMI_OBESE_FROM,
  BMI_OVERWEIGHT_FROM,
  BMI_UNDERWEIGHT_BELOW,
  calculateBmi,
  HEIGHT_UNIT_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  type BmiCategory,
  type HeightUnit,
  type WeightUnit,
} from "@/lib/tools/calculators/bmi";
import { formatNumber, parseDecimal } from "@/lib/tools/calculators/format";
import { SURFACE_RADIUS } from "@/theme/surface";

const RANGES: readonly { category: BmiCategory; label: string }[] = [
  { category: "Underweight", label: `Below ${BMI_UNDERWEIGHT_BELOW}` },
  { category: "Healthy weight", label: `${BMI_UNDERWEIGHT_BELOW} to ${BMI_OVERWEIGHT_FROM - 0.1}` },
  { category: "Overweight", label: `${BMI_OVERWEIGHT_FROM} to ${BMI_OBESE_FROM - 0.1}` },
  { category: "Obesity", label: `${BMI_OBESE_FROM} and above` },
];

/**
 * Calculates body mass index in metric or imperial units. It shows the standard range the
 * result falls in, and says plainly that BMI is a rough screening figure.
 */
export function BmiCalculatorTool(): ReactNode {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [height, setHeight] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const hasInputs = height.trim() !== "" && weight.trim() !== "";
  const result = hasInputs
    ? calculateBmi({
        height: parseDecimal(height) ?? Number.NaN,
        heightInches: parseDecimal(inches) ?? 0,
        heightUnit,
        weight: parseDecimal(weight) ?? Number.NaN,
        weightUnit,
      })
    : null;

  /**
   * Clears the numbers and puts both units back to metric.
   */
  function handleReset(): void {
    setHeight("");
    setInches("");
    setWeight("");
    setHeightUnit("cm");
    setWeightUnit("kg");
  }

  /**
   * Changes the height unit and clears the height, because 175 is not the same in feet as in centimetres.
   */
  function handleHeightUnitChange(next: string): void {
    setHeightUnit(next as HeightUnit);
    setHeight("");
    setInches("");
  }

  return (
    <ToolWorkspace
      label="BMI calculator workspace"
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <Box sx={{ alignItems: "start", display: "grid", gap: 1.5, gridTemplateColumns: "minmax(0, 1fr) 120px" }}>
              {heightUnit === "ftin" ? (
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <DecimalField id="bmi-feet" label="Feet" onChange={setHeight} value={height} />
                  <DecimalField id="bmi-inches" label="Inches" onChange={setInches} value={inches} />
                </Box>
              ) : (
                <DecimalField id="bmi-height" label="Height" onChange={setHeight} value={height} />
              )}
              <SelectField
                id="bmi-height-unit"
                label="Height unit"
                onChange={handleHeightUnitChange}
                options={HEIGHT_UNIT_OPTIONS}
                value={heightUnit}
              />
            </Box>
            <Box sx={{ alignItems: "start", display: "grid", gap: 1.5, gridTemplateColumns: "minmax(0, 1fr) 120px" }}>
              <DecimalField id="bmi-weight" label="Weight" onChange={setWeight} value={weight} />
              <SelectField
                id="bmi-weight-unit"
                label="Weight unit"
                onChange={(next) => setWeightUnit(next as WeightUnit)}
                options={WEIGHT_UNIT_OPTIONS}
                value={weightUnit}
              />
            </Box>
          </>
        }
        result={
          <Box sx={{ display: "grid", gap: 2 }}>
            <CalculatorResult
              emptyMessage="Enter your height and weight to see your BMI."
              errorMessage={result && !result.ok ? result.message : null}
              headline={result?.ok ? `BMI ${formatNumber(result.bmi, 1)}: ${result.category}` : undefined}
              rows={
                result?.ok
                  ? [
                      {
                        label: "Healthy weight for this height",
                        value: `${formatNumber(result.healthyRange.min, 1)} to ${formatNumber(result.healthyRange.max, 1)} ${result.healthyRange.unit}`,
                      },
                    ]
                  : []
              }
            />
            <Box component="ul" sx={{ display: "grid", gap: 0.75, listStyle: "none", m: 0, p: 0 }}>
              {RANGES.map((range) => {
                const isCurrent = result?.ok && result.category === range.category;

                return (
                  <Box
                    aria-current={isCurrent ? "true" : undefined}
                    component="li"
                    key={range.category}
                    sx={{
                      alignItems: "center",
                      bgcolor: isCurrent ? "action.selected" : "transparent",
                      border: "1px solid",
                      borderColor: isCurrent ? "primary.main" : "divider",
                      borderRadius: SURFACE_RADIUS,
                      display: "flex",
                      justifyContent: "space-between",
                      px: 1.75,
                      py: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: isCurrent ? 700 : 500 }}>{range.category}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                      {range.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Alert severity="info" variant="outlined">
              BMI is a rough screening number for adults. It does not account for muscle, bone, age, or where weight is carried,
              and it is not a diagnosis. For advice about your health, speak to a doctor or dietitian.
            </Alert>
          </Box>
        }
      />
    </ToolWorkspace>
  );
}
