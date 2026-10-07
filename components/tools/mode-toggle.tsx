import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import type { MouseEvent, ReactNode } from "react";

export interface ModeOption<Value extends string> {
  /** A small icon shown before the label. */
  icon?: ReactNode;
  label: string;
  /** A short explanation shown on hover and keyboard focus. */
  tooltip?: string;
  value: Value;
}

interface ModeToggleProps<Value extends string> {
  /** Stretch across the whole row, as in a form column. Otherwise the toggle fits its content. */
  fullWidth?: boolean;
  label: string;
  onChange: (value: Value) => void;
  options: readonly ModeOption<Value>[];
  value: Value;
}

/**
 * The one segmented control every tool uses to choose a direction or setting: a pill track
 * with the chosen option filled in the brand colour, and an icon beside each label.
 * Clicking the selected option again keeps it selected instead of leaving nothing chosen.
 */
export function ModeToggle<Value extends string>({
  fullWidth = false,
  label,
  onChange,
  options,
  value,
}: ModeToggleProps<Value>): ReactNode {
  /**
   * Passes on a new choice and ignores the deselect click.
   */
  function handleChange(_event: MouseEvent<HTMLElement>, next: Value | null): void {
    if (next !== null) {
      onChange(next);
    }
  }

  return (
    <ToggleButtonGroup
      aria-label={label}
      exclusive
      fullWidth={fullWidth}
      onChange={handleChange}
      size="small"
      sx={{
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 999,
        display: fullWidth ? "grid" : "inline-grid",
        gap: 0.5,
        gridAutoColumns: "1fr",
        gridAutoFlow: "column",
        p: 0.5,
        "& .MuiToggleButtonGroup-grouped": {
          "&.Mui-selected": {
            "&:hover": { backgroundColor: "primary.dark" },
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          },
          "& .MuiSvgIcon-root": { fontSize: "1.1rem", mr: 0.75 },
          border: 0,
          borderRadius: 999,
          color: "text.secondary",
          p: 0,
          "&:not(:first-of-type), &:first-of-type": { borderRadius: 999, ml: 0 },
        },
      }}
      value={value}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          <Tooltip arrow describeChild title={option.tooltip ?? ""}>
            <Box component="span" sx={{ alignItems: "center", display: "flex", justifyContent: "center", px: 1.75, py: 0.6, width: "100%" }}>
              {option.icon}
              {option.label}
            </Box>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
