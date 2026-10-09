import { TextField } from "@mui/material";
import type { ReactNode } from "react";
import { hintFor } from "@/components/ui/field-hint";

interface TextInputProps {
  helperText?: string;
  id: string;
  label: string;
  /** Characters the field accepts. */
  maxLength?: number;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}

const DEFAULT_MAX_LENGTH = 2000;

/**
 * A labelled text field in the same style as the other tools' fields. The hint under it, if any,
 * has the shared info icon.
 */
export function TextInput({
  helperText,
  id,
  label,
  maxLength = DEFAULT_MAX_LENGTH,
  multiline = false,
  onChange,
  placeholder,
  rows = 3,
  value,
}: TextInputProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={hintFor(helperText)}
      id={id}
      label={label}
      multiline={multiline}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={multiline ? rows : undefined}
      slotProps={{
        htmlInput: { autoComplete: "off", maxLength, spellCheck: false },
        inputLabel: { shrink: true },
      }}
      value={value}
    />
  );
}
