import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { BRAND_NAME_PARTS } from "@/lib/site-config";
import { FONT_HEADING } from "@/theme/typography";

interface BrandLockupProps {
  fontSize?: string;
  markSize?: number;
}

/**
 * The brand mark beside the two-colour wordmark ("Quickly" in text colour, "Sorted" in brand
 * green, set in the heading font). Used wherever the brand appears so it never drifts.
 */
export function BrandLockup({ fontSize = "1.15rem", markSize = 34 }: BrandLockupProps): ReactNode {
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.25 }}>
      <BrandMark size={markSize} />
      <Typography
        component="span"
        sx={{
          fontFamily: FONT_HEADING,
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {BRAND_NAME_PARTS[0]}
        <Box component="span" sx={{ color: "primary.main" }}>
          {BRAND_NAME_PARTS[1]}
        </Box>
      </Typography>
    </Stack>
  );
}
