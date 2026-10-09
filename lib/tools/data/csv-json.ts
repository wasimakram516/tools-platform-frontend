import {
  detectDelimiter,
  MAX_DATA_INPUT_CHARACTERS,
  parseCsv,
  stringifyCsv,
  type Delimiter,
} from "@/lib/tools/data/csv";
import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

export interface DataConversionSuccess {
  ok: true;
  output: string;
  /** A short note about what happened, such as how many rows were converted. */
  summary: string;
}

export type DataConversionResult = DataConversionSuccess | CalculationFailure;

/** A plain decimal number that JSON can hold exactly: no leading zeros, and not too long. */
const JSON_NUMBER_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
const MAX_EXACT_DIGITS = 15;

export interface CsvToJsonOptions {
  /** A separator, or "auto" to work it out from the data. */
  delimiter: Delimiter | "auto";
  /** The first row holds the column names. Otherwise each row becomes a list. */
  hasHeader: boolean;
  /** Spaces for each level of indentation. */
  indent: number;
  /** Turn numbers, true, false, and null into JSON values, not text. */
  inferTypes: boolean;
  /** Remove spaces around each field. */
  trim: boolean;
}

/**
 * Reads a text value as the JSON value it looks like: a number, true, false, or null. Anything
 * else stays text. Values that would lose digits as numbers, and values with leading zeros such
 * as ZIP codes and phone numbers, stay text so nothing is changed by accident.
 */
export function inferValue(text: string): string | number | boolean | null {
  if (text === "true") {
    return true;
  }

  if (text === "false") {
    return false;
  }

  if (text === "null") {
    return null;
  }

  if (JSON_NUMBER_PATTERN.test(text) && text.replace(/[-.]/g, "").length <= MAX_EXACT_DIGITS) {
    return Number(text);
  }

  return text;
}

/**
 * Makes column names unique and non-empty, so that no column overwrites another.
 */
export function uniqueHeaders(headers: readonly string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((header, position) => {
    const name = header === "" ? `column_${position + 1}` : header;
    const count = (seen.get(name) ?? 0) + 1;

    seen.set(name, count);

    return count === 1 ? name : `${name}_${count}`;
  });
}

/**
 * Converts CSV or TSV text to JSON. With a header row the result is a list of objects keyed by
 * column name; without one it is a list of lists. A row with fewer fields than the header gets
 * empty values for the rest, and a row with more fields gets extra columns named column_N.
 */
export function csvToJson(text: string, options: CsvToJsonOptions): DataConversionResult {
  if (text.trim() === "") {
    return failure("Paste some CSV to convert.");
  }

  if (text.length > MAX_DATA_INPUT_CHARACTERS) {
    return failure(`The input is limited to ${MAX_DATA_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  const delimiter = options.delimiter === "auto" ? detectDelimiter(text) : options.delimiter;
  const parsed = parseCsv(text, delimiter);

  if (!parsed.ok) {
    return parsed;
  }

  const prepare = (field: string): string | number | boolean | null => {
    const value = options.trim ? field.trim() : field;

    return options.inferTypes ? inferValue(value) : value;
  };
  const table = parsed.rows.filter((row) => !(row.length === 1 && row[0] === ""));

  if (table.length === 0) {
    return failure("There are no rows to convert.");
  }

  let data: unknown;

  if (options.hasHeader) {
    const [headerRow, ...bodyRows] = table as [string[], ...string[][]];
    const headers = uniqueHeaders(headerRow.map((name) => (options.trim ? name.trim() : name)));

    data = bodyRows.map((row) => {
      const record: Record<string, string | number | boolean | null> = {};
      const width = Math.max(headers.length, row.length);

      for (let position = 0; position < width; position += 1) {
        const key = headers[position] ?? `column_${position + 1}`;

        record[key] = position < row.length ? prepare(row[position] as string) : "";
      }

      return record;
    });
  } else {
    data = table.map((row) => row.map(prepare));
  }

  const count = (data as unknown[]).length;
  const delimiterName = delimiter === "\t" ? "tab" : `"${delimiter}"`;

  return {
    ok: true,
    output: JSON.stringify(data, null, options.indent),
    summary: `${count} ${count === 1 ? "row" : "rows"} converted, separator ${delimiterName}.`,
  };
}

export interface JsonToCsvOptions {
  delimiter: Delimiter;
  /** Turn nested objects into columns named with dots, such as address.city. */
  flatten: boolean;
  /** Write the column names as the first row. */
  includeHeader: boolean;
  /** Put a quote mark before text that a spreadsheet could run as a formula. */
  protectFormulas: boolean;
  quoteAll: boolean;
}

type Flat = Map<string, string>;

/** Characters that make a spreadsheet treat a cell as a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * Writes one JSON value as the text of a CSV cell. Objects and lists that are not flattened are
 * written as JSON text.
 */
function cellText(value: unknown, protectFormulas: boolean): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return protectFormulas && FORMULA_START.test(value) ? `'${value}` : value;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Turns one JSON object into columns. With flattening on, nested objects become dotted names.
 */
function flattenRecord(record: Record<string, unknown>, flatten: boolean, protectFormulas: boolean, prefix = ""): Flat {
  const flat: Flat = new Map();

  for (const [key, value] of Object.entries(record)) {
    const name = prefix ? `${prefix}.${key}` : key;

    if (flatten && value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [innerName, innerValue] of flattenRecord(value as Record<string, unknown>, true, protectFormulas, name)) {
        flat.set(innerName, innerValue);
      }
    } else {
      flat.set(name, cellText(value, protectFormulas));
    }
  }

  return flat;
}

/**
 * Converts JSON to CSV or TSV. It accepts a list of objects (the usual case), a list of lists,
 * a list of plain values, or one object. The columns are the keys, in the order they first
 * appear, and a row that lacks a key gets an empty cell.
 */
export function jsonToCsv(text: string, options: JsonToCsvOptions): DataConversionResult {
  if (text.trim() === "") {
    return failure("Paste some JSON to convert.");
  }

  if (text.length > MAX_DATA_INPUT_CHARACTERS) {
    return failure(`The input is limited to ${MAX_DATA_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch (error) {
    return failure(`This is not valid JSON: ${error instanceof Error ? error.message : "it could not be read"}.`);
  }

  const items: unknown[] = Array.isArray(data) ? data : [data];

  if (items.length === 0) {
    return failure("The list is empty, so there is nothing to convert.");
  }

  const stringify = { delimiter: options.delimiter, quoteAll: options.quoteAll };
  let rows: string[][];

  if (items.every((item) => Array.isArray(item))) {
    rows = (items as unknown[][]).map((row) => row.map((value) => cellText(value, options.protectFormulas)));
  } else if (items.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
    const records = (items as Record<string, unknown>[]).map((record) =>
      flattenRecord(record, options.flatten, options.protectFormulas),
    );
    const columns: string[] = [];

    for (const record of records) {
      for (const name of record.keys()) {
        if (!columns.includes(name)) {
          columns.push(name);
        }
      }
    }

    rows = records.map((record) => columns.map((name) => record.get(name) ?? ""));

    if (options.includeHeader) {
      rows.unshift(columns);
    }
  } else if (items.every((item) => item === null || typeof item !== "object")) {
    rows = items.map((value) => [cellText(value, options.protectFormulas)]);

    if (options.includeHeader) {
      rows.unshift(["value"]);
    }
  } else {
    return failure("The JSON mixes objects, lists, and plain values. Use a list where every item is the same kind.");
  }

  const dataRows = rows.length - (options.includeHeader && !items.every((item) => Array.isArray(item)) ? 1 : 0);

  return {
    ok: true,
    output: stringifyCsv(rows, stringify),
    summary: `${dataRows} ${dataRows === 1 ? "row" : "rows"} converted.`,
  };
}
