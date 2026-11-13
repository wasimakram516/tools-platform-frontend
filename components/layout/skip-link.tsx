import { Link } from "@mui/material";
import type { ReactNode } from "react";
import { VISUALLY_HIDDEN_SX } from "@/components/ui/hidden-heading";

/** The id of the page's main landmark, which the skip link jumps to. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * The first thing a keyboard user reaches on every page. It stays hidden until it is focused,
 * then lets them jump past the header menus straight to the page's content.
 */
export function SkipLink(): ReactNode {
  return (
    <Link
      href={`#${MAIN_CONTENT_ID}`}
      sx={{
        ...VISUALLY_HIDDEN_SX,
        "&:focus": {
          bgcolor: "background.paper",
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          clip: "auto",
          height: "auto",
          left: 16,
          margin: 0,
          px: 2,
          py: 1,
          top: 16,
          width: "auto",
          zIndex: 2000,
        },
      }}
    >
      Skip to content
    </Link>
  );
}
