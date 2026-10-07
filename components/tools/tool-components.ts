import type { ComponentType } from "react";
import { AgeCalculatorTool } from "@/components/tools/age-calculator-tool";
import { Base64EncoderDecoderTool } from "@/components/tools/base64-encoder-decoder-tool";
import { CaseConverterTool } from "@/components/tools/case-converter-tool";
import { CharacterCounterTool } from "@/components/tools/character-counter-tool";
import { DateDifferenceTool } from "@/components/tools/date-difference-tool";
import { DateMathTool } from "@/components/tools/date-math-tool";
import { ExcelDateTool } from "@/components/tools/excel-date-tool";
import { FaviconGeneratorTool } from "@/components/tools/favicon-generator-tool";
import { HashGeneratorTool } from "@/components/tools/hash-generator-tool";
import { HoursWorkedTool } from "@/components/tools/hours-worked-tool";
import { ImageCompressorTool } from "@/components/tools/image-compressor-tool";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import { JsonFormatterTool } from "@/components/tools/json-formatter-tool";
import { JwtDecoderTool } from "@/components/tools/jwt-decoder-tool";
import { RemoveDuplicateLinesTool } from "@/components/tools/remove-duplicate-lines-tool";
import { SortLinesTool } from "@/components/tools/sort-lines-tool";
import { PasswordGeneratorTool } from "@/components/tools/password-generator-tool";
import { QrCodeTool } from "@/components/tools/qr-code-tool";
import { RandomGeneratorTool } from "@/components/tools/random-generator-tool";
import { UnixTimestampTool } from "@/components/tools/unix-timestamp-tool";
import { UrlEncoderDecoderTool } from "@/components/tools/url-encoder-decoder-tool";
import { UuidGeneratorTool } from "@/components/tools/uuid-generator-tool";
import { WordCounterTool } from "@/components/tools/word-counter-tool";

/**
 * Maps a registry tool id to the component that renders its workspace.
 * Every tool with status "available" in the registry must have an entry here; a test enforces it.
 */
export const TOOL_COMPONENTS: Readonly<Record<string, ComponentType>> = {
  "DEV-01": JsonFormatterTool,
  "DEV-04": Base64EncoderDecoderTool,
  "DEV-05": UrlEncoderDecoderTool,
  "DEV-03": UuidGeneratorTool,
  "DEV-02": JwtDecoderTool,
  "DEV-08": HashGeneratorTool,
  "DTM-01": AgeCalculatorTool,
  "DTM-02": DateDifferenceTool,
  "DTM-04": DateMathTool,
  "DTM-06": HoursWorkedTool,
  "DTM-08": UnixTimestampTool,
  "DTM-11": ExcelDateTool,
  "IMG-01": ImageCompressorTool,
  "IMG-02": ImageResizerTool,
  "IMG-12": FaviconGeneratorTool,
  "GEN-01": PasswordGeneratorTool,
  "GEN-02": QrCodeTool,
  "GEN-03": RandomGeneratorTool,
  "TXT-01": WordCounterTool,
  "TXT-02": CharacterCounterTool,
  "TXT-03": CaseConverterTool,
  "TXT-07": SortLinesTool,
  "TXT-08": RemoveDuplicateLinesTool,
};
