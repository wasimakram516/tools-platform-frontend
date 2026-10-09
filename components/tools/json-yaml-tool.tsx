"use client";

import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import type { ReactNode } from "react";
import { useState } from "react";
import { ConverterTool } from "@/components/tools/converter-tool";
import { INDENT_OPTIONS, ToolbarSelect, type ToolbarSelectOption } from "@/components/tools/converter-options";
import { OptionSwitch } from "@/components/tools/option-switch";
import type { ConverterDirection } from "@/components/tools/use-converter";
import { jsonToYaml, yamlToJson } from "@/lib/tools/data/yaml-json";

type Mode = "yamlToJson" | "jsonToYaml";

const YAML_EXAMPLE = "name: QuicklySorted\nlive: true\ntools:\n  - json\n  - yaml\nsettings:\n  retries: 3\n  timeout: 2.5";
const JSON_EXAMPLE = '{"name":"QuicklySorted","live":true,"tools":["json","yaml"],"settings":{"retries":3,"timeout":2.5}}';

const DIRECTIONS: readonly [ConverterDirection<Mode>, ConverterDirection<Mode>] = [
  {
    example: YAML_EXAMPLE,
    fileName: "converted.json",
    icon: <ArticleOutlinedIcon fontSize="small" />,
    inputLabel: "YAML",
    inputPlaceholder: "Paste YAML, such as a config file.",
    label: "YAML to JSON",
    mime: "application/json",
    outputLabel: "JSON",
    outputPlaceholder: "The JSON appears here.",
    tooltip: "Turn YAML into JSON",
    value: "yamlToJson",
  },
  {
    example: JSON_EXAMPLE,
    fileName: "converted.yaml",
    icon: <DataObjectIcon fontSize="small" />,
    inputLabel: "JSON",
    inputPlaceholder: "Paste JSON.",
    label: "JSON to YAML",
    mime: "application/yaml",
    outputLabel: "YAML",
    outputPlaceholder: "The YAML appears here.",
    tooltip: "Turn JSON into YAML",
    value: "jsonToYaml",
  },
];

/** YAML is only ever indented with spaces, and a compact style does not exist for it. */
const YAML_INDENT_OPTIONS: readonly ToolbarSelectOption<number>[] = INDENT_OPTIONS.filter((option) => option.value > 0);

/**
 * Converts YAML to JSON and JSON to YAML, live as you type. It follows YAML 1.2, so words such
 * as yes and no stay text, and it reports where a mistake is.
 */
export function JsonYamlTool(): ReactNode {
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  return (
    <ConverterTool
      convert={(input, mode) =>
        mode === "yamlToJson" ? yamlToJson(input, { indent }) : jsonToYaml(input, { indent, sortKeys })
      }
      directions={DIRECTIONS}
      idleMessage="Paste YAML or JSON above and the result appears here, converted in your browser."
      idPrefix="yaml-json"
      options={(mode) => (
        <>
          <ToolbarSelect
            id="yaml-indent"
            label="Indent"
            minWidth={120}
            onChange={setIndent}
            options={mode === "yamlToJson" ? INDENT_OPTIONS : YAML_INDENT_OPTIONS}
            value={mode === "jsonToYaml" && indent === 0 ? 2 : indent}
          />
          {mode === "jsonToYaml" ? (
            <OptionSwitch checked={sortKeys} label="Sort keys" onChange={setSortKeys} tooltip="Put the keys of every object in alphabetical order" />
          ) : null}
        </>
      )}
      toggleLabel="Conversion direction"
      workspaceLabel="JSON and YAML converter workspace"
    />
  );
}
