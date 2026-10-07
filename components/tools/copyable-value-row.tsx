import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FONT_MONO } from "@/theme/typography";

interface CopyableValueRowProps {
  /** Marks the row with the brand colour, for example when a pasted hash matches. */
  highlighted?: boolean;
  /** A short, stable name used for the copy button and for testing. */
  id: string;
  onCopy: () => void;
  /** The heading shown for the row; defaults to the id. */
  title?: string;
  value: string;
}

/**
 * A labelled value in a monospace block that wraps, with a copy button. Used for hashes and for
 * the same text written in several styles.
 */
export function CopyableValueRow({ highlighted = false, id, onCopy, title = id, value }: CopyableValueRowProps): ReactNode {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        borderRadius: 2,
        p: 1.5,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography component="h3" sx={{ fontSize: "0.88rem", fontWeight: 700 }}>
          {title}
        </Typography>
        <Tooltip arrow describeChild title={`Copy ${title}`}>
          <IconButton aria-label={`Copy ${title}`} onClick={onCopy} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography
        data-testid={`value-${id}`}
        sx={{ fontFamily: FONT_MONO, fontSize: "0.82rem", mt: 0.5, overflowWrap: "anywhere" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
