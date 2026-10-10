"use client";

import { Box, Modal } from "@mui/material";
import type { ReactNode } from "react";
import { ToolSearch } from "@/components/search/tool-search";

const PILL_MAX_WIDTH = 640;
/** The same gap from the top of the window that the floating header pill uses. */
const TOP_GAP = 10;

interface SearchMenuProps {
  onClose: () => void;
}

/**
 * The floating search from the header: the shared tool search, in the same place and shape as the
 * header pill, over a dimmed backdrop. With nothing typed it offers the popular tools.
 */
export function SearchMenu({ onClose }: SearchMenuProps): ReactNode {
  return (
    <Modal
      // The input takes focus itself; letting the modal focus its own frame would steal it.
      disableAutoFocus
      onClose={onClose}
      open
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(6px)", bgcolor: "rgba(8, 22, 16, 0.5)" } } }}
    >
      <Box
        aria-label="Search tools"
        role="dialog"
        sx={{
          display: "flex",
          flexDirection: "column",
          insetInline: 0,
          marginInline: "auto",
          maxHeight: `calc(100vh - ${TOP_GAP * 2}px)`,
          outline: "none",
          position: "fixed",
          top: TOP_GAP,
          width: `min(92vw, ${PILL_MAX_WIDTH}px)`,
        }}
      >
        <ToolSearch
          autoFocus
          hint="Esc"
          idPrefix="site-search"
          label="Search tools"
          layout="flow"
          onNavigate={onClose}
          placeholder='Search, or describe the job, like "shrink an image"'
          showPopularWhenEmpty
          tone="onDark"
        />
      </Box>
    </Modal>
  );
}
