import type { ToolCategory, ToolDefinition } from "@/types/tool";

const TOOL_CATEGORIES = [
  {
    id: "developer",
    slug: "developer-tools",
    name: "Developer tools",
    description:
      "Format, inspect, encode, and generate development data without sending it to a server.",
    eyebrow: "Code and data",
    icon: "developer",
    status: "available",
  },
  {
    id: "image",
    slug: "image-tools",
    name: "Image tools",
    description: "Compress, resize, convert, and crop images.",
    eyebrow: "Photos and graphics",
    icon: "image",
    status: "planned",
  },
  {
    id: "text",
    slug: "text-tools",
    name: "Text tools",
    description: "Count, clean, compare, and reshape text in one place.",
    eyebrow: "Writing and cleanup",
    icon: "text",
    status: "planned",
  },
  {
    id: "calculator",
    slug: "calculators",
    name: "Calculators",
    description: "Percentages, loans, interest, and everyday maths with clear workings.",
    eyebrow: "Numbers",
    icon: "calculator",
    status: "planned",
  },
  {
    id: "datetime",
    slug: "date-and-time-tools",
    name: "Date and time tools",
    description: "Work out ages, durations, business days, and time zone differences.",
    eyebrow: "Calendars and clocks",
    icon: "datetime",
    status: "planned",
  },
  {
    id: "generator",
    slug: "generators",
    name: "Generators",
    description: "Passwords, QR codes, random values, and other things you would rather not invent.",
    eyebrow: "Create on demand",
    icon: "generator",
    status: "planned",
  },
  {
    id: "seo",
    slug: "web-and-seo-tools",
    name: "Web and SEO tools",
    description: "Meta tags, social previews, sitemaps, and campaign links for site owners.",
    eyebrow: "Sites and search",
    icon: "seo",
    status: "planned",
  },
  {
    id: "data",
    slug: "data-converters",
    name: "Data converters",
    description: "Move data between CSV, JSON, XML, YAML, and common number formats.",
    eyebrow: "Formats",
    icon: "data",
    status: "planned",
  },
] as const satisfies readonly ToolCategory[];

const TOOL_DEFINITIONS = [
  {
    id: "DEV-01",
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription: "Format, minify, and validate JSON locally.",
    description:
      "Turn compact or difficult-to-read JSON into a clear structure, validate its syntax, or minify it for transport.",
    categoryId: "developer",
    keywords: ["json", "formatter", "validator", "beautifier", "minifier"],
    processingMode: "worker",
    status: "available",
    relatedToolIds: ["DEV-04", "DEV-05", "DEV-02"],
    icon: "json",
  },
  {
    id: "DEV-04",
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    shortDescription: "Encode or decode Base64 text in your browser.",
    description: "Convert plain text to Base64 and decode Base64 without uploading your content.",
    categoryId: "developer",
    keywords: ["base64", "encode", "decode"],
    processingMode: "worker",
    status: "available",
    relatedToolIds: ["DEV-05", "DEV-01"],
    icon: "base64",
  },
  {
    id: "DEV-05",
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    shortDescription: "Safely encode and decode URL components.",
    description: "Prepare query values for URLs or turn encoded components back into readable text.",
    categoryId: "developer",
    keywords: ["url", "encode", "decode", "percent encoding"],
    processingMode: "worker",
    status: "available",
    relatedToolIds: ["DEV-04", "DEV-01"],
    icon: "url",
  },
  {
    id: "DEV-03",
    slug: "uuid-generator",
    name: "UUID Generator",
    shortDescription: "Generate secure UUIDs directly on your device.",
    description: "Create one or more cryptographically secure UUIDs without a network request.",
    categoryId: "developer",
    keywords: ["uuid", "guid", "generator", "random"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-02", "DEV-01"],
    icon: "uuid",
  },
  {
    id: "DEV-02",
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortDescription: "Inspect JWT headers and payloads locally.",
    description:
      "Decode a JSON Web Token for inspection. Decoding does not verify its signature or authenticity.",
    categoryId: "developer",
    keywords: ["jwt", "token", "decoder", "header", "payload"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-01", "DEV-04"],
    icon: "jwt",
  },
] as const satisfies readonly ToolDefinition[];

const categoryBySlug = new Map<string, ToolCategory>(
  TOOL_CATEGORIES.map((category) => [category.slug, category]),
);
const categoryById = new Map<string, ToolCategory>(
  TOOL_CATEGORIES.map((category) => [category.id, category]),
);
const toolBySlug = new Map<string, ToolDefinition>(
  TOOL_DEFINITIONS.map((tool) => [tool.slug, tool]),
);
const toolById = new Map<string, ToolDefinition>(TOOL_DEFINITIONS.map((tool) => [tool.id, tool]));

/**
 * Returns every registered tool category in display order.
 */
export function getToolCategories(): readonly ToolCategory[] {
  return TOOL_CATEGORIES;
}

/**
 * Returns the categories that currently contain at least one available tool.
 */
export function getAvailableToolCategories(): readonly ToolCategory[] {
  return TOOL_CATEGORIES.filter((category) => category.status === "available");
}

/**
 * Finds a category by its public URL slug.
 */
export function getToolCategoryBySlug(slug: string): ToolCategory | undefined {
  return categoryBySlug.get(slug);
}

/**
 * Finds a category by its internal registry identifier.
 */
export function getToolCategoryById(categoryId: string): ToolCategory | undefined {
  return categoryById.get(categoryId);
}

/**
 * Returns every registered tool in display order.
 */
export function getTools(): readonly ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

/**
 * Finds a tool by its public URL slug.
 */
export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolBySlug.get(slug);
}

/**
 * Returns the tools assigned to a category.
 */
export function getToolsByCategory(categoryId: string): readonly ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => tool.categoryId === categoryId);
}

/**
 * Resolves a tool's related-tool references while preserving registry order.
 */
export function getRelatedTools(tool: ToolDefinition): readonly ToolDefinition[] {
  return tool.relatedToolIds.flatMap((toolId) => {
    const relatedTool = toolById.get(toolId);
    return relatedTool ? [relatedTool] : [];
  });
}
