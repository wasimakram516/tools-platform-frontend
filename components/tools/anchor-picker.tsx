import { Box, ButtonBase } from "@mui/material";
import type { ReactNode } from "react";
import type { CropAnchor } from "@/lib/tools/image/dimensions";

const ANCHORS: readonly { label: string; value: CropAnchor }[] = [
  { label: "Top left", value: "top-left" },
  { label: "Top", value: "top" },
  { label: "Top right", value: "top-right" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Bottom left", value: "bottom-left" },
  { label: "Bottom", value: "bottom" },
  { label: "Bottom right", value: "bottom-right" },
];

interface AnchorPickerProps {
  onChange: (anchor: CropAnchor) => void;
  value: CropAnchor;
}

/**
 * A three-by-three grid for choosing which part of the image to keep when it is cropped.
 */
export function AnchorPicker({ onChange, value }: AnchorPickerProps): ReactNode {
  return (
    <Box
      aria-label="Keep this part of the image"
      role="group"
      sx={{ display: "grid", gap: 0.5, gridTemplateColumns: "repeat(3, 36px)" }}
    >
      {ANCHORS.map((anchor) => (
        <ButtonBase
          aria-label={anchor.label}
          aria-pressed={anchor.value === value}
          key={anchor.value}
          onClick={() => onChange(anchor.value)}
          sx={{
            bgcolor: anchor.value === value ? "primary.main" : "action.hover",
            border: "1px solid",
            borderColor: anchor.value === value ? "primary.main" : "divider",
            borderRadius: 1,
            height: 36,
            "&:hover": { bgcolor: anchor.value === value ? "primary.dark" : "action.selected" },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              bgcolor: anchor.value === value ? "primary.contrastText" : "text.secondary",
              borderRadius: "50%",
              height: 8,
              width: 8,
            }}
          />
        </ButtonBase>
      ))}
    </Box>
  );
}
