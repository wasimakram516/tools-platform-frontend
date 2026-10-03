import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { ToolIcon, type IconKey } from "@/components/ui/tool-icon";

interface IconTileProps {
  icon: IconKey;
  muted?: boolean;
  size?: number;
}

/**
 * Renders a registry icon on a tinted tile so tools and categories share one visual anchor.
 */
export function IconTile({ icon, muted = false, size = 48 }: IconTileProps): ReactNode {
  return (
    <Box
      aria-hidden="true"
      sx={{
        alignItems: "center",
        bgcolor: muted ? "action.hover" : "primary.main",
        borderRadius: 2.5,
        color: muted ? "text.secondary" : "primary.contrastText",
        display: "inline-flex",
        flexShrink: 0,
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <ToolIcon name={icon} sx={{ fontSize: size * 0.5 }} />
    </Box>
  );
}
