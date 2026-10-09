import { MAX_DATA_INPUT_CHARACTERS } from "@/lib/tools/data/csv";
import { inferValue, type DataConversionResult } from "@/lib/tools/data/csv-json";
import { failure } from "@/lib/tools/dates/result";

/** The key that holds an element's own text when it also has attributes or child elements. */
export const TEXT_KEY = "#text";
/** Attributes become keys that start with this mark, so they cannot clash with child elements. */
export const ATTRIBUTE_PREFIX = "@";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
/** A tag or attribute name: a letter or underscore first, then letters, digits, and . - _ and one colon. */
const XML_NAME = /^[\p{L}_][\p{L}\p{N}._-]*(:[\p{L}_][\p{L}\p{N}._-]*)?$/u;
/** Control characters that XML 1.0 does not allow anywhere in a document. */
const FORBIDDEN_XML_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface XmlToJsonOptions {
  /** Keep attributes, as keys that start with @. Otherwise they are left out. */
  includeAttributes: boolean;
  /** Spaces for each level of indentation. */
  indent: number;
  /** Turn numbers, true, false, and null into JSON values, not text. */
  inferTypes: boolean;
}

/**
 * Reads the text that sits directly inside an element, not the text of its children.
 */
function ownText(element: Element): string {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === TEXT_NODE || node.nodeType === CDATA_SECTION_NODE)
    .map((node) => node.nodeValue ?? "")
    .join("")
    .trim();
}

/**
 * Turns one XML element into a JSON value: its text when that is all it has, and otherwise an
 * object holding its attributes, its children, and any text under the #text key. Children that
 * share a name become a list. An element with nothing in it becomes null.
 */
function elementToValue(element: Element, options: XmlToJsonOptions): JsonValue {
  const children = Array.from(element.children);
  const attributes = options.includeAttributes ? Array.from(element.attributes) : [];
  const text = ownText(element);
  const textValue = options.inferTypes ? inferValue(text) : text;

  if (children.length === 0 && attributes.length === 0) {
    return text === "" ? null : textValue;
  }

  const result: { [key: string]: JsonValue } = {};

  for (const attribute of attributes) {
    result[`${ATTRIBUTE_PREFIX}${attribute.name}`] = options.inferTypes ? inferValue(attribute.value) : attribute.value;
  }

  if (text !== "") {
    result[TEXT_KEY] = textValue;
  }

  for (const child of children) {
    const value = elementToValue(child, options);
    const existing = result[child.tagName];

    if (existing === undefined) {
      result[child.tagName] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[child.tagName] = [existing, value];
    }
  }

  return result;
}

/**
 * Converts XML to JSON, using the browser's own XML reader. Attributes become keys that start
 * with @, an element's own text goes under #text when it also has attributes or children, and
 * children with the same name become a list. Comments and processing instructions are dropped.
 */
export function xmlToJson(text: string, options: XmlToJsonOptions): DataConversionResult {
  if (text.trim() === "") {
    return failure("Paste some XML to convert.");
  }

  if (text.length > MAX_DATA_INPUT_CHARACTERS) {
    return failure(`The input is limited to ${MAX_DATA_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  const document = new DOMParser().parseFromString(text, "application/xml");
  const problem = document.getElementsByTagName("parsererror")[0];

  if (problem) {
    const message = (problem.textContent ?? "").split("\n").find((line) => line.trim() !== "") ?? "it could not be read";

    return failure(`This is not valid XML: ${message.trim()}`);
  }

  const root = document.documentElement;

  return {
    ok: true,
    output: JSON.stringify({ [root.tagName]: elementToValue(root, options) }, null, options.indent),
    summary: `Converted, with <${root.tagName}> as the root.`,
  };
}

export interface JsonToXmlOptions {
  /** Start the file with the XML declaration line. */
  declaration: boolean;
  /** Spaces for each level of indentation. */
  indent: number;
  /** The name of the outer element, when the JSON does not have a single top-level key. */
  rootName: string;
}

/**
 * Makes text safe to put inside an element or an attribute.
 */
function escapeXml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

class XmlWriteError extends Error {}

/**
 * Checks that a name can be used as an XML tag or attribute name.
 */
function assertName(name: string, kind: string): void {
  if (!XML_NAME.test(name)) {
    throw new XmlWriteError(
      `"${name}" cannot be used as an XML ${kind} name. Names start with a letter or underscore and have no spaces.`,
    );
  }
}

/**
 * Writes a plain value as text, and rejects characters that XML does not allow.
 */
function textOf(value: string | number | boolean): string {
  const text = String(value);

  if (FORBIDDEN_XML_CHARACTERS.test(text)) {
    throw new XmlWriteError("The data holds a control character, which XML does not allow.");
  }

  return escapeXml(text);
}

/**
 * Writes one element, and its children, as lines of XML.
 */
function writeElement(name: string, value: JsonValue, depth: number, indent: number): string[] {
  assertName(name, "tag");

  const pad = " ".repeat(indent * depth);

  if (Array.isArray(value)) {
    return value.flatMap((item) => writeElement(name, item, depth, indent));
  }

  if (value === null) {
    return [`${pad}<${name}/>`];
  }

  if (typeof value !== "object") {
    return [`${pad}<${name}>${textOf(value)}</${name}>`];
  }

  let attributes = "";
  let text = "";
  const childLines: string[] = [];

  for (const [key, inner] of Object.entries(value)) {
    if (key.startsWith(ATTRIBUTE_PREFIX)) {
      const attributeName = key.slice(ATTRIBUTE_PREFIX.length);

      assertName(attributeName, "attribute");

      if (inner !== null && typeof inner === "object") {
        throw new XmlWriteError(`The attribute "${attributeName}" must be a plain value, not a list or an object.`);
      }

      attributes += ` ${attributeName}="${inner === null ? "" : textOf(inner)}"`;
    } else if (key === TEXT_KEY) {
      if (inner !== null && typeof inner === "object") {
        throw new XmlWriteError(`The ${TEXT_KEY} value must be plain text, not a list or an object.`);
      }

      text = inner === null ? "" : textOf(inner);
    } else {
      childLines.push(...writeElement(key, inner, depth + 1, indent));
    }
  }

  if (childLines.length === 0) {
    return [text === "" ? `${pad}<${name}${attributes}/>` : `${pad}<${name}${attributes}>${text}</${name}>`];
  }

  const textLine = text === "" ? [] : [`${pad}${" ".repeat(indent)}${text}`];

  return [`${pad}<${name}${attributes}>`, ...textLine, ...childLines, `${pad}</${name}>`];
}

/**
 * Converts JSON to XML. A key that starts with @ becomes an attribute, #text becomes the
 * element's own text, a list becomes repeated elements, and null becomes an empty element. If
 * the JSON is one object with one key, that key is the root; otherwise it is wrapped in an
 * element with the name you choose.
 */
export function jsonToXml(text: string, options: JsonToXmlOptions): DataConversionResult {
  if (text.trim() === "") {
    return failure("Paste some JSON to convert.");
  }

  if (text.length > MAX_DATA_INPUT_CHARACTERS) {
    return failure(`The input is limited to ${MAX_DATA_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  let data: JsonValue;

  try {
    data = JSON.parse(text) as JsonValue;
  } catch (error) {
    return failure(`This is not valid JSON: ${error instanceof Error ? error.message : "it could not be read"}.`);
  }

  try {
    const keys = data !== null && typeof data === "object" && !Array.isArray(data) ? Object.keys(data) : [];
    const singleRoot = keys.length === 1 && !keys[0]?.startsWith(ATTRIBUTE_PREFIX) && keys[0] !== TEXT_KEY;
    const topKey = keys[0];
    const lines =
      singleRoot && topKey !== undefined && !Array.isArray((data as { [key: string]: JsonValue })[topKey])
        ? writeElement(topKey, (data as { [key: string]: JsonValue })[topKey] as JsonValue, 0, options.indent)
        : writeElement(options.rootName, Array.isArray(data) ? { item: data } : data, 0, options.indent);
    const declaration = options.declaration ? ['<?xml version="1.0" encoding="UTF-8"?>'] : [];

    // With no indentation the XML is written compact, on one line.
    return { ok: true, output: [...declaration, ...lines].join(options.indent > 0 ? "\n" : ""), summary: "Converted." };
  } catch (error) {
    if (error instanceof XmlWriteError) {
      return failure(error.message);
    }

    throw error;
  }
}
