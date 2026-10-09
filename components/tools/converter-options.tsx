import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { ReactNode } from "react";

export interface ToolbarSelectOption<Value extends string | number> {
  label: string;
  value: Value;
}

interface ToolbarSelectProps<Value extends string | number> {
  id: string;
  label: string;
  onChange: (value: Value) => void;
  options: readonly ToolbarSelectOption<Value>[];
  value: Value;
  /** The narrowest the control gets, in pixels. */
  minWidth?: number;
}

const DEFAULT_MIN_WIDTH = 140;

/**
 * A small labelled drop-down for a tool's toolbar, in the same style as the JSON formatter's
 * indentation choice.
 */
export function ToolbarSelect<Value extends string | number>({
  id,
  label,
  minWidth = DEFAULT_MIN_WIDTH,
  onChange,
  options,
  value,
}: ToolbarSelectProps<Value>): ReactNode {
  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        id={id}
        label={label}
        labelId={`${id}-label`}
        onChange={(event) => onChange(event.target.value as Value)}
        value={value}
      >
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** The indentation choices every data converter offers. */
export const INDENT_OPTIONS: readonly ToolbarSelectOption<number>[] = [
  { label: "2 spaces", value: 2 },
  { label: "4 spaces", value: 4 },
  { label: "Compact", value: 0 },
];
