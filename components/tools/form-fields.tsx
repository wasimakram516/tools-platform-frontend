import { TextField } from "@mui/material";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";
import { hintFor } from "@/components/ui/field-hint";

interface FieldProps {
  helperText?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

/** Display formats: the month is always a short name so day and month are never confused. */
export const DATE_DISPLAY_FORMAT = "DD MMM YYYY";
export const TIME_DISPLAY_FORMAT = "hh:mm A";
export const DATE_TIME_DISPLAY_FORMAT = `${DATE_DISPLAY_FORMAT}, ${TIME_DISPLAY_FORMAT}`;

/** The plain-string formats the tools exchange with these fields. */
const DATE_VALUE_FORMAT = "YYYY-MM-DD";
const TIME_VALUE_FORMAT = "HH:mm";
const DATE_TIME_VALUE_FORMAT = `${DATE_VALUE_FORMAT}T${TIME_VALUE_FORMAT}`;

/**
 * Reads a tool's string value into a picker value, or null when it is empty or not a real date.
 */
function toPickerValue(value: string, toDayjs: (value: string) => Dayjs): Dayjs | null {
  if (!value) {
    return null;
  }

  const parsed = toDayjs(value);

  return parsed.isValid() ? parsed : null;
}

/**
 * Turns a picker value back into the tool's string, or an empty string while it is incomplete.
 */
function toToolValue(value: Dayjs | null, format: string): string {
  return value && value.isValid() ? value.format(format) : "";
}

/**
 * Props every picker shares: full width, the helper text, and a stable id for the input.
 */
function pickerSlotProps({ helperText, id }: Pick<FieldProps, "helperText" | "id">) {
  return { textField: { fullWidth: true, helperText: hintFor(helperText), id } };
}

/**
 * A calendar date picker. The value is YYYY-MM-DD, or an empty string.
 */
export function DateField(props: FieldProps): ReactNode {
  return (
    <DatePicker
      format={DATE_DISPLAY_FORMAT}
      label={props.label}
      onChange={(next) => props.onChange(toToolValue(next, DATE_VALUE_FORMAT))}
      slotProps={pickerSlotProps(props)}
      value={toPickerValue(props.value, (value) => dayjs(value))}
    />
  );
}

/**
 * A time-of-day picker shown with AM and PM. The value is HH:MM (24-hour), or an empty string.
 */
export function TimeField(props: FieldProps): ReactNode {
  return (
    <TimePicker
      ampm
      format={TIME_DISPLAY_FORMAT}
      label={props.label}
      onChange={(next) => props.onChange(toToolValue(next, TIME_VALUE_FORMAT))}
      slotProps={pickerSlotProps(props)}
      value={toPickerValue(props.value, (value) => dayjs(`1970-01-01T${value}`))}
    />
  );
}

/**
 * A date and time picker. The value is YYYY-MM-DDTHH:MM (24-hour), or an empty string.
 */
export function DateTimeField(props: FieldProps): ReactNode {
  return (
    <DateTimePicker
      ampm
      format={DATE_TIME_DISPLAY_FORMAT}
      label={props.label}
      onChange={(next) => props.onChange(toToolValue(next, DATE_TIME_VALUE_FORMAT))}
      slotProps={pickerSlotProps(props)}
      value={toPickerValue(props.value, (value) => dayjs(value))}
    />
  );
}

interface NumberFieldProps extends FieldProps {
  max?: number;
  min?: number;
}

/**
 * A whole-number field. The value stays a string so an empty field can be told apart from zero.
 */
export function NumberField({
  helperText,
  id,
  label,
  max,
  min,
  onChange,
  value,
}: NumberFieldProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={hintFor(helperText)}
      id={id}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        htmlInput: { inputMode: "numeric", max, min, step: 1 },
        inputLabel: { shrink: true },
      }}
      type="number"
      value={value}
    />
  );
}
