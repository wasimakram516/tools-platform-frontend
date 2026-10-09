import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Maps a registry tool id to the component that renders its workspace.
 *
 * Each component loads on its own, so a tool page downloads the code for that one tool, not for
 * all of them. That keeps pages light, which helps both visitors and search rankings. The page is
 * still rendered on the server, so the tool's words are in the HTML.
 *
 * Every tool with status "available" in the registry must have an entry here; a test enforces it.
 */
export const TOOL_COMPONENTS: Readonly<Record<string, ComponentType>> = {
  "DEV-01": dynamic(() => import("@/components/tools/json-formatter-tool").then((module) => module.JsonFormatterTool)),
  "DEV-04": dynamic(() => import("@/components/tools/base64-encoder-decoder-tool").then((module) => module.Base64EncoderDecoderTool)),
  "DEV-05": dynamic(() => import("@/components/tools/url-encoder-decoder-tool").then((module) => module.UrlEncoderDecoderTool)),
  "DEV-03": dynamic(() => import("@/components/tools/uuid-generator-tool").then((module) => module.UuidGeneratorTool)),
  "DEV-02": dynamic(() => import("@/components/tools/jwt-decoder-tool").then((module) => module.JwtDecoderTool)),
  "DEV-08": dynamic(() => import("@/components/tools/hash-generator-tool").then((module) => module.HashGeneratorTool)),
  "CAL-01": dynamic(() => import("@/components/tools/percentage-calculator-tool").then((module) => module.PercentageCalculatorTool)),
  "CAL-05": dynamic(() => import("@/components/tools/loan-calculator-tool").then((module) => module.LoanCalculatorTool)),
  "CAL-07": dynamic(() => import("@/components/tools/interest-calculator-tool").then((module) => module.InterestCalculatorTool)),
  "CAL-04": dynamic(() => import("@/components/tools/bmi-calculator-tool").then((module) => module.BmiCalculatorTool)),
  "CAL-10": dynamic(() => import("@/components/tools/tip-split-tool").then((module) => module.TipSplitTool)),
  "DTM-01": dynamic(() => import("@/components/tools/age-calculator-tool").then((module) => module.AgeCalculatorTool)),
  "DTM-02": dynamic(() => import("@/components/tools/date-difference-tool").then((module) => module.DateDifferenceTool)),
  "DTM-04": dynamic(() => import("@/components/tools/date-math-tool").then((module) => module.DateMathTool)),
  "DTM-06": dynamic(() => import("@/components/tools/hours-worked-tool").then((module) => module.HoursWorkedTool)),
  "DTM-08": dynamic(() => import("@/components/tools/unix-timestamp-tool").then((module) => module.UnixTimestampTool)),
  "DTM-11": dynamic(() => import("@/components/tools/excel-date-tool").then((module) => module.ExcelDateTool)),
  "IMG-01": dynamic(() => import("@/components/tools/image-compressor-tool").then((module) => module.ImageCompressorTool)),
  "IMG-02": dynamic(() => import("@/components/tools/image-resizer-tool").then((module) => module.ImageResizerTool)),
  "IMG-12": dynamic(() => import("@/components/tools/favicon-generator-tool").then((module) => module.FaviconGeneratorTool)),
  "GEN-01": dynamic(() => import("@/components/tools/password-generator-tool").then((module) => module.PasswordGeneratorTool)),
  "GEN-02": dynamic(() => import("@/components/tools/qr-code-tool").then((module) => module.QrCodeTool)),
  "GEN-03": dynamic(() => import("@/components/tools/random-generator-tool").then((module) => module.RandomGeneratorTool)),
  "TXT-01": dynamic(() => import("@/components/tools/word-counter-tool").then((module) => module.WordCounterTool)),
  "TXT-02": dynamic(() => import("@/components/tools/character-counter-tool").then((module) => module.CharacterCounterTool)),
  "TXT-03": dynamic(() => import("@/components/tools/case-converter-tool").then((module) => module.CaseConverterTool)),
  "TXT-07": dynamic(() => import("@/components/tools/sort-lines-tool").then((module) => module.SortLinesTool)),
  "TXT-08": dynamic(() => import("@/components/tools/remove-duplicate-lines-tool").then((module) => module.RemoveDuplicateLinesTool)),
};
