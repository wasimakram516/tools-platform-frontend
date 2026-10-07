import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FONT_MONO } from "@/theme/typography";

interface HashResultRowProps {
  algorithm: string;
  /** Marks the row green when the pasted checksum equals this hash. */
  isMatch: boolean;
  onCopy: () => void;
  /** The heading shown for the row; defaults to the algorithm name. */
  title?: string;
  value: string;
}

/**
 * One algorithm's hash: the name, the value in a monospace block that wraps, and a copy button.
 */
export function HashResultRow({ algorithm, isMatch, onCopy, title = algorithm, value }: HashResultRowProps): ReactNode {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: isMatch ? "primary.main" : "divider",
        borderRadius: 2,
        p: 1.5,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography component="h3" sx={{ fontSize: "0.88rem", fontWeight: 700 }}>
          {title}
        </Typography>
        <Tooltip arrow describeChild title={`Copy the ${title} hash`}>
          <IconButton aria-label={`Copy ${title}`} onClick={onCopy} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography
        data-testid={`hash-${algorithm}`}
        sx={{ fontFamily: FONT_MONO, fontSize: "0.82rem", mt: 0.5, overflowWrap: "anywhere" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
