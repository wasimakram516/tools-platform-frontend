import { Document, parseAllDocuments, visit } from "yaml";
import { MAX_DATA_INPUT_CHARACTERS } from "@/lib/tools/data/csv";
import type { DataConversionResult } from "@/lib/tools/data/csv-json";
import { failure } from "@/lib/tools/dates/result";

export interface YamlToJsonOptions {
  /** Spaces for each level of indentation. */
  indent: number;
}

export interface JsonToYamlOptions {
  /** Spaces for each level of indentation. */
  indent: number;
  /** Write the keys of every object in alphabetical order. */
  sortKeys: boolean;
}

/**
 * Names where a YAML problem is, so it can be found in the input.
 */
function describeYamlError(error: { linePos?: readonly [{ col: number; line: number }, ...unknown[]]; message: string }): string {
  const position = error.linePos?.[0];
  const firstLine = error.message.split("\n")[0] ?? error.message;

  return position ? `${firstLine} (line ${position.line}, column ${position.col})` : firstLine;
}

/**
 * Converts YAML to JSON. YAML 1.2 rules are used, so words such as yes and no stay text, and
 * anchors and aliases are filled in. A file with several documents becomes a JSON list with one
 * item for each. Custom tags and other things JSON cannot hold are reported, not guessed at.
 */
export function yamlToJson(text: string, { indent }: YamlToJsonOptions): DataConversionResult {
  if (text.trim() === "") {
    return failure("Paste some YAML to convert.");
  }

  if (text.length > MAX_DATA_INPUT_CHARACTERS) {
    return failure(`The input is limited to ${MAX_DATA_INPUT_CHARACTERS.toLocaleString("en-US")} characters.`);
  }

  try {
    const documents = parseAllDocuments(text, { prettyErrors: true, uniqueKeys: true });
    const problem = documents.flatMap((document) => document.errors)[0];

    if (problem) {
      return failure(`This is not valid YAML: ${describeYamlError(problem)}`);
    }

    if (documents.length === 0) {
      return failure("There is no data in this YAML to convert. It may hold only comments.");
    }

    const values = documents.map((document) => document.toJS({ maxAliasCount: 100 }));
    const result = values.length === 1 ? values[0] : values;
    const output = JSON.stringify(result, null, indent);

    if (output === undefined) {
      return failure("There is no data in this YAML to convert.");
    }

    return {
      ok: true,
      output,
      summary: values.length === 1 ? "1 document converted." : `${values.length} documents converted into a list.`,
    };
  } catch (error) {
    return failure(`This YAML could not be converted: ${error instanceof Error ? error.message.split("\n")[0] : "unknown problem"}.`);
  }
}

/** Words that older YAML 1.1 readers turn into true and false. */
const YES_NO_WORDS = /^(yes|no|on|off)$/i;
/** Numbers written with colons, such as 1:20, which YAML 1.1 reads as base 60. */
const BASE_SIXTY_NUMBER = /^[-+]?[0-9][0-9_]*(:[0-5]?[0-9])+(\.[0-9_]*)?$/;

/**
 * Puts the keys of every object in alphabetical order, all the way down.
 */
function sortedDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortedDeep);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, inner]) => [key, sortedDeep(inner)]),
    );
  }

  return value;
}

/**
 * Converts JSON to YAML. Long lines are never folded, and text is quoted only when it has to be,
 * for example when it would otherwise read as a number or a keyword. Words such as yes, no, on,
 * and off, and numbers such as 1:20, are quoted too, because older YAML 1.1 readers, which many
 * tools still use, read them as true, false, or a different number. The result is read the same
 * way by both YAML versions.
 */
export function jsonToYaml(text: string, { indent, sortKeys }: JsonToYamlOptions): DataConversionResult {
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

  const document = new Document(sortKeys ? sortedDeep(data) : data);

  visit(document, {
    Scalar(_key, node) {
      if (typeof node.value === "string" && (YES_NO_WORDS.test(node.value) || BASE_SIXTY_NUMBER.test(node.value))) {
        node.type = "QUOTE_DOUBLE";
      }
    },
  });

  return { ok: true, output: document.toString({ indent, lineWidth: 0 }).trimEnd(), summary: "Converted." };
}
