import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Button } from "@mui/material";
import type { ReactNode } from "react";

interface ResetButtonProps {
  onClick: () => void;
}

/**
 * The low-emphasis "Reset" helper every calculator shows in its toolbar.
 */
export function ResetButton({ onClick }: ResetButtonProps): ReactNode {
  return (
    <Button color="inherit" onClick={onClick} size="small" startIcon={<RestartAltIcon />}>
      Reset
    </Button>
  );
}
