import { render, screen, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { CsvJsonTool } from "@/components/tools/csv-json-tool";
import { ImageCompressorTool } from "@/components/tools/image-compressor-tool";
import { InterestCalculatorTool } from "@/components/tools/interest-calculator-tool";
import { JsonYamlTool } from "@/components/tools/json-yaml-tool";
import { PasswordGeneratorTool } from "@/components/tools/password-generator-tool";
import { PercentageCalculatorTool } from "@/components/tools/percentage-calculator-tool";
import { QrCodeTool } from "@/components/tools/qr-code-tool";
import { RandomGeneratorTool } from "@/components/tools/random-generator-tool";
import { XmlJsonTool } from "@/components/tools/xml-json-tool";
import { getEngineToolId, getTools, getToolVariants } from "@/lib/tools/tool-registry";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * Finds a toggle button inside the labelled group of toggles.
 */
function toggle(group: string, name: string): HTMLElement {
  return within(screen.getByRole("group", { name: group })).getByRole("button", { name });
}

describe("tools open with the preset a variant page passes", () => {
  it("image compressor: a target size in JPEG", () => {
    renderTool(<ImageCompressorTool preset={{ format: "jpeg", sizeMode: "target", targetKb: "100" }} />);

    expect(toggle("Output format", "JPEG")).toHaveAttribute("aria-pressed", "true");
    expect(toggle("How to shrink", "Target size")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Target size (KB)")).toHaveValue(100);
  });

  it("image compressor: falls back to its usual defaults for values it does not know", () => {
    renderTool(<ImageCompressorTool preset={{ format: "gif", sizeMode: "huge", targetKb: "-1" }} />);

    expect(toggle("Output format", "WebP")).toHaveAttribute("aria-pressed", "true");
    expect(toggle("How to shrink", "Set quality")).toHaveAttribute("aria-pressed", "true");
  });

  it("percentage calculator: the discount mode", () => {
    renderTool(<PercentageCalculatorTool preset={{ mode: "discount" }} />);

    expect(screen.getByLabelText("Original price")).toBeInTheDocument();
    expect(screen.getByLabelText("Discount")).toBeInTheDocument();
  });

  it("interest calculator: simple interest", () => {
    renderTool(<InterestCalculatorTool preset={{ mode: "simple" }} />);

    expect(toggle("Type of interest", "Simple")).toHaveAttribute("aria-pressed", "true");
  });

  it("data converters: the JSON first direction", () => {
    renderTool(<CsvJsonTool preset={{ direction: "jsonToCsv" }} />);
    expect(screen.getByRole("button", { name: "JSON to CSV" })).toHaveAttribute("aria-pressed", "true");
  });

  it("JSON and YAML converter: JSON to YAML", () => {
    renderTool(<JsonYamlTool preset={{ direction: "jsonToYaml" }} />);
    expect(screen.getByRole("button", { name: "JSON to YAML" })).toHaveAttribute("aria-pressed", "true");
  });

  it("XML and JSON converter: JSON to XML, and the first direction for an unknown one", () => {
    const { unmount } = render(
      <AppThemeProvider>
        <XmlJsonTool preset={{ direction: "jsonToXml" }} />
      </AppThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "JSON to XML" })).toHaveAttribute("aria-pressed", "true");
    unmount();

    renderTool(<XmlJsonTool preset={{ direction: "sideways" }} />);
    expect(screen.getByRole("button", { name: "XML to JSON" })).toHaveAttribute("aria-pressed", "true");
  });

  it("password generator: passphrases", () => {
    renderTool(<PasswordGeneratorTool preset={{ mode: "passphrase" }} />);

    expect(screen.getByRole("button", { name: "Passphrase" })).toHaveAttribute("aria-pressed", "true");
  });

  it("QR code generator: a Wi-Fi code", () => {
    renderTool(<QrCodeTool preset={{ kind: "wifi" }} />);

    expect(screen.getByLabelText("Network name (SSID)")).toBeInTheDocument();
  });

  it("random generator: dice", () => {
    renderTool(<RandomGeneratorTool preset={{ mode: "dice" }} />);

    expect(screen.getByLabelText("Sides")).toBeVisible();
  });

  it("random generator: the list picker, making teams", () => {
    renderTool(<RandomGeneratorTool preset={{ action: "teams", mode: "list" }} />);

    expect(toggle("What to do with the list", "Make teams")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Number of teams")).toBeVisible();
  });
});

describe("variant pages in the registry", () => {
  const variants = getTools().filter((tool) => tool.variant !== undefined);

  it("are listed as shortcuts on their base tool's page", () => {
    for (const tool of variants) {
      const baseId = getEngineToolId(tool);

      expect(getToolVariants(baseId).map((variant) => variant.id), tool.id).toContain(tool.id);
    }
  });

  it("link back to their base tool first, so the general tool is one click away", () => {
    for (const tool of variants) {
      expect(tool.relatedToolIds[0], tool.id).toBe(tool.variant?.baseToolId);
    }
  });

  it("stay in their base tool's category", () => {
    const byId = new Map(getTools().map((tool) => [tool.id, tool]));

    for (const tool of variants) {
      expect(tool.categoryId, tool.id).toBe(byId.get(tool.variant?.baseToolId ?? "")?.categoryId);
    }
  });
});
