import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { generateUuidBatch } from "@/lib/tools/uuid-generator";
import type { UuidBatchGenerator } from "./uuid-generator-tool";
import { UuidGeneratorTool } from "./uuid-generator-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const UUID_ONE = "123e4567-e89b-42d3-a456-426614174000";
const UUID_TWO = "123e4567-e89b-42d3-a456-426614174001";

/**
 * Generates deterministic UUIDs for component interaction tests.
 */
function testGenerate(count: number, uppercase: boolean): ReturnType<typeof generateUuidBatch> {
  const values = [UUID_ONE, UUID_TWO];
  let index = 0;

  return generateUuidBatch(count, uppercase, () => values[index++] ?? UUID_ONE);
}

/**
 * Renders the UUID tool with a deterministic generator.
 */
function renderUuidTool(generate: UuidBatchGenerator = testGenerate): void {
  render(
    <AppThemeProvider>
      <UuidGeneratorTool generate={generate} />
    </AppThemeProvider>,
  );
}

describe("UuidGeneratorTool", () => {
  it("generates the requested UUID batch and reports output characters", async () => {
    const user = userEvent.setup();
    renderUuidTool();

    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "2" } });
    await user.click(screen.getByRole("button", { name: "Generate UUIDs" }));

    expect(screen.getByLabelText("Generated UUIDs")).toHaveValue(`${UUID_ONE}\n${UUID_TWO}`);
    expect(screen.getByText("73 characters")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("2 UUIDs generated securely");
  });

  it("changes existing output casing without regenerating values", async () => {
    const generate = vi.fn(testGenerate);
    const user = userEvent.setup();
    renderUuidTool(generate);

    await user.click(screen.getByRole("button", { name: "Generate UUIDs" }));
    await user.click(screen.getByRole("switch", { name: "Uppercase" }));

    expect(screen.getByLabelText("Generated UUIDs")).toHaveValue(UUID_ONE.toUpperCase());
    expect(generate).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Output casing updated");
  });

  it("shows quantity errors and clears stale output", async () => {
    const user = userEvent.setup();
    renderUuidTool();

    await user.click(screen.getByRole("button", { name: "Generate UUIDs" }));
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "101" } });
    await user.click(screen.getByRole("button", { name: "Generate UUIDs" }));

    expect(screen.getByRole("alert")).toHaveTextContent("whole number between 1 and 100");
    expect(screen.getByLabelText("Generated UUIDs")).toHaveValue("");
  });

  it("copies and clears generated UUIDs", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderUuidTool();

    await user.click(screen.getByRole("button", { name: "Generate UUIDs" }));
    await user.click(screen.getByRole("button", { name: "Copy all" }));
    expect(writeText).toHaveBeenCalledWith(UUID_ONE);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Generated UUIDs")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Copy all" })).toBeDisabled();
  });
});
