import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { ToolIcon, type IconKey } from "@/components/ui/tool-icon";

interface IconTileProps {
  icon: IconKey;
  muted?: boolean;
  size?: number;
}

/** How round a tile's corners are, as a share of its size, so small and large tiles look alike. */
const CORNER_SHARE = 0.3;

/**
 * Renders a registry icon on a brand-coloured tile so tools and categories share one visual
 * anchor. Active tiles have a soft gradient, a faint top highlight, and a tinted shadow that
 * lifts them slightly; muted tiles (for planned items) stay flat.
 */
export function IconTile({ icon, muted = false, size = 48 }: IconTileProps): ReactNode {
  return (
    <Box
      aria-hidden="true"
      sx={{
        alignItems: "center",
        borderRadius: `${Math.round(size * CORNER_SHARE)}px`,
        color: muted ? "text.secondary" : "primary.contrastText",
        display: "inline-flex",
        flexShrink: 0,
        height: size,
        justifyContent: "center",
        width: size,
        ...(muted
          ? { bgcolor: "action.hover" }
          : {
              backgroundImage: "linear-gradient(145deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 14px -6px var(--mui-palette-primary-main)",
            }),
      }}
    >
      <ToolIcon name={icon} sx={{ fontSize: size * 0.5 }} />
    </Box>
  );
}
