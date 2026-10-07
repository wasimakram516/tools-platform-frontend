import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren, ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { DateField, DateTimeField, TimeField } from "@/components/tools/form-fields";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

/**
 * Renders a field inside the production theme and date localization.
 */
function renderField(field: ReactElement): void {
  render(<AppThemeProvider>{field}</AppThemeProvider>);
}

/**
 * Reads what a section of the picker field currently shows, such as the day or the month.
 */
function section(name: string): string {
  return screen.getByRole("spinbutton", { name }).textContent ?? "";
}

describe("date and time pickers", () => {
  it("shows a date with a named month so day and month cannot be confused", () => {
    renderField(<DateField id="d" label="Date" onChange={vi.fn()} value="2026-10-07" />);

    expect([section("Day"), section("Month"), section("Year")]).toEqual(["07", "Oct", "2026"]);
  });

  it("shows a time with AM and PM", () => {
    renderField(<TimeField id="t" label="Time" onChange={vi.fn()} value="15:30" />);

    expect([section("Hours"), section("Minutes"), section("Meridiem")]).toEqual(["03", "30", "PM"]);
  });

  it("shows a date and time together", () => {
    renderField(<DateTimeField id="dt" label="Date and time" onChange={vi.fn()} value="2026-10-07T15:30" />);

    expect([section("Day"), section("Month"), section("Hours"), section("Meridiem")]).toEqual([
      "07",
      "Oct",
      "03",
      "PM",
    ]);
  });

  it("shows nothing for an empty or invalid value", () => {
    renderField(<DateField id="d" label="Date" onChange={vi.fn()} value="not-a-date" />);

    expect(section("Day")).toBe("DD");
  });

  it("reports a typed date as YYYY-MM-DD", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderField(<DateField id="d" label="Date" onChange={onChange} value="2026-10-07" />);
    await user.click(screen.getByRole("spinbutton", { name: "Day" }));
    await user.keyboard("20");

    expect(onChange).toHaveBeenLastCalledWith("2026-10-20");
  });
});
