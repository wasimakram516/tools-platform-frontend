import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { AgeCalculatorTool } from "@/components/tools/age-calculator-tool";
import { DateDifferenceTool } from "@/components/tools/date-difference-tool";
import { DateMathTool } from "@/components/tools/date-math-tool";
import { ExcelDateTool } from "@/components/tools/excel-date-tool";
import { HoursWorkedTool } from "@/components/tools/hours-worked-tool";
import { UnixTimestampTool } from "@/components/tools/unix-timestamp-tool";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

vi.mock("@/components/tools/form-fields", () => {
  /**
   * Stands in for the real pickers so these tests can type ISO values directly; the pickers
   * themselves are covered in form-fields.test.tsx.
   */
  const fieldFor =
    (type: string) =>
    // A stand-in for a picker in a test, so it needs no display name.
    // eslint-disable-next-line react/display-name
    ({
      id,
      label,
      max,
      min,
      onChange,
      value,
    }: {
      id: string;
      label: string;
      max?: number;
      min?: number;
      onChange: (value: string) => void;
      value: string;
    }) => (
      <label htmlFor={id}>
        {label}
        <input
          id={id}
          max={max}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          value={value}
        />
      </label>
    );

  return {
    DateField: fieldFor("date"),
    DateTimeField: fieldFor("datetime-local"),
    NumberField: fieldFor("number"),
    TimeField: fieldFor("time"),
  };
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

describe("AgeCalculatorTool", () => {
  it("asks for a date of birth before showing anything", () => {
    renderTool(<AgeCalculatorTool getToday={() => "2026-10-07"} />);

    expect(screen.getByText("Enter a date of birth to see the exact age.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy result" })).not.toBeInTheDocument();
  });

  it("shows the exact age, the totals, and the next birthday", () => {
    renderTool(<AgeCalculatorTool getToday={() => "2026-10-07"} />);

    fill("Date of birth", "1990-05-15");

    expect(screen.getByText("36 years, 4 months, 22 days")).toBeInTheDocument();
    expect(screen.getByText("13,294")).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(screen.getByText("Saturday, 15 May 2027")).toBeInTheDocument();
    expect(screen.getByText("220 days")).toBeInTheDocument();
  });

  it("uses the chosen date instead of today, and explains a birth date in the future", () => {
    renderTool(<AgeCalculatorTool getToday={() => "2026-10-07"} />);

    fill("Date of birth", "2000-10-07");
    fill("Age at date", "2026-10-07");
    expect(screen.getByText("26 years")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();

    fill("Date of birth", "2030-01-01");
    expect(
      screen.getByText("The date of birth is after the date to calculate the age at."),
    ).toBeInTheDocument();
  });

  it("clears everything with Reset", () => {
    renderTool(<AgeCalculatorTool getToday={() => "2026-10-07"} />);

    fill("Date of birth", "1990-05-15");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Date of birth")).toHaveValue("");
    expect(screen.getByText("Enter a date of birth to see the exact age.")).toBeInTheDocument();
  });

  it("copies the result and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTool(<AgeCalculatorTool getToday={() => "2026-10-07"} />);

    fill("Date of birth", "1990-05-15");
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));

    expect(await screen.findByText("Result copied.")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("36 years, 4 months, 22 days"));
  });
});

describe("DateDifferenceTool", () => {
  it("shows the span and the total days, and counts the end date when asked", () => {
    renderTool(<DateDifferenceTool />);

    fill("Start date", "2026-01-01");
    fill("End date", "2026-12-31");

    expect(screen.getByText("11 months, 30 days")).toBeInTheDocument();
    expect(screen.getByText("364")).toBeInTheDocument();
    expect(screen.getByText("The end date is after the start date")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Include the end date"));

    expect(screen.getByText("365")).toBeInTheDocument();
  });

  it("reports when the end date comes first", () => {
    renderTool(<DateDifferenceTool />);

    fill("Start date", "2026-03-01");
    fill("End date", "2026-01-01");

    expect(screen.getByText("The end date is before the start date")).toBeInTheDocument();
  });
});

describe("DateMathTool", () => {
  it("adds years, months, weeks, and days", () => {
    renderTool(<DateMathTool getToday={() => "2026-10-07"} />);

    fill("Years", "1");
    fill("Months", "2");
    fill("Weeks", "3");
    fill("Days", "4");

    expect(screen.getByText("Saturday, 1 January 2028")).toBeInTheDocument();
    expect(screen.getByText("451 days later")).toBeInTheDocument();
  });

  it("subtracts with month-end clamping when switched to Subtract", () => {
    renderTool(<DateMathTool getToday={() => "2026-10-07"} />);

    fill("Start date", "2026-03-31");
    fill("Months", "1");
    fireEvent.click(screen.getByRole("button", { name: "Subtract" }));

    expect(screen.getByText("Saturday, 28 February 2026")).toBeInTheDocument();
    expect(screen.getByText("31 days earlier")).toBeInTheDocument();
  });

  it("waits for an amount, and rejects a negative one", () => {
    renderTool(<DateMathTool getToday={() => "2026-10-07"} />);

    expect(
      screen.getByText("Enter an amount of years, months, weeks, or days to see the new date."),
    ).toBeInTheDocument();

    fill("Days", "-3");

    expect(screen.getByText("Amounts must be whole numbers from 0 to 1,000,000.")).toBeInTheDocument();
  });
});

describe("HoursWorkedTool", () => {
  it("subtracts the break and shows decimal hours", () => {
    renderTool(<HoursWorkedTool />);

    fill("Start time", "09:00");
    fill("End time", "17:30");
    fill("Break (minutes)", "30");

    expect(screen.getByText("8h 00m")).toBeInTheDocument();
    expect(screen.getByText("8.00")).toBeInTheDocument();
    expect(screen.queryByText("The next day")).not.toBeInTheDocument();
  });

  it("recognises a shift that runs past midnight", () => {
    renderTool(<HoursWorkedTool />);

    fill("Start time", "22:00");
    fill("End time", "06:00");

    // The net time and the shift before the break are both 8h 00m with no break taken.
    expect(screen.getAllByText("8h 00m")).toHaveLength(2);
    expect(screen.getByText("The next day")).toBeInTheDocument();
  });

  it("explains equal times", () => {
    renderTool(<HoursWorkedTool />);

    fill("Start time", "09:00");
    fill("End time", "09:00");

    expect(
      screen.getByText("The start and end times are the same. Change one of them."),
    ).toBeInTheDocument();
  });
});

describe("UnixTimestampTool", () => {
  it("starts on the date picker and asks for a date and time", () => {
    renderTool(<UnixTimestampTool />);

    expect(screen.getByLabelText("Date and time")).toBeInTheDocument();
    expect(screen.getByText("Pick a date and time to see the Unix timestamp.")).toBeInTheDocument();
  });

  it("converts a timestamp to a date as you type", () => {
    renderTool(<UnixTimestampTool />);

    fireEvent.click(screen.getByRole("button", { name: "Timestamp to date" }));

    expect(screen.getByText("Enter a Unix timestamp to see the date.")).toBeInTheDocument();

    fill("Unix timestamp", "1760000000");

    expect(screen.getByText("09 Oct 2025, 08:53:20 am UTC")).toBeInTheDocument();
    expect(screen.getByText("seconds")).toBeInTheDocument();
  });

  it("rejects a timestamp that is not a number", () => {
    renderTool(<UnixTimestampTool />);

    fireEvent.click(screen.getByRole("button", { name: "Timestamp to date" }));

    fill("Unix timestamp", "tomorrow");

    expect(screen.getByText(/Enter digits only/)).toBeInTheDocument();
  });

  it("converts a picked date and time, as UTC or in the browser's time zone", () => {
    renderTool(<UnixTimestampTool />);

    fill("Date and time", "2026-10-07T12:30");

    expect(screen.getByText("1791376200")).toBeInTheDocument();
    expect(screen.getByText("ISO 8601")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "My time zone" }));

    expect(screen.getByText("Time zone used")).toBeInTheDocument();
  });
});

describe("ExcelDateTool", () => {
  it("turns a picked date into its Excel serial number", () => {
    renderTool(<ExcelDateTool />);

    expect(screen.getByText("Pick a date to see its Excel number.")).toBeInTheDocument();

    fill("Date", "2026-10-07");

    expect(screen.getAllByText("46302")).toHaveLength(2);
  });

  it("adds the time as a fraction and follows the date system", () => {
    renderTool(<ExcelDateTool />);

    fill("Date", "2026-10-07");
    fill("Time", "12:00");

    expect(screen.getByText("46302.5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mac (1904)" }));

    expect(screen.getByText("44840.5")).toBeInTheDocument();
  });

  it("turns a serial number back into a date, and flags the 1900 leap-year quirk", () => {
    renderTool(<ExcelDateTool />);

    fireEvent.click(screen.getByRole("button", { name: "Excel number to date" }));
    fill("Excel serial number", "46302");

    expect(screen.getByText("Wednesday, 7 October 2026")).toBeInTheDocument();

    fill("Excel serial number", "60");

    expect(screen.getByText("29 February 1900")).toBeInTheDocument();
    expect(screen.getByText(/never existed/)).toBeInTheDocument();
  });

  it("clears everything with Reset", () => {
    renderTool(<ExcelDateTool />);

    fill("Date", "2026-10-07");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Pick a date to see its Excel number.")).toBeInTheDocument();
  });
});
