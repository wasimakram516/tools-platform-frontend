import { InputAdornment, MenuItem, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { hintFor } from "@/components/ui/field-hint";

interface BaseFieldProps {
  helperText?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

interface DecimalFieldProps extends BaseFieldProps {
  /** A short unit shown after the number, such as "%". */
  suffix?: string;
}

/**
 * A field for numbers with decimals, such as an amount or a rate. The value stays a string so an
 * empty field can be told apart from zero.
 */
export function DecimalField({ helperText, id, label, onChange, suffix, value }: DecimalFieldProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={hintFor(helperText)}
      id={id}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        htmlInput: { inputMode: "decimal", step: "any" },
        input: suffix ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> } : undefined,
        inputLabel: { shrink: true },
      }}
      type="number"
      value={value}
    />
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends BaseFieldProps {
  options: readonly SelectOption[];
}

/**
 * A drop-down for choosing one option, with the same look as the other fields.
 */
export function SelectField({ helperText, id, label, onChange, options, value }: SelectFieldProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={hintFor(helperText)}
      id={id}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      select
      slotProps={{ inputLabel: { shrink: true } }}
      value={value}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
