"use client";

import DataObjectIcon from "@mui/icons-material/DataObject";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import type { ReactNode } from "react";
import { useState } from "react";
import { ConverterTool } from "@/components/tools/converter-tool";
import { INDENT_OPTIONS, ToolbarSelect } from "@/components/tools/converter-options";
import { OptionSwitch } from "@/components/tools/option-switch";
import type { ConverterDirection } from "@/components/tools/use-converter";
import { DELIMITERS, type Delimiter } from "@/lib/tools/data/csv";
import { csvToJson, jsonToCsv } from "@/lib/tools/data/csv-json";

type Mode = "csvToJson" | "jsonToCsv";

const CSV_EXAMPLE = 'name,age,active,city\nAnn,30,true,Oslo\nBob,25,false,"New York, NY"\nCara,41,true,';
const JSON_EXAMPLE =
  '[{"name":"Ann","age":30,"address":{"city":"Oslo"}},{"name":"Bob","age":25,"address":{"city":"New York, NY"}}]';

const DIRECTIONS: readonly [ConverterDirection<Mode>, ConverterDirection<Mode>] = [
  {
    example: CSV_EXAMPLE,
    fileName: "converted.json",
    icon: <TableChartOutlinedIcon fontSize="small" />,
    inputLabel: "CSV",
    inputPlaceholder: "Paste CSV or TSV, with the column names in the first row.",
    label: "CSV to JSON",
    mime: "application/json",
    outputLabel: "JSON",
    outputPlaceholder: "The JSON appears here.",
    tooltip: "Turn CSV or TSV rows into a JSON list",
    value: "csvToJson",
  },
  {
    example: JSON_EXAMPLE,
    fileName: "converted.csv",
    icon: <DataObjectIcon fontSize="small" />,
    inputLabel: "JSON",
    inputPlaceholder: "Paste a JSON list of objects, or a list of lists.",
    label: "JSON to CSV",
    mime: "text/csv",
    outputLabel: "CSV",
    outputPlaceholder: "The CSV appears here.",
    tooltip: "Turn a JSON list into CSV rows",
    value: "jsonToCsv",
  },
];

const INPUT_DELIMITER_OPTIONS = [{ label: "Detect it", value: "auto" as const }, ...DELIMITERS];

/**
 * Converts CSV and TSV to JSON and back, live as you type. It handles quoted fields, picks the
 * separator for you, can turn numbers and true or false into JSON values, and can flatten nested
 * objects into columns.
 */
export function CsvJsonTool(): ReactNode {
  const [inputDelimiter, setInputDelimiter] = useState<Delimiter | "auto">("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [trim, setTrim] = useState(true);
  const [indent, setIndent] = useState(2);
  const [outputDelimiter, setOutputDelimiter] = useState<Delimiter>(",");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [flatten, setFlatten] = useState(true);
  const [quoteAll, setQuoteAll] = useState(false);
  const [protectFormulas, setProtectFormulas] = useState(false);

  return (
    <ConverterTool
      convert={(input, mode) =>
        mode === "csvToJson"
          ? csvToJson(input, { delimiter: inputDelimiter, hasHeader, indent, inferTypes, trim })
          : jsonToCsv(input, { delimiter: outputDelimiter, flatten, includeHeader, protectFormulas, quoteAll })
      }
      directions={DIRECTIONS}
      idleMessage="Paste CSV or JSON above and the result appears here, converted in your browser."
      idPrefix="csv-json"
      options={(mode) =>
        mode === "csvToJson" ? (
          <>
            <ToolbarSelect id="csv-delimiter" label="Separator" onChange={setInputDelimiter} options={INPUT_DELIMITER_OPTIONS} value={inputDelimiter} />
            <OptionSwitch checked={hasHeader} label="First row is the header" onChange={setHasHeader} tooltip="Use the first row as the names of the columns. Turn off to get a list of lists." />
            <OptionSwitch checked={inferTypes} label="Convert types" onChange={setInferTypes} tooltip="Turn 30 into a number and true into a boolean. Values such as 007 stay text." />
            <OptionSwitch checked={trim} label="Trim spaces" onChange={setTrim} tooltip="Remove spaces from the start and end of every field" />
            <ToolbarSelect id="csv-indent" label="Indent" minWidth={120} onChange={setIndent} options={INDENT_OPTIONS} value={indent} />
          </>
        ) : (
          <>
            <ToolbarSelect id="csv-out-delimiter" label="Separator" onChange={setOutputDelimiter} options={DELIMITERS} value={outputDelimiter} />
            <OptionSwitch checked={includeHeader} label="Header row" onChange={setIncludeHeader} tooltip="Write the column names as the first row" />
            <OptionSwitch checked={flatten} label="Flatten nested objects" onChange={setFlatten} tooltip="Turn {address:{city}} into a column named address.city" />
            <OptionSwitch checked={quoteAll} label="Quote every field" onChange={setQuoteAll} tooltip="Wrap every field in quotes, not only the ones that need it" />
            <OptionSwitch checked={protectFormulas} label="Protect from formulas" onChange={setProtectFormulas} tooltip="Put a quote mark before text that starts with = + - or @, so a spreadsheet does not run it as a formula" />
          </>
        )
      }
      toggleLabel="Conversion direction"
      workspaceLabel="CSV and JSON converter workspace"
    />
  );
}
