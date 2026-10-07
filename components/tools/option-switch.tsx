import { FormControlLabel, Switch, Tooltip } from "@mui/material";
import type { ReactNode } from "react";

interface OptionSwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  /** A short explanation shown on hover and keyboard focus. */
  tooltip?: string;
}

/**
 * A labelled on or off setting for a tool's toolbar, with an optional explanation on hover.
 */
export function OptionSwitch({ checked, label, onChange, tooltip }: OptionSwitchProps): ReactNode {
  return (
    <Tooltip arrow describeChild title={tooltip ?? ""}>
      <FormControlLabel
        control={<Switch checked={checked} onChange={(event) => onChange(event.target.checked)} size="small" />}
        label={label}
        sx={{ m: 0 }}
      />
    </Tooltip>
  );
}
