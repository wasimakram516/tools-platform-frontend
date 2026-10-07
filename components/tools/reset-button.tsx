import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Button, Tooltip } from "@mui/material";
import type { ReactNode } from "react";

interface ResetButtonProps {
  onClick: () => void;
}

/**
 * The low-emphasis "Reset" helper every calculator shows in its toolbar.
 */
export function ResetButton({ onClick }: ResetButtonProps): ReactNode {
  return (
    <Tooltip arrow describeChild title="Clear every field and start again">
      <Button color="inherit" onClick={onClick} size="small" startIcon={<RestartAltIcon />}>
        Reset
      </Button>
    </Tooltip>
  );
}
