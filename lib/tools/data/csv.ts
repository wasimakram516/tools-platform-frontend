import { failure, type CalculationFailure } from "@/lib/tools/dates/result";

/** The separators the tools offer. A tab makes the file a TSV. */
export const DELIMITERS = [
  { label: "Comma ( , )", value: "," },
  { label: "Semicolon ( ; )", value: ";" },
  { label: "Tab", value: "\t" },
  { label: "Pipe ( | )", value: "|" },
] as const;

export type Delimiter = (typeof DELIMITERS)[number]["value"];

/** The most characters a data tool accepts, which keeps the page responsive. */
export const MAX_DATA_INPUT_CHARACTERS = 2_000_000;

/** How many lines are read to guess the separator. */
const DETECTION_LINES = 10;
const BYTE_ORDER_MARK = "﻿";

export interface ParsedCsv {
  ok: true;
  rows: string[][];
}

export type CsvParseResult = ParsedCsv | CalculationFailure;

/**
 * Reads CSV text into rows of fields, following RFC 4180: fields may be wrapped in double
 * quotes, a doubled quote inside them is one quote, and quoted fields may hold separators and
 * line breaks. Both Windows and Unix line endings work, a byte order mark is ignored, and a
 * final line break does not add an empty row.
 */
export function parseCsv(text: string, delimiter: Delimiter): CsvParseResult {
  const source = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let fieldWasQuoted = false;
  let index = 0;

  /**
   * Ends the current field and adds it to the row.
   */
  function endField(): void {
    row.push(field);
    field = "";
    fieldWasQuoted = false;
  }

  /**
   * Ends the current row and adds it to the table.
   */
  function endRow(): void {
    endField();
    rows.push(row);
    row = [];
  }

  while (index < source.length) {
    const char = source[index] as string;

    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }

        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "" && !fieldWasQuoted) {
      inQuotes = true;
      fieldWasQuoted = true;
    } else if (char === delimiter) {
      endField();
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && source[index + 1] === "\n") {
        index += 1;
      }

      endRow();
    } else {
      field += char;
    }

    index += 1;
  }

  if (inQuotes) {
    return failure("A quoted field is never closed. Check for a missing closing quote.");
  }

  // The last line has no line break after it. A trailing break must not add an empty row.
  if (field !== "" || fieldWasQuoted || row.length > 0) {
    endRow();
  }

  return { ok: true, rows };
}

/**
 * Guesses the separator from the first lines: the one that splits every line into the same
 * number of fields, and into the most fields. Falls back to a comma.
 */
export function detectDelimiter(text: string): Delimiter {
  const lines = text
    .replace(BYTE_ORDER_MARK, "")
    .split(/\r\n|\r|\n/)
    .filter((line) => line.trim() !== "")
    .slice(0, DETECTION_LINES);
  let best: { delimiter: Delimiter; fields: number } = { delimiter: ",", fields: 1 };

  for (const { value } of DELIMITERS) {
    const result = parseCsv(lines.join("\n"), value);

    if (!result.ok || result.rows.length === 0) {
      continue;
    }

    const counts = result.rows.map((row) => row.length);
    const consistent = counts.every((count) => count === counts[0]);
    const fields = counts[0] ?? 1;

    if (consistent && fields > best.fields) {
      best = { delimiter: value, fields };
    }
  }

  return best.delimiter;
}

export interface StringifyOptions {
  delimiter: Delimiter;
  /** Wrap every field in quotes, not only the ones that need it. */
  quoteAll: boolean;
}

/**
 * Wraps a field in quotes when it holds the separator, a quote, or a line break, and doubles
 * any quotes inside it, so that it reads back exactly as written.
 */
function quoteField(field: string, { delimiter, quoteAll }: StringifyOptions): string {
  const needsQuotes = quoteAll || field.includes(delimiter) || /["\r\n]/.test(field);

  return needsQuotes ? `"${field.replaceAll('"', '""')}"` : field;
}

/**
 * Writes rows of fields as CSV text, with Windows line endings, which spreadsheets expect.
 */
export function stringifyCsv(rows: readonly (readonly string[])[], options: StringifyOptions): string {
  return rows.map((row) => row.map((field) => quoteField(field, options)).join(options.delimiter)).join("\r\n");
}
