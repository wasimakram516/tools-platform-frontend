import { Box, LinearProgress, Skeleton, Stack, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { formatCharacterCount } from "@/lib/tools/text-metrics";
import { FONT_MONO } from "@/theme/typography";

const CHARACTER_LIMIT_WARNING_RATIO = 0.8;
const EDITOR_ROWS = 14;

interface TextEditorPanelProps {
  characterLimit?: number;
  id: string;
  label: string;
  loading?: boolean;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  readOnly?: boolean;
}

/**
 * Renders a labelled text editor with live character counts and optional limit feedback.
 * The limit meter overlays the top edge of the field, so input and output panels stay aligned.
 */
export function TextEditorPanel({
  characterLimit,
  id,
  label,
  loading = false,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: TextEditorPanelProps): ReactNode {
  const characterCount = value.length;
  const isOverLimit = characterLimit !== undefined && characterCount > characterLimit;
  const isNearLimit =
    characterLimit !== undefined && characterCount / characterLimit >= CHARACTER_LIMIT_WARNING_RATIO;
  const remainingCharacters = characterLimit === undefined ? 0 : characterLimit - characterCount;
  const usagePercentage =
    characterLimit === undefined ? 0 : Math.min((characterCount / characterLimit) * 100, 100);
  const countDescriptionId = `${id}-character-count`;
  const limitStatus = isOverLimit
    ? `${formatCharacterCount(Math.abs(remainingCharacters))} over limit`
    : `${formatCharacterCount(remainingCharacters)} remaining`;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { sm: "baseline" },
          gap: { xs: 0.25, sm: 1 },
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          component="label"
          htmlFor={id}
          sx={{ fontSize: "0.92rem", fontWeight: 700 }}
        >
          {label}
        </Typography>
        <Typography
          id={countDescriptionId}
          color={isOverLimit ? "error.main" : isNearLimit ? "warning.main" : "text.secondary"}
          sx={{
            fontSize: "0.78rem",
            fontVariantNumeric: "tabular-nums",
            fontWeight: isNearLimit ? 700 : 500,
          }}
        >
          {formatCharacterCount(characterCount)} {characterCount === 1 ? "character" : "characters"}
          {characterLimit === undefined ? "" : ` · ${limitStatus}`}
        </Typography>
      </Stack>
      <Box sx={{ position: "relative" }}>
        {characterLimit === undefined ? null : (
          <LinearProgress
            aria-label={`${label} character limit: ${limitStatus}`}
            color={isOverLimit ? "error" : isNearLimit ? "warning" : "primary"}
            value={usagePercentage}
            variant="determinate"
            sx={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              height: 3,
              left: 0,
              pointerEvents: "none",
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 1,
            }}
          />
        )}
        {loading ? (
          <Stack
            aria-hidden="true"
            sx={{ gap: 1.25, left: 14, pointerEvents: "none", position: "absolute", right: 14, top: 16, zIndex: 1 }}
          >
            {["92%", "78%", "86%", "54%", "70%"].map((width) => (
              <Skeleton animation="wave" height={16} key={width} width={width} />
            ))}
          </Stack>
        ) : null}
        <TextField
          id={id}
          multiline
          rows={EDITOR_ROWS}
          fullWidth
          value={value}
          onChange={onChange}
          placeholder={loading ? "" : placeholder}
          slotProps={{
            htmlInput: {
              "aria-describedby": countDescriptionId,
              "aria-invalid": isOverLimit || undefined,
              readOnly,
              spellCheck: false,
              sx: {
                fontFamily: FONT_MONO,
                fontSize: "0.86rem",
                lineHeight: 1.65,
              },
            },
          }}
          sx={{
            "& .MuiInputBase-root": {
              alignItems: "start",
              bgcolor: readOnly ? "action.hover" : "background.paper",
            },
          }}
        />
      </Box>
    </Box>
  );
}
