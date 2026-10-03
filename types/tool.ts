import type { IconKey } from "@/components/ui/tool-icon";

export type ProcessingMode = "browser" | "worker" | "wasm" | "server";

export type ToolStatus = "available" | "planned";

export type CategoryStatus = "available" | "planned";

export interface ToolCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  eyebrow: string;
  icon: IconKey;
  status: CategoryStatus;
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
  icon: IconKey;
}
