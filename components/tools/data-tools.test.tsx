import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { CsvJsonTool } from "@/components/tools/csv-json-tool";
import { JsonYamlTool } from "@/components/tools/json-yaml-tool";
import { NumberBaseTool } from "@/components/tools/number-base-tool";
import { UnitConverterTool } from "@/components/tools/unit-converter-tool";
import { XmlJsonTool } from "@/components/tools/xml-json-tool";

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
 * Types into a labelled field.
 */
function type(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * Chooses an option in a drop-down, the way a person would.
 */
function choose(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: option }));
}

/**
 * Waits for a read-only pane to hold the expected text. The result is computed a moment after
 * typing, so the page does not slow down.
 */
async function expectPane(label: string, expected: string | RegExp): Promise<void> {
  await waitFor(() => {
    // A text area always shows a line break as a single new line, even if the text has a carriage return too.
    const value = (screen.getByLabelText(label) as HTMLTextAreaElement).value;

    if (typeof expected === "string") {
      expect(value).toBe(expected);
    } else {
      expect(value).toMatch(expected);
    }
  });
}

describe("CsvJsonTool", () => {
  it("shows nothing until there is input, and explains how to start", () => {
    renderTool(<CsvJsonTool />);

    expect(screen.getByText(/Paste CSV or JSON above/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy result" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  });

  it("turns CSV into JSON as you type, with types and quoted fields", async () => {
    renderTool(<CsvJsonTool />);

    type("CSV", 'name,age,city\nAnn,30,"New York, NY"');

    await expectPane("JSON", JSON.stringify([{ name: "Ann", age: 30, city: "New York, NY" }], null, 2));
    expect(screen.getByText('1 row converted, separator ",".')).toBeInTheDocument();
  });

  it("changes the result when an option changes", async () => {
    renderTool(<CsvJsonTool />);

    type("CSV", "a;b\n1;2");
    await expectPane("JSON", /"a": 1/);

    choose("Separator", "Comma ( , )");
    await expectPane("JSON", /"a;b": "1;2"/);
  });

  it("loads an example and converts it", async () => {
    renderTool(<CsvJsonTool />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    await expectPane("JSON", /"name": "Ann"/);
  });

  it("converts JSON to CSV and flattens nested objects", async () => {
    renderTool(<CsvJsonTool />);

    fireEvent.click(screen.getByRole("button", { name: "JSON to CSV" }));
    type("JSON", '[{"name":"Ann","address":{"city":"Oslo"}}]');

    await expectPane("CSV", "name,address.city\nAnn,Oslo");
  });

  it("swaps the result back in as the input, to check a round trip", async () => {
    renderTool(<CsvJsonTool />);

    type("CSV", "a,b\n1,2");
    await expectPane("JSON", /"a": 1/);

    fireEvent.click(screen.getByRole("button", { name: "Swap" }));

    await expectPane("CSV", "a,b\n1,2");
    expect(screen.getByRole("button", { name: "JSON to CSV" })).toHaveAttribute("aria-pressed", "true");
  });

  it("explains a problem instead of showing a wrong result", async () => {
    renderTool(<CsvJsonTool />);

    fireEvent.click(screen.getByRole("button", { name: "JSON to CSV" }));
    type("JSON", "{oops");

    expect(await screen.findByText(/not valid JSON/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy result" })).toBeDisabled();
  });

  it("offers the result as a file", async () => {
    renderTool(<CsvJsonTool />);

    type("CSV", "a\n1");
    await waitFor(() => expect(screen.getByRole("button", { name: "Download" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(downloadBlob).toHaveBeenCalledTimes(1);
    expect(downloadBlob.mock.calls[0]?.[1]).toBe("converted.json");
    expect(await screen.findByText("Saved as converted.json.")).toBeInTheDocument();
  });

  it("clears the input", async () => {
    renderTool(<CsvJsonTool />);

    type("CSV", "a\n1");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await expectPane("JSON", "");
    expect(screen.getByLabelText("CSV")).toHaveValue("");
  });
});

describe("JsonYamlTool", () => {
  it("turns YAML into JSON", async () => {
    renderTool(<JsonYamlTool />);

    type("YAML", "name: Ann\ntags:\n  - a\n  - b");

    await expectPane("JSON", JSON.stringify({ name: "Ann", tags: ["a", "b"] }, null, 2));
  });

  it("says where the mistake is in YAML that cannot be read", async () => {
    renderTool(<JsonYamlTool />);

    type("YAML", "a: [1, 2\nb: 3");

    expect(await screen.findByText(/not valid YAML.*line \d+, column \d+/)).toBeInTheDocument();
  });

  it("turns JSON into YAML, and can sort the keys", async () => {
    renderTool(<JsonYamlTool />);

    fireEvent.click(screen.getByRole("button", { name: "JSON to YAML" }));
    type("JSON", '{"b":1,"a":2}');
    await expectPane("YAML", "b: 1\na: 2");

    fireEvent.click(screen.getByRole("switch", { name: "Sort keys" }));
    await expectPane("YAML", "a: 2\nb: 1");
  });

  it("offers only spaces for YAML indentation, and Compact for JSON", () => {
    renderTool(<JsonYamlTool />);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Indent" }));
    expect(within(screen.getByRole("listbox")).getByRole("option", { name: "Compact" })).toBeInTheDocument();
  });
});

describe("XmlJsonTool", () => {
  it("turns XML into JSON, keeping attributes", async () => {
    renderTool(<XmlJsonTool />);

    type("XML", '<a id="1"><b>x</b></a>');

    await expectPane("JSON", JSON.stringify({ a: { "@id": "1", b: "x" } }, null, 2));
  });

  it("can leave attributes out", async () => {
    renderTool(<XmlJsonTool />);

    type("XML", '<a id="1"><b>x</b></a>');
    await expectPane("JSON", /@id/);

    fireEvent.click(screen.getByRole("switch", { name: "Keep attributes" }));
    await expectPane("JSON", JSON.stringify({ a: { b: "x" } }, null, 2));
  });

  it("reports XML that is not well formed", async () => {
    renderTool(<XmlJsonTool />);

    type("XML", "<a><b></a>");

    expect(await screen.findByText(/not valid XML/)).toBeInTheDocument();
  });

  it("turns JSON into XML with the root element you choose", async () => {
    renderTool(<XmlJsonTool />);

    fireEvent.click(screen.getByRole("button", { name: "JSON to XML" }));
    type("JSON", '{"a":1,"b":2}');
    await expectPane("XML", "<root>\n  <a>1</a>\n  <b>2</b>\n</root>");

    type("Root element", "data");
    await expectPane("XML", "<data>\n  <a>1</a>\n  <b>2</b>\n</data>");
  });
});

describe("NumberBaseTool", () => {
  it("shows a number in every common base", () => {
    renderTool(<NumberBaseTool />);

    type("Number", "255");

    expect(screen.getByTestId("value-base-2")).toHaveTextContent("11111111");
    expect(screen.getByTestId("value-base-8")).toHaveTextContent("377");
    expect(screen.getByTestId("value-base-10")).toHaveTextContent("255");
    expect(screen.getByTestId("value-base-16")).toHaveTextContent("FF");
    expect(screen.getByTestId("value-base-36")).toHaveTextContent("73");
    expect(screen.getByText("This number needs 8 bits.")).toBeInTheDocument();
  });

  it("reads the number in the base you choose, and names a digit that does not belong", () => {
    renderTool(<NumberBaseTool />);

    choose("From base", "Hexadecimal (16)");
    type("Number", "ff");
    expect(screen.getByTestId("value-base-10")).toHaveTextContent("255");

    choose("From base", "Binary (2)");
    expect(screen.getByText('"f" is not a digit in base 2.')).toBeInTheDocument();
  });

  it("is exact for a very large number and can group the digits", () => {
    renderTool(<NumberBaseTool />);

    type("Number", "1267650600228229401496703205376");
    expect(screen.getByTestId("value-base-16")).toHaveTextContent("10000000000000000000000000");

    fireEvent.click(screen.getByRole("switch", { name: "Group digits" }));
    expect(screen.getByTestId("value-base-10")).toHaveTextContent("1,267,650,600,228,229,401,496,703,205,376");
  });

  it("writes text as bytes, and reads bytes back into text", async () => {
    renderTool(<NumberBaseTool />);

    fireEvent.click(screen.getByRole("button", { name: "Text and bytes" }));
    type("Text", "Hi €");
    await expectPane("Bytes", "48 69 20 e2 82 ac");
    expect(screen.getByText("6 bytes.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Swap" }));
    await expectPane("Text", "Hi €");
  });

  it("converts a number to a Roman numeral and back", () => {
    renderTool(<NumberBaseTool />);

    fireEvent.click(screen.getByRole("button", { name: "Roman numerals" }));
    type("Number or Roman numeral", "1994");
    expect(screen.getByTestId("value-roman-result")).toHaveTextContent("MCMXCIV");

    type("Number or Roman numeral", "mmxxiv");
    expect(screen.getByTestId("value-roman-result")).toHaveTextContent("2024");

    type("Number or Roman numeral", "IIII");
    expect(screen.getByText(/not a standard Roman numeral/)).toBeInTheDocument();
  });
});

describe("UnitConverterTool", () => {
  it("converts and shows the value in every other unit", () => {
    renderTool(<UnitConverterTool />);

    const answer = screen.getByRole("status", { name: "Conversion result" });

    expect(answer).toHaveTextContent("1 km equals");
    expect(answer).toHaveTextContent("0.6213711922 mi");
    expect(screen.getByRole("region", { name: /in every length unit/i })).toHaveTextContent("1,000 m");
  });

  it("changes the answer as the value changes", () => {
    renderTool(<UnitConverterTool />);

    type("Value", "5");

    expect(screen.getByRole("status", { name: "Conversion result" })).toHaveTextContent("3.106855961 mi");
  });

  it("opens another category on its own units, with the right formulas", () => {
    renderTool(<UnitConverterTool />);

    choose("Category", "Temperature");
    type("Value", "100");

    expect(screen.getByRole("status", { name: "Conversion result" })).toHaveTextContent("212 °F");
  });

  it("swaps the units", () => {
    renderTool(<UnitConverterTool />);

    fireEvent.click(screen.getByRole("button", { name: "Swap units" }));

    expect(screen.getByRole("status", { name: "Conversion result" })).toHaveTextContent("1 mi equals");
    expect(screen.getByRole("status", { name: "Conversion result" })).toHaveTextContent("1.609344 km");
  });

  it("refuses a temperature below absolute zero", () => {
    renderTool(<UnitConverterTool />);

    choose("Category", "Temperature");
    type("Value", "-300");

    expect(screen.getByText(/absolute zero/)).toBeInTheDocument();
  });

  it("explains the data units, and goes back to the start on reset", () => {
    renderTool(<UnitConverterTool />);

    choose("Category", "Data storage");
    expect(screen.getByText(/KiB, MiB, and GiB count in 1,024s/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("Length");
    expect(screen.getByRole("status", { name: "Conversion result" })).toHaveTextContent("1 km equals");
  });

  it("shows nothing wrong when the value is cleared", () => {
    renderTool(<UnitConverterTool />);

    type("Value", "");

    expect(screen.queryByRole("status", { name: "Conversion result" })).not.toBeInTheDocument();
  });
});
