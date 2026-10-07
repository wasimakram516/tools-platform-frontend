import { TextField } from "@mui/material";
import type { ReactNode } from "react";

interface FieldProps {
  helperText?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

interface BaseFieldProps extends FieldProps {
  max?: number;
  min?: number;
  type: "date" | "time" | "number";
}

/**
 * Shared single-line field: full width, label always above the value so date and time pickers
 * never overlap their placeholder, and a plain string value for the caller.
 */
function BaseField({
  helperText,
  id,
  label,
  max,
  min,
  onChange,
  type,
  value,
}: BaseFieldProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={helperText}
      id={id}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        htmlInput: type === "number" ? { inputMode: "numeric", max, min, step: 1 } : {},
        inputLabel: { shrink: true },
      }}
      type={type}
      value={value}
    />
  );
}

/**
 * A calendar date field. The value is YYYY-MM-DD, or an empty string.
 */
export function DateField(props: FieldProps): ReactNode {
  return <BaseField {...props} type="date" />;
}

/**
 * A time-of-day field. The value is HH:MM (24-hour), or an empty string.
 */
export function TimeField(props: FieldProps): ReactNode {
  return <BaseField {...props} type="time" />;
}

interface NumberFieldProps extends FieldProps {
  max?: number;
  min?: number;
}

/**
 * A whole-number field. The value stays a string so an empty field can be told apart from zero.
 */
export function NumberField(props: NumberFieldProps): ReactNode {
  return <BaseField {...props} type="number" />;
}
