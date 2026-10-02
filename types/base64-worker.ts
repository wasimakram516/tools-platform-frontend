import type { Base64TransformMode, Base64TransformResult } from "@/lib/tools/base64";

export interface Base64WorkerRequest {
  input: string;
  mode: Base64TransformMode;
}

export type Base64WorkerResponse = Base64TransformResult;
