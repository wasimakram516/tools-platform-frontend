// @vitest-environment node
import { describe, expect, it } from "vitest";
import { detectDelimiter, parseCsv, stringifyCsv } from "@/lib/tools/data/csv";

/**
 * Reads CSV and returns just the rows, failing the test if it could not be read.
 */
function rowsOf(text: string, delimiter: "," | ";" | "\t" | "|" = ","): string[][] {
  const result = parseCsv(text, delimiter);

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.rows;
}

// Every expected value below was produced by Python's csv module, which is an independent reader.
describe("parseCsv", () => {
  it("reads plain rows", () => {
    expect(rowsOf("name,age\nAnn,30\nBob,25")).toEqual([["name", "age"], ["Ann", "30"], ["Bob", "25"]]);
  });

  it("reads quoted fields with separators, doubled quotes, and line breaks inside", () => {
    expect(rowsOf('a,b\n"x, y","say ""hi"""\n"line1\nline2",3')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
      ["line1\nline2", "3"],
    ]);
  });

  it("reads Windows line endings and does not add a row for a final line break", () => {
    expect(rowsOf("a,b\r\n1,2\r\n3,4\r\n")).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
  });

  it("reads other separators", () => {
    expect(rowsOf("a;b;c\n1;2;3", ";")).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
    expect(rowsOf("a\tb\n1\t2", "\t")).toEqual([["a", "b"], ["1", "2"]]);
    expect(rowsOf('x|y\n"p|q"|r', "|")).toEqual([["x", "y"], ["p|q", "r"]]);
  });

  it("keeps empty fields, including at the end of a row", () => {
    expect(rowsOf("a,b,c\n1,,3\n,,\n")).toEqual([["a", "b", "c"], ["1", "", "3"], ["", "", ""]]);
    expect(rowsOf("a,b,\n1,2,")).toEqual([["a", "b", ""], ["1", "2", ""]]);
  });

  it("reads one column", () => {
    expect(rowsOf("only\none\ntwo")).toEqual([["only"], ["one"], ["two"]]);
  });

  it("ignores a byte order mark at the start", () => {
    expect(rowsOf("﻿a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("reads an empty quoted field", () => {
    expect(rowsOf('a,"",c')).toEqual([["a", "", "c"]]);
  });

  it("reports a quoted field that is never closed", () => {
    const result = parseCsv('a,"b\n1,2', ",");

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.message).toContain("never closed");
  });
});

describe("detectDelimiter", () => {
  it("picks the separator that splits every line the same way", () => {
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
    expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("\t");
    expect(detectDelimiter("a|b\n1|2")).toBe("|");
  });

  it("is not fooled by commas inside quoted fields", () => {
    expect(detectDelimiter('name;note\nAnn;"hello, world"\nBob;"a, b, c"')).toBe(";");
  });

  it("falls back to a comma when nothing fits", () => {
    expect(detectDelimiter("just one column\nanother")).toBe(",");
  });
});

describe("stringifyCsv", () => {
  it("quotes only the fields that need it", () => {
    expect(stringifyCsv([["a", "b,c", 'say "hi"', "line1\nline2"]], { delimiter: ",", quoteAll: false })).toBe(
      'a,"b,c","say ""hi""","line1\nline2"',
    );
  });

  it("can quote every field", () => {
    expect(stringifyCsv([["a", "b"]], { delimiter: ",", quoteAll: true })).toBe('"a","b"');
  });

  it("joins rows with Windows line endings and uses the chosen separator", () => {
    expect(stringifyCsv([["a", "b"], ["1", "2"]], { delimiter: ";", quoteAll: false })).toBe("a;b\r\n1;2");
  });

  it("quotes a field that holds the chosen separator", () => {
    expect(stringifyCsv([["a;b", "c"]], { delimiter: ";", quoteAll: false })).toBe('"a;b";c');
    expect(stringifyCsv([["a;b", "c"]], { delimiter: ",", quoteAll: false })).toBe("a;b,c");
  });

  it("writes text that Python's csv module reads back to the same fields", () => {
    const rows = [["name", "note"], ["Ann", 'He said "yes", then left'], ["Bob", "two\nlines"]];
    const text = stringifyCsv(rows, { delimiter: ",", quoteAll: false });

    expect(rowsOf(text)).toEqual(rows);
  });
});
