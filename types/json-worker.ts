import type {
  JsonIndentation,
  JsonTransformMode,
  JsonTransformResult,
} from "@/lib/tools/json-formatter";

export interface JsonWorkerRequest {
  input: string;
  mode: JsonTransformMode;
  indentation: JsonIndentation;
}

export type JsonWorkerResponse = JsonTransformResult;

