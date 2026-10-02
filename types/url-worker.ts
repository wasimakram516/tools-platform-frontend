import type { UrlTransformMode, UrlTransformResult } from "@/lib/tools/url-encoder";

export interface UrlWorkerRequest {
  input: string;
  mode: UrlTransformMode;
}

export type UrlWorkerResponse = UrlTransformResult;
