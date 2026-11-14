import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { DateDifferenceTool } from "@/components/tools/date-difference-tool";
import { InterestCalculatorTool } from "@/components/tools/interest-calculator-tool";
import { LoanCalculatorTool } from "@/components/tools/loan-calculator-tool";
import { NumberBaseTool } from "@/components/tools/number-base-tool";
import { PercentageCalculatorTool } from "@/components/tools/percentage-calculator-tool";
import { UnitConverterTool } from "@/components/tools/unit-converter-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  window.history.pushState({}, "", "/");
});

/**
 * Opens a page address, then renders a tool inside the production theme.
 */
function openTool(address: string, tool: ReactElement): HTMLElement {
  window.history.pushState({}, "", address);

  return render(<AppThemeProvider>{tool}</AppThemeProvider>).container;
}

/**
 * Reads the value of the input with the given id.
 */
function inputValue(container: HTMLElement, id: string): string | undefined {
  return container.querySelector<HTMLInputElement>(`#${id}`)?.value;
}

describe("shared calculator links", () => {
  it("fills the loan calculator from a link", async () => {
    openTool("/tools/loan-calculator?amount=10000&rate=6&years=5", <LoanCalculatorTool />);

    await waitFor(() => expect(screen.getByLabelText("Loan amount")).toHaveValue(10000));
    expect(screen.getByRole("button", { name: "Copy link" })).toBeEnabled();
  });

  it("copies a link with the values typed in, and only those", async () => {
    openTool("/tools/loan-calculator", <LoanCalculatorTool />);

    expect(screen.getByRole("button", { name: "Copy link" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Loan amount"), { target: { value: "25000" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("http://localhost:3000/tools/loan-calculator?amount=25000"));
    expect(await screen.findByRole("button", { name: "Link copied" })).toBeInTheDocument();
  });

  it("shows the link to copy by hand when the browser blocks copying", async () => {
    writeText.mockRejectedValue(new Error("blocked"));
    openTool("/tools/loan-calculator?amount=500", <LoanCalculatorTool />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Copy link" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    expect(await screen.findByText(/copy it manually: http:\/\/localhost:3000\/tools\/loan-calculator\?amount=500/)).toBeInTheDocument();
  });

  it("fills dates and the end date option, and ignores a malformed date", async () => {
    const container = openTool("/tools/date-difference-calculator?from=2024-01-01&to=31-12-2024&end=1", <DateDifferenceTool />);

    await waitFor(() => expect(inputValue(container, "difference-from")).toBe("01 Jan 2024"));
    expect(inputValue(container, "difference-to")).toBe("");
    expect(screen.getByLabelText("Include the end date")).toBeChecked();
  });

  it("uses a known mode from the link", async () => {
    openTool("/tools/interest-calculator?mode=simple&amount=1000&rate=5&years=2", <InterestCalculatorTool />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Simple" })).toHaveAttribute("aria-pressed", "true"));
  });

  it("ignores choices the tool does not offer", async () => {
    openTool("/tools/interest-calculator?mode=sideways&amount=1000&rate=5&years=2&every=7", <InterestCalculatorTool />);

    await waitFor(() => expect(screen.getByLabelText("Starting amount")).toHaveValue(1000));
    expect(screen.getByRole("button", { name: "Compound" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("combobox", { name: "Interest is added" })).toHaveTextContent("Monthly");
  });

  it("opens the percentage calculator in the mode the link names", async () => {
    openTool("/tools/percentage-calculator?mode=discount&a=80&b=25", <PercentageCalculatorTool />);

    expect(await screen.findByText("Sale price: 60.00")).toBeInTheDocument();
  });

  it("opens the unit converter on the category and units in the link", async () => {
    openTool("/tools/unit-converter?category=mass&from=lb&to=kg&value=10", <UnitConverterTool />);

    await waitFor(() => expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("Weight"));
    expect(screen.getByRole("combobox", { name: "From" })).toHaveTextContent(/Pound/);
    expect(screen.getByRole("combobox", { name: "To" })).toHaveTextContent(/Kilogram/);
  });

  it("falls back to the category's own units when the link names units from another one", async () => {
    openTool("/tools/unit-converter?category=mass&from=km&to=mile", <UnitConverterTool />);

    await waitFor(() => expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("Weight"));
    expect(screen.getByRole("combobox", { name: "From" })).not.toHaveTextContent(/Kilometre|Kilometer/);
  });

  it("fills the number base converter, ignoring a base outside 2 to 36", async () => {
    openTool("/tools/number-base-converter?n=ff&from=16&to=99", <NumberBaseTool />);

    await waitFor(() => expect(screen.getByLabelText("Number")).toHaveValue("ff"));
    expect(screen.getByRole("combobox", { name: "From base" })).toHaveTextContent(/16/);
    expect(screen.getByRole("combobox", { name: "Also show base" })).toHaveTextContent(/36/);
  });

  it("opens the Roman numeral panel from a link", async () => {
    openTool("/tools/number-base-converter?panel=roman&roman=2024", <NumberBaseTool />);

    await waitFor(() => expect(screen.getByLabelText("Number or Roman numeral")).toHaveValue("2024"));
  });
});
