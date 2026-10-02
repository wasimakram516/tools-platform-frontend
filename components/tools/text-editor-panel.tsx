import { Box, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { formatCharacterCount } from "@/lib/tools/text-metrics";

const CHARACTER_LIMIT_WARNING_RATIO = 0.8;

interface TextEditorPanelProps {
  characterLimit?: number;
  id: string;
  label: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  readOnly?: boolean;
}

/**
 * Renders a labelled text editor with live character counts and optional limit feedback.
 */
export function TextEditorPanel({
  characterLimit,
  id,
  label,
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
          sx={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          id={countDescriptionId}
          color={isOverLimit ? "error.main" : isNearLimit ? "warning.dark" : "text.secondary"}
          sx={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.74rem",
            fontVariantNumeric: "tabular-nums",
            fontWeight: isNearLimit ? 700 : 500,
          }}
        >
          {formatCharacterCount(characterCount)} {characterCount === 1 ? "character" : "characters"}
          {characterLimit === undefined ? "" : ` · ${limitStatus}`}
        </Typography>
      </Stack>

      {characterLimit === undefined ? null : (
        <LinearProgress
          aria-label={`${label} character limit: ${limitStatus}`}
          color={isOverLimit ? "error" : isNearLimit ? "warning" : "primary"}
          value={usagePercentage}
          variant="determinate"
          sx={{ height: 3, mb: 1 }}
        />
      )}

      <TextField
        id={id}
        multiline
        rows={16}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        slotProps={{
          htmlInput: {
            "aria-describedby": countDescriptionId,
            "aria-invalid": isOverLimit || undefined,
            readOnly,
            spellCheck: false,
            sx: {
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.86rem",
              lineHeight: 1.65,
            },
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            alignItems: "start",
            bgcolor: readOnly ? "grey.50" : "common.white",
          },
        }}
      />
    </Box>
  );
}
