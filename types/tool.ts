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
  /** Single everyday words that mean this tool, so a visitor who does not know its name can still find it. */
  searchTerms: readonly string[];
  /** Shown in the homepage's popular tools row. Keep this to the few tools worth leading with. */
  featured?: boolean;
  processingMode: ProcessingMode;
  status: ToolStatus;
  relatedToolIds: readonly string[];
  /** The date this tool, or its page, last meaningfully changed (YYYY-MM-DD). Used for the sitemap. */
  updatedAt: string;
  icon: IconKey;
}
