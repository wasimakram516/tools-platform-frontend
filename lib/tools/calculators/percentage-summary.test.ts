// @vitest-environment node
import { describe, expect, it } from "vitest";
import { fieldsFor, summarizePercentage, type MarginMode, type PercentageMode } from "@/lib/tools/calculators/percentage-summary";

interface Options {
  direction: "increase" | "decrease";
  marginMode: MarginMode;
}

const DEFAULTS: Options = { direction: "increase", marginMode: "fromPrice" };

function summary(mode: PercentageMode, first: string, second: string, options: Partial<Options> = {}) {
  return summarizePercentage(mode, first, second, { ...DEFAULTS, ...options });
}

describe("summarizePercentage", () => {
  it("waits while a field is empty", () => {
    expect(summary("percentOf", "", "200")).toBeNull();
    expect(summary("percentOf", "15", "")).toBeNull();
  });

  it("answers each mode in a sentence", () => {
    expect(summary("percentOf", "15", "200")).toEqual({ headline: "15% of 200 is 30", rows: [] });
    expect(summary("whatPercent", "30", "200")).toEqual({ headline: "30 is 15% of 200", rows: [] });
  });

  it("shows percentage change with its direction and difference", () => {
    expect(summary("change", "50", "75")).toEqual({
      headline: "50% increase",
      rows: [
        { label: "From", value: "50" },
        { label: "To", value: "75" },
        { label: "Difference", value: "25" },
      ],
    });
    expect(summary("change", "75", "50")).toMatchObject({ headline: "33.3333% decrease" });
    expect(summary("change", "5", "5")).toMatchObject({ headline: "No change" });
  });

  it("increases and decreases a number", () => {
    expect(summary("adjust", "200", "15")).toMatchObject({ headline: "200 + 15% = 230" });
    expect(summary("adjust", "200", "15", { direction: "decrease" })).toEqual({
      headline: "200 - 15% = 170",
      rows: [{ label: "Amount taken off", value: "30" }],
    });
  });

  it("shows the sale price and what is saved", () => {
    expect(summary("discount", "80", "20")).toEqual({
      headline: "Sale price: 64.00",
      rows: [
        { label: "Original price", value: "80.00" },
        { label: "You save", value: "16.00" },
      ],
    });
  });

  it("shows margin and markup separately", () => {
    expect(summary("margin", "60", "100")).toMatchObject({
      headline: "Margin: 40%",
      rows: [
        { label: "Markup (profit as a share of the cost)", value: "66.67%" },
        { label: "Profit", value: "40.00" },
        { label: "Selling price", value: "100.00" },
      ],
    });
    expect(summary("margin", "60", "50", { marginMode: "fromMarkup" })).toMatchObject({ headline: "Selling price: 90.00" });
    expect(summary("margin", "60", "40", { marginMode: "fromMargin" })).toMatchObject({ headline: "Selling price: 100.00" });
  });

  it("passes on a calculation problem as a message", () => {
    expect(summary("whatPercent", "5", "0")).toMatchObject({ message: expect.stringContaining("cannot be zero") });
    expect(summary("discount", "80", "150")).toMatchObject({ message: expect.stringContaining("between 0% and 100%") });
  });
});

describe("fieldsFor", () => {
  it("labels the inputs for each mode, with a percent sign where one is typed", () => {
    expect(fieldsFor("percentOf", "fromPrice")).toMatchObject({ firstSuffix: "%", secondLabel: "Of this number" });
    expect(fieldsFor("discount", "fromPrice")).toMatchObject({ secondLabel: "Discount", secondSuffix: "%" });
    expect(fieldsFor("margin", "fromPrice").secondSuffix).toBeUndefined();
    expect(fieldsFor("margin", "fromMarkup")).toMatchObject({ secondLabel: "Markup", secondSuffix: "%" });
    expect(fieldsFor("margin", "fromMargin")).toMatchObject({ secondLabel: "Margin", secondSuffix: "%" });
  });
});
