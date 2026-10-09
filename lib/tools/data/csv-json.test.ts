// @vitest-environment node
import { describe, expect, it } from "vitest";
import { csvToJson, inferValue, jsonToCsv, uniqueHeaders, type CsvToJsonOptions, type JsonToCsvOptions } from "@/lib/tools/data/csv-json";

const TO_JSON: CsvToJsonOptions = { delimiter: ",", hasHeader: true, indent: 2, inferTypes: true, trim: true };
const TO_CSV: JsonToCsvOptions = { delimiter: ",", flatten: true, includeHeader: true, protectFormulas: false, quoteAll: false };

/**
 * Converts CSV to JSON and returns the parsed result, failing the test if it did not work.
 */
function jsonOf(text: string, options: Partial<CsvToJsonOptions> = {}): unknown {
  const result = csvToJson(text, { ...TO_JSON, ...options });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return JSON.parse(result.output);
}

/**
 * Converts JSON to CSV and returns the text, failing the test if it did not work.
 */
function csvOf(text: string, options: Partial<JsonToCsvOptions> = {}): string {
  const result = jsonToCsv(text, { ...TO_CSV, ...options });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.output;
}

describe("inferValue", () => {
  it("turns numbers, booleans, and null into JSON values", () => {
    expect(inferValue("30")).toBe(30);
    expect(inferValue("-4.5")).toBe(-4.5);
    expect(inferValue("1e3")).toBe(1000);
    expect(inferValue("true")).toBe(true);
    expect(inferValue("false")).toBe(false);
    expect(inferValue("null")).toBeNull();
  });

  it("leaves values that merely look like numbers as text, so nothing is changed by accident", () => {
    expect(inferValue("02134")).toBe("02134");
    expect(inferValue("+1555123")).toBe("+1555123");
    expect(inferValue("12345678901234567")).toBe("12345678901234567");
    expect(inferValue("1,5")).toBe("1,5");
    expect(inferValue("")).toBe("");
    expect(inferValue("True")).toBe("True");
  });
});

describe("uniqueHeaders", () => {
  it("names empty columns and separates repeated names", () => {
    expect(uniqueHeaders(["id", "", "name", "name", "name"])).toEqual(["id", "column_2", "name", "name_2", "name_3"]);
  });
});

describe("csvToJson", () => {
  it("makes a list of objects from a header row, with types", () => {
    expect(jsonOf("name,age,active\nAnn,30,true\nBob,25,false")).toEqual([
      { active: true, age: 30, name: "Ann" },
      { active: false, age: 25, name: "Bob" },
    ]);
  });

  it("leaves everything as text when type conversion is off", () => {
    expect(jsonOf("a,b\n1,true", { inferTypes: false })).toEqual([{ a: "1", b: "true" }]);
  });

  it("makes a list of lists when there is no header row", () => {
    expect(jsonOf("1,2\n3,4", { hasHeader: false })).toEqual([[1, 2], [3, 4]]);
  });

  it("fills a short row with empty values and names the extra columns of a long row", () => {
    expect(jsonOf("a,b,c\n1\n1,2,3,4")).toEqual([
      { a: 1, b: "", c: "" },
      { a: 1, b: 2, c: 3, column_4: 4 },
    ]);
  });

  it("reads quoted fields and keeps leading zeros", () => {
    expect(jsonOf('zip,note\n02134,"x, y"')).toEqual([{ note: "x, y", zip: "02134" }]);
  });

  it("works out the separator by itself", () => {
    expect(jsonOf("a;b\n1;2", { delimiter: "auto" })).toEqual([{ a: 1, b: 2 }]);
  });

  it("trims spaces around fields only when asked", () => {
    expect(jsonOf("a , b\n x , y ", { inferTypes: false })).toEqual([{ a: "x", b: "y" }]);
    expect(jsonOf("a , b\n x , y ", { inferTypes: false, trim: false })).toEqual([{ "a ": " x ", " b": " y " }]);
  });

  it("indents the output as asked and reports what it did", () => {
    const result = csvToJson("a\n1", { ...TO_JSON, indent: 4 });

    expect(result.ok && result.output).toBe('[\n    {\n        "a": 1\n    }\n]');
    expect(result.ok && result.summary).toBe('1 row converted, separator ",".');
  });

  it("skips blank lines", () => {
    expect(jsonOf("a\n1\n\n2\n")).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it("explains problems instead of failing silently", () => {
    expect(csvToJson("", TO_JSON)).toMatchObject({ message: "Paste some CSV to convert.", ok: false });
    expect(csvToJson('a\n"unclosed', TO_JSON)).toMatchObject({ ok: false });
    expect(csvToJson("x".repeat(2_000_001), TO_JSON)).toMatchObject({ ok: false });
  });
});

describe("jsonToCsv", () => {
  it("makes columns from the keys, in the order they first appear", () => {
    expect(csvOf('[{"name":"Ann","age":30},{"age":25,"name":"Bob","city":"Oslo"}]')).toBe(
      "name,age,city\r\nAnn,30,\r\nBob,25,Oslo",
    );
  });

  it("flattens nested objects into dotted columns, and writes lists as JSON text", () => {
    expect(csvOf('[{"id":1,"address":{"city":"Oslo","zip":"0150"},"tags":["a","b"]}]')).toBe(
      'id,address.city,address.zip,tags\r\n1,Oslo,0150,"[""a"",""b""]"',
    );
  });

  it("keeps nested objects as JSON text when flattening is off", () => {
    expect(csvOf('[{"a":{"b":1}}]', { flatten: false })).toBe('a\r\n"{""b"":1}"');
  });

  it("writes null as an empty cell and booleans and numbers as they are", () => {
    expect(csvOf('[{"a":null,"b":true,"c":1.5}]')).toBe("a,b,c\r\n,true,1.5");
  });

  it("reads one object as one row", () => {
    expect(csvOf('{"a":1,"b":2}')).toBe("a,b\r\n1,2");
  });

  it("reads a list of lists with no header, and a list of plain values as one column", () => {
    expect(csvOf("[[1,2],[3,4]]")).toBe("1,2\r\n3,4");
    expect(csvOf("[1,2,3]")).toBe("value\r\n1\r\n2\r\n3");
  });

  it("can leave out the header, use another separator, and quote everything", () => {
    expect(csvOf('[{"a":1,"b":"x"}]', { delimiter: ";", includeHeader: false, quoteAll: true })).toBe('"1";"x"');
  });

  it("quotes text that holds the separator, quotes, or line breaks", () => {
    expect(csvOf('[{"a":"x,y","b":"say \\"hi\\"","c":"l1\\nl2"}]')).toBe('a,b,c\r\n"x,y","say ""hi""","l1\nl2"');
  });

  it("protects against spreadsheet formulas only when asked, and only for text", () => {
    const json = '[{"a":"=SUM(A1:A2)","b":"@cmd","c":-5,"d":"fine"}]';

    expect(csvOf(json)).toBe("a,b,c,d\r\n=SUM(A1:A2),@cmd,-5,fine");
    expect(csvOf(json, { protectFormulas: true })).toBe("a,b,c,d\r\n'=SUM(A1:A2),'@cmd,-5,fine");
  });

  it("explains problems", () => {
    expect(jsonToCsv("", TO_CSV)).toMatchObject({ ok: false });
    expect(jsonToCsv("{oops", TO_CSV)).toMatchObject({ message: expect.stringContaining("not valid JSON"), ok: false });
    expect(jsonToCsv("[]", TO_CSV)).toMatchObject({ message: expect.stringContaining("empty"), ok: false });
    expect(jsonToCsv('[{"a":1},[2],3]', TO_CSV)).toMatchObject({ message: expect.stringContaining("mixes"), ok: false });
  });

  it("round-trips: CSV to JSON and back gives the original table", () => {
    const original = 'name,note\r\nAnn,"He said ""yes"", then left"\r\nBob,plain';
    const json = csvToJson(original, { ...TO_JSON, inferTypes: false });

    expect(json.ok && csvOf(json.output)).toBe(original);
  });
});
