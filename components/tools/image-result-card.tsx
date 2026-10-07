import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Box, Button, Chip, CircularProgress, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { formatBytes, percentSaved } from "@/lib/tools/image/format";

interface ImageResultCardProps {
  /** True while the image is being made again with new settings. Hides the old result. */
  loading?: boolean;
  /** The finished file's size, or null while it is still being made. */
  newBytes: number | null;
  /** A short extra line, such as "The original was kept because it was already small". */
  note?: string;
  onDownload: () => void;
  onRemove: () => void;
  originalBytes: number;
  originalName: string;
  /** A message when this file could not be processed. */
  problem?: string;
  /** The finished file's name and pixel size. */
  result?: { height: number; name: string; width: number };
  /** A small preview of the finished image. */
  thumbnailUrl?: string;
}

/**
 * One image in a batch: a preview, the old and new size with the percentage saved, and buttons
 * to download or remove it.
 */
export function ImageResultCard({
  loading = false,
  newBytes,
  note,
  onDownload,
  onRemove,
  originalBytes,
  originalName,
  problem,
  result,
  thumbnailUrl,
}: ImageResultCardProps): ReactNode {
  const showResult = !loading && newBytes !== null;
  const saved = showResult ? percentSaved(originalBytes, newBytes) : null;

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, p: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 1.5,
            display: "flex",
            flexShrink: 0,
            height: 64,
            justifyContent: "center",
            overflow: "hidden",
            width: 64,
          }}
        >
          {thumbnailUrl && !loading ? (
            <Box
              alt=""
              component="img"
              src={thumbnailUrl}
              sx={{ height: "100%", objectFit: "cover", width: "100%" }}
            />
          ) : problem && !loading ? null : (
            <CircularProgress aria-label={`Working on ${originalName}`} size={22} />
          )}
        </Box>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{result?.name ?? originalName}</Typography>
          {loading ? (
            <Skeleton animation="wave" height={22} sx={{ mt: 0.25 }} width="min(220px, 80%)" />
          ) : problem ? (
            <Typography color="error" sx={{ fontSize: "0.85rem" }}>
              {problem}
            </Typography>
          ) : (
            <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, mt: 0.25 }}>
              <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                {formatBytes(originalBytes)}
                {newBytes === null ? " → working…" : ` → ${formatBytes(newBytes)}`}
                {result ? ` · ${result.width} × ${result.height}` : ""}
              </Typography>
              {saved !== null ? (
                <Chip
                  color={saved > 0 ? "success" : "default"}
                  label={saved > 0 ? `${saved}% smaller` : saved === 0 ? "Same size" : `${-saved}% bigger`}
                  size="small"
                  variant={saved > 0 ? "filled" : "outlined"}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
        <Stack direction="row" sx={{ alignItems: "center", flexShrink: 0, gap: 0.5 }}>
          {result ? (
            <Button disabled={loading} onClick={onDownload} size="small" startIcon={<DownloadIcon />} variant="outlined">
              Download
            </Button>
          ) : null}
          <Tooltip arrow describeChild title="Remove this image">
            <IconButton aria-label={`Remove ${originalName}`} onClick={onRemove} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      {note && !loading ? (
        <Alert severity="info" sx={{ mt: 1.25 }}>
          {note}
        </Alert>
      ) : null}
    </Box>
  );
}
