"use client";

import CodeIcon from "@mui/icons-material/Code";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { ConverterTool } from "@/components/tools/converter-tool";
import { INDENT_OPTIONS, ToolbarSelect } from "@/components/tools/converter-options";
import { OptionSwitch } from "@/components/tools/option-switch";
import type { ConverterDirection } from "@/components/tools/use-converter";
import { jsonToXml, xmlToJson } from "@/lib/tools/data/xml-json";

type Mode = "xmlToJson" | "jsonToXml";

const XML_EXAMPLE =
  '<?xml version="1.0"?>\n<order id="7">\n  <customer>Ann</customer>\n  <item sku="A1">Notebook</item>\n  <item sku="B2">Pen</item>\n  <paid>true</paid>\n</order>';
const JSON_EXAMPLE =
  '{"order":{"@id":"7","customer":"Ann","item":[{"@sku":"A1","#text":"Notebook"},{"@sku":"B2","#text":"Pen"}],"paid":true}}';
const DEFAULT_ROOT = "root";

const DIRECTIONS: readonly [ConverterDirection<Mode>, ConverterDirection<Mode>] = [
  {
    example: XML_EXAMPLE,
    fileName: "converted.json",
    icon: <CodeIcon fontSize="small" />,
    inputLabel: "XML",
    inputPlaceholder: "Paste XML.",
    label: "XML to JSON",
    mime: "application/json",
    outputLabel: "JSON",
    outputPlaceholder: "The JSON appears here.",
    tooltip: "Turn XML into JSON. Attributes become keys that start with @.",
    value: "xmlToJson",
  },
  {
    example: JSON_EXAMPLE,
    fileName: "converted.xml",
    icon: <DataObjectIcon fontSize="small" />,
    inputLabel: "JSON",
    inputPlaceholder: "Paste JSON. Keys that start with @ become attributes.",
    label: "JSON to XML",
    mime: "application/xml",
    outputLabel: "XML",
    outputPlaceholder: "The XML appears here.",
    tooltip: "Turn JSON into XML",
    value: "jsonToXml",
  },
];

/**
 * Converts XML to JSON and JSON to XML, live as you type, using the browser's own XML reader.
 * Attributes become keys that start with @, text beside child elements goes under #text, and
 * repeated elements become lists.
 */
export function XmlJsonTool(): ReactNode {
  const [includeAttributes, setIncludeAttributes] = useState(true);
  const [inferTypes, setInferTypes] = useState(false);
  const [indent, setIndent] = useState(2);
  const [rootName, setRootName] = useState(DEFAULT_ROOT);
  const [declaration, setDeclaration] = useState(false);

  return (
    <ConverterTool
      convert={(input, mode) =>
        mode === "xmlToJson"
          ? xmlToJson(input, { includeAttributes, indent, inferTypes })
          : jsonToXml(input, { declaration, indent, rootName: rootName.trim() || DEFAULT_ROOT })
      }
      directions={DIRECTIONS}
      idleMessage="Paste XML or JSON above and the result appears here, converted in your browser."
      idPrefix="xml-json"
      options={(mode) => (
        <>
          <ToolbarSelect id="xml-indent" label="Indent" minWidth={120} onChange={setIndent} options={INDENT_OPTIONS} value={indent} />
          {mode === "xmlToJson" ? (
            <>
              <OptionSwitch checked={includeAttributes} label="Keep attributes" onChange={setIncludeAttributes} tooltip="Keep attributes as keys that start with @. Turn off to leave them out." />
              <OptionSwitch checked={inferTypes} label="Convert types" onChange={setInferTypes} tooltip="Turn 5 into a number and true into a boolean. Values such as 007 stay text." />
            </>
          ) : (
            <>
              <TextField
                label="Root element"
                onChange={(event) => setRootName(event.target.value)}
                size="small"
                slotProps={{ htmlInput: { maxLength: 60, spellCheck: false } }}
                sx={{ maxWidth: 170 }}
                value={rootName}
              />
              <OptionSwitch checked={declaration} label="XML declaration" onChange={setDeclaration} tooltip="Start the file with the line that says it is XML version 1.0" />
            </>
          )}
        </>
      )}
      toggleLabel="Conversion direction"
      workspaceLabel="XML and JSON converter workspace"
    />
  );
}
