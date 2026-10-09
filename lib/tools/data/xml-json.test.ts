import { describe, expect, it } from "vitest";
import { jsonToXml, xmlToJson, type JsonToXmlOptions, type XmlToJsonOptions } from "@/lib/tools/data/xml-json";

const TO_JSON: XmlToJsonOptions = { includeAttributes: true, indent: 2, inferTypes: false };
const TO_XML: JsonToXmlOptions = { declaration: false, indent: 2, rootName: "root" };

/**
 * Converts XML to JSON and returns the parsed value, failing the test if it did not work.
 */
function jsonOf(text: string, options: Partial<XmlToJsonOptions> = {}): unknown {
  const result = xmlToJson(text, { ...TO_JSON, ...options });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return JSON.parse(result.output);
}

/**
 * Converts JSON to XML and returns the text, failing the test if it did not work.
 */
function xmlOf(text: string, options: Partial<JsonToXmlOptions> = {}): string {
  const result = jsonToXml(text, { ...TO_XML, ...options });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.output;
}

describe("xmlToJson", () => {
  it("reads elements, text, and attributes", () => {
    expect(jsonOf('<a><b>1</b><c x="y">t</c></a>')).toEqual({ a: { b: "1", c: { "#text": "t", "@x": "y" } } });
  });

  it("turns children with the same name into a list", () => {
    expect(jsonOf("<list><i>1</i><i>2</i><i>3</i></list>")).toEqual({ list: { i: ["1", "2", "3"] } });
  });

  it("turns an empty element into null", () => {
    expect(jsonOf("<a><b/><c></c></a>")).toEqual({ a: { b: null, c: null } });
  });

  it("reads entities and CDATA sections as the text they stand for", () => {
    expect(jsonOf("<a>x &amp; y &lt; <![CDATA[<raw>]]></a>")).toEqual({ a: "x & y < <raw>" });
  });

  it("ignores the declaration, comments, and processing instructions", () => {
    expect(jsonOf('<?xml version="1.0"?><!-- note --><r a="1"/>')).toEqual({ r: { "@a": "1" } });
  });

  it("can leave attributes out", () => {
    expect(jsonOf('<a x="1"><b y="2">t</b></a>', { includeAttributes: false })).toEqual({ a: { b: "t" } });
  });

  it("turns numbers and booleans into JSON values only when asked", () => {
    expect(jsonOf('<a n="5"><b>2.5</b><c>true</c><d>007</d></a>')).toEqual({ a: { "@n": "5", b: "2.5", c: "true", d: "007" } });
    expect(jsonOf('<a n="5"><b>2.5</b><c>true</c><d>007</d></a>', { inferTypes: true })).toEqual({
      a: { "@n": 5, b: 2.5, c: true, d: "007" },
    });
  });

  it("keeps the text that sits beside child elements under #text", () => {
    expect(jsonOf("<p>Hello <b>world</b>!</p>")).toEqual({ p: { "#text": "Hello !", b: "world" } });
  });

  it("keeps namespace prefixes in names", () => {
    expect(jsonOf('<ns:a xmlns:ns="urn:x"><ns:b>1</ns:b></ns:a>')).toEqual({
      "ns:a": { "@xmlns:ns": "urn:x", "ns:b": "1" },
    });
  });

  it("indents the output and says what the root was", () => {
    const result = xmlToJson("<a><b>1</b></a>", { ...TO_JSON, indent: 4 });

    expect(result.ok && result.output).toBe('{\n    "a": {\n        "b": "1"\n    }\n}');
    expect(result.ok && result.summary).toContain("<a>");
  });

  it("explains XML that is not well formed", () => {
    const result = xmlToJson("<a><b></a>", TO_JSON);

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.message).toContain("not valid XML");
  });

  it("rejects empty input and input that is too long", () => {
    expect(xmlToJson("  ", TO_JSON)).toMatchObject({ ok: false });
    expect(xmlToJson(`<a>${"x".repeat(2_000_001)}</a>`, TO_JSON)).toMatchObject({ ok: false });
  });
});

describe("jsonToXml", () => {
  it("writes elements, text, and attributes, indented", () => {
    expect(xmlOf('{"a":{"b":"1","c":{"@x":"y","#text":"t"}}}')).toBe('<a>\n  <b>1</b>\n  <c x="y">t</c>\n</a>');
  });

  it("writes a list as repeated elements, and null as an empty element", () => {
    expect(xmlOf('{"list":{"i":["1","2"],"e":null}}')).toBe("<list>\n  <i>1</i>\n  <i>2</i>\n  <e/>\n</list>");
  });

  it("escapes the characters XML reserves", () => {
    expect(xmlOf('{"a":"x & y < z > \\"q\\"","b":{"@t":"a \\"b\\" & c"}}', { rootName: "r" })).toBe(
      '<r>\n  <a>x &amp; y &lt; z &gt; &quot;q&quot;</a>\n  <b t="a &quot;b&quot; &amp; c"/>\n</r>',
    );
  });

  it("wraps JSON that has no single top-level key in the root element you choose", () => {
    expect(xmlOf('{"a":1,"b":2}')).toBe("<root>\n  <a>1</a>\n  <b>2</b>\n</root>");
    expect(xmlOf('{"a":1,"b":2}', { rootName: "data" })).toBe("<data>\n  <a>1</a>\n  <b>2</b>\n</data>");
  });

  it("wraps a top-level list as repeated item elements", () => {
    expect(xmlOf("[1,2]")).toBe("<root>\n  <item>1</item>\n  <item>2</item>\n</root>");
  });

  it("writes numbers and booleans as text", () => {
    expect(xmlOf('{"a":{"n":1.5,"t":true}}')).toBe("<a>\n  <n>1.5</n>\n  <t>true</t>\n</a>");
  });

  it("can add the declaration", () => {
    expect(xmlOf('{"a":1}', { declaration: true })).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<a>1</a>');
  });

  it("indents as asked", () => {
    expect(xmlOf('{"a":{"b":1}}', { indent: 4 })).toBe("<a>\n    <b>1</b>\n</a>");
  });

  it("puts an element's own text before its children", () => {
    expect(xmlOf('{"p":{"#text":"Hello","b":"world"}}')).toBe("<p>\n  Hello\n  <b>world</b>\n</p>");
  });

  it("refuses names that XML cannot use, and says which", () => {
    expect(jsonToXml('{"a":{"two words":1}}', TO_XML)).toMatchObject({
      message: expect.stringContaining('"two words" cannot be used as an XML tag name'),
      ok: false,
    });
    expect(jsonToXml('{"a":{"1st":1}}', TO_XML)).toMatchObject({ ok: false });
    expect(jsonToXml('{"a":{"@bad name":1}}', TO_XML)).toMatchObject({ message: expect.stringContaining("attribute"), ok: false });
    expect(jsonToXml('{"a":{"@x":[1]}}', TO_XML)).toMatchObject({ ok: false });
  });

  it("refuses control characters that XML does not allow", () => {
    expect(jsonToXml('{"a":"x\\u0001y"}', TO_XML)).toMatchObject({ message: expect.stringContaining("control character"), ok: false });
  });

  it("explains JSON problems", () => {
    expect(jsonToXml("", TO_XML)).toMatchObject({ ok: false });
    expect(jsonToXml("{oops", TO_XML)).toMatchObject({ message: expect.stringContaining("not valid JSON"), ok: false });
  });

  it("round-trips: XML to JSON and back gives the same XML", () => {
    const original = '<order id="7">\n  <item>a</item>\n  <item>b</item>\n  <note/>\n  <price currency="USD">9.5</price>\n</order>';
    const json = xmlToJson(original, TO_JSON);

    expect(json.ok && xmlOf(json.output)).toBe(original);
  });
});
