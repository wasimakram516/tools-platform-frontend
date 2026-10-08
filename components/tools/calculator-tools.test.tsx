import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { BmiCalculatorTool } from "@/components/tools/bmi-calculator-tool";
import { InterestCalculatorTool } from "@/components/tools/interest-calculator-tool";
import { LoanCalculatorTool } from "@/components/tools/loan-calculator-tool";
import { PercentageCalculatorTool } from "@/components/tools/percentage-calculator-tool";
import { TipSplitTool } from "@/components/tools/tip-split-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const downloadBlob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/tools/download", () => ({ downloadBlob }));

beforeEach(() => {
  downloadBlob.mockClear();
});

/**
 * Renders a tool inside the production theme.
 */
function renderTool(tool: ReactElement): void {
  render(<AppThemeProvider>{tool}</AppThemeProvider>);
}

/**
 * Types a value into a labelled field.
 */
function fill(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * Chooses an option in a drop-down, the way a person would.
 */
function choose(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
}

describe("PercentageCalculatorTool", () => {
  it("asks for both numbers before showing an answer", () => {
    renderTool(<PercentageCalculatorTool />);

    expect(screen.getByText("Enter both numbers to see the answer.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy result" })).not.toBeInTheDocument();
  });

  it("answers in a sentence as the numbers are typed", () => {
    renderTool(<PercentageCalculatorTool />);

    fill("Percentage", "15");
    fill("Of this number", "200");

    expect(screen.getByText("15% of 200 is 30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy result" })).toBeInTheDocument();
  });

  it("changes its fields for each kind of calculation", () => {
    renderTool(<PercentageCalculatorTool />);

    choose("What do you want to work out?", "Discount and sale price");
    fill("Original price", "80");
    fill("Discount", "20");

    expect(screen.getByText("Sale price: 64.00")).toBeInTheDocument();
    expect(screen.getByText("16.00")).toBeInTheDocument();
  });

  it("keeps margin and markup apart", () => {
    renderTool(<PercentageCalculatorTool />);

    choose("What do you want to work out?", "Margin and markup");
    fill("Cost", "60");
    fill("Selling price", "100");

    expect(screen.getByText("Margin: 40%")).toBeInTheDocument();
    expect(screen.getByText("66.67%")).toBeInTheDocument();
  });

  it("increases or decreases a number", () => {
    renderTool(<PercentageCalculatorTool />);

    choose("What do you want to work out?", "Increase or decrease a number by a percentage");
    fill("Number", "200");
    fill("Percentage", "15");
    expect(screen.getByText("200 + 15% = 230")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(screen.getByText("200 - 15% = 170")).toBeInTheDocument();
  });

  it("explains a problem instead of showing a wrong answer", () => {
    renderTool(<PercentageCalculatorTool />);

    choose("What do you want to work out?", "X is what % of a number?");
    fill("Number", "5");
    fill("Out of", "0");

    expect(screen.getByText(/cannot be zero/)).toBeInTheDocument();
  });

  it("clears everything on reset", () => {
    renderTool(<PercentageCalculatorTool />);

    fill("Percentage", "15");
    fill("Of this number", "200");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Percentage")).toHaveValue(null);
    expect(screen.getByText("Enter both numbers to see the answer.")).toBeInTheDocument();
  });
});

describe("LoanCalculatorTool", () => {
  /**
   * Fills the loan used throughout: 200,000 at 6% for 30 years.
   */
  function fillStandardLoan(): void {
    fill("Loan amount", "200000");
    fill("Interest rate per year", "6");
    fill("Term (years)", "30");
  }

  it("shows the monthly payment and the totals", () => {
    renderTool(<LoanCalculatorTool />);

    fillStandardLoan();

    expect(screen.getByText("Monthly payment: 1,199.10")).toBeInTheDocument();
    expect(screen.getByText("231,676.38")).toBeInTheDocument();
    expect(screen.getByText("431,676.38")).toBeInTheDocument();
    expect(screen.getByText("30 years")).toBeInTheDocument();
  });

  it("shows the first rows of the schedule and the rest on request", () => {
    renderTool(<LoanCalculatorTool />);

    fillStandardLoan();

    const table = screen.getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(13);
    fireEvent.click(screen.getByRole("button", { name: "Show all 360 rows (348 more)" }));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(361);
    expect(screen.getByRole("button", { name: "Show fewer rows" })).toBeInTheDocument();
  });

  it("offers the whole schedule as a CSV file", () => {
    renderTool(<LoanCalculatorTool />);

    fillStandardLoan();
    fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));

    expect(downloadBlob).toHaveBeenCalledTimes(1);
    expect(downloadBlob.mock.calls[0]?.[1]).toBe("loan-repayment-schedule.csv");
  });

  it("shows what an extra monthly payment saves", () => {
    renderTool(<LoanCalculatorTool />);

    fillStandardLoan();
    fill("Extra payment each month", "200");

    expect(screen.getByText("21 years")).toBeInTheDocument();
    expect(screen.getByText("79,800.51")).toBeInTheDocument();
    expect(screen.getByText("9 years")).toBeInTheDocument();
    expect(within(screen.getByRole("status")).getByText("1,399.10")).toBeInTheDocument();
  });

  it("explains a term that is too long", () => {
    renderTool(<LoanCalculatorTool />);

    fill("Loan amount", "200000");
    fill("Interest rate per year", "6");
    fill("Term (years)", "60");

    expect(screen.getByText(/The term must be between 1 month and 50 years/)).toBeInTheDocument();
  });
});

describe("InterestCalculatorTool", () => {
  it("compounds interest by default", () => {
    renderTool(<InterestCalculatorTool />);

    fill("Starting amount", "10000");
    fill("Interest rate per year", "5");
    fill("Time (years)", "10");

    expect(screen.getByText("Final balance: 16,470.09")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  });

  it("switches to simple interest and drops the compounding choice", () => {
    renderTool(<InterestCalculatorTool />);

    fill("Starting amount", "10000");
    fill("Interest rate per year", "5");
    fill("Time (years)", "3");
    fireEvent.click(screen.getByRole("button", { name: "Simple" }));

    expect(screen.getByText("Final balance: 11,500.00")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Interest is added" })).not.toBeInTheDocument();
  });

  it("changes the answer when interest is added more often", () => {
    renderTool(<InterestCalculatorTool />);

    fill("Starting amount", "10000");
    fill("Interest rate per year", "5");
    fill("Time (years)", "10");
    choose("Interest is added", "Yearly");

    expect(screen.getByText("Final balance: 16,288.95")).toBeInTheDocument();
  });

  it("adds a monthly amount", () => {
    renderTool(<InterestCalculatorTool />);

    fill("Starting amount", "10000");
    fill("Interest rate per year", "5");
    fill("Time (years)", "10");
    fill("Monthly addition", "200");

    expect(screen.getByText("Final balance: 47,526.55")).toBeInTheDocument();
  });
});

describe("BmiCalculatorTool", () => {
  it("shows the BMI, its range, and the healthy weight for the height", () => {
    renderTool(<BmiCalculatorTool />);

    fill("Height", "175");
    fill("Weight", "70");

    expect(screen.getByText("BMI 22.9: Healthy weight")).toBeInTheDocument();
    expect(screen.getByText("56.7 to 76.3 kg")).toBeInTheDocument();
    expect(screen.getByText(/not a diagnosis/)).toBeInTheDocument();
  });

  it("lets height and weight each use their own unit", () => {
    renderTool(<BmiCalculatorTool />);

    choose("Height unit", "m");
    fill("Height", "1.75");
    choose("Weight unit", "lb");
    fill("Weight", "154.32");

    expect(screen.getByText("BMI 22.9: Healthy weight")).toBeInTheDocument();
    expect(screen.getByText("124.9 to 168.1 lb")).toBeInTheDocument();
  });

  it("takes feet and inches as two numbers", () => {
    renderTool(<BmiCalculatorTool />);

    choose("Height unit", "ft and in");
    fill("Feet", "5");
    fill("Inches", "9");
    choose("Weight unit", "lb");
    fill("Weight", "160");

    expect(screen.getByText("BMI 23.6: Healthy weight")).toBeInTheDocument();
  });

  it("clears the height when its unit changes, so 175 is never read as 175 metres", () => {
    renderTool(<BmiCalculatorTool />);

    fill("Height", "175");
    choose("Height unit", "m");

    expect(screen.getByLabelText("Height")).toHaveValue(null);
  });

  it("explains a height that cannot be real", () => {
    renderTool(<BmiCalculatorTool />);

    fill("Height", "20");
    fill("Weight", "70");

    expect(screen.getByText("Enter a height between 50 cm and 272 cm.")).toBeInTheDocument();
  });

  it("marks the range the result falls in", () => {
    renderTool(<BmiCalculatorTool />);

    fill("Height", "175");
    fill("Weight", "70");

    expect(screen.getByText("Healthy weight", { selector: "p" }).closest("li")).toHaveAttribute("aria-current", "true");
  });
});

describe("TipSplitTool", () => {
  it("starts with a 15% tip for two people", () => {
    renderTool(<TipSplitTool />);

    fill("Bill", "120.5");

    expect(screen.getByText("Each person pays 69.29")).toBeInTheDocument();
  });

  it("changes the tip with one tap and splits between more people", () => {
    renderTool(<TipSplitTool />);

    fill("Bill", "120.5");
    fireEvent.click(screen.getByRole("button", { name: "18%" }));
    fill("People", "4");

    expect(screen.getByLabelText("Tip")).toHaveValue(18);
    expect(screen.getByText("Each person pays 35.55")).toBeInTheDocument();
    expect(screen.getByText("142.19")).toBeInTheDocument();
  });

  it("rounds each share up and shows the larger tip", () => {
    renderTool(<TipSplitTool />);

    fill("Bill", "120.5");
    fireEvent.click(screen.getByRole("button", { name: "18%" }));
    fill("People", "4");
    fireEvent.click(screen.getByRole("switch", { name: "Round each share up" }));

    expect(screen.getByText("Each person pays 36.00")).toBeInTheDocument();
    expect(screen.getByText("144.00")).toBeInTheDocument();
    expect(screen.getByText("19.5%")).toBeInTheDocument();
  });

  it("explains a missing or impossible bill", () => {
    renderTool(<TipSplitTool />);

    expect(screen.getByText("Enter the bill to see what each person pays.")).toBeInTheDocument();
    fill("Bill", "0");
    expect(screen.getByText("Enter a bill above zero.")).toBeInTheDocument();
  });

  it("puts everything back on reset", () => {
    renderTool(<TipSplitTool />);

    fill("Bill", "50");
    fireEvent.click(screen.getByRole("button", { name: "20%" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Bill")).toHaveValue(null);
    expect(screen.getByLabelText("Tip")).toHaveValue(15);
  });
});
