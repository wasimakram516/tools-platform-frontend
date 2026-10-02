export type ProcessingMode = "browser" | "worker" | "wasm" | "server";
export type ToolStatus = "available" | "planned";

export interface ToolCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  eyebrow: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  keywords: readonly string[];
  processingMode: ProcessingMode;
  status: ToolStatus;
  relatedToolIds: readonly string[];
  badge: string;
}

