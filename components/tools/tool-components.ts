import type { ComponentType } from "react";
import { Base64EncoderDecoderTool } from "@/components/tools/base64-encoder-decoder-tool";
import { JsonFormatterTool } from "@/components/tools/json-formatter-tool";
import { JwtDecoderTool } from "@/components/tools/jwt-decoder-tool";
import { UrlEncoderDecoderTool } from "@/components/tools/url-encoder-decoder-tool";
import { UuidGeneratorTool } from "@/components/tools/uuid-generator-tool";

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
};
