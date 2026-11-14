import type { IconKey } from "@/components/ui/tool-icon";
import type { ToolPreset } from "@/lib/tools/tool-preset";

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
  /**
   * Set on a page made for one job that another tool already does, such as PNG to JPG. The page
   * gets its own address, title, and questions, and opens the base tool with these settings.
   */
  variant?: ToolVariant;
}

export interface ToolVariant {
  /** The registry id of the tool whose component this page uses. */
  baseToolId: string;
  /** The settings the base tool opens with. */
  preset: ToolPreset;
}
