import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

/**
 * The hint shown under a form field: a small info icon followed by the text. Use it for every
 * helper text so hints look the same everywhere. The icon is decorative.
 */
export function FieldHint({ children }: PropsWithChildren): ReactNode {
  return (
    <Box component="span" sx={{ alignItems: "flex-start", display: "inline-flex", gap: 0.75 }}>
      <InfoOutlinedIcon aria-hidden="true" sx={{ fontSize: "1rem", mt: "1px" }} />
      <span>{children}</span>
    </Box>
  );
}

/**
 * Wraps optional hint text for a field's helperText prop, leaving it empty when there is none.
 */
export function hintFor(text: string | undefined): ReactNode {
  return text ? <FieldHint>{text}</FieldHint> : undefined;
}
