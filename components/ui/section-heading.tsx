import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  description?: string;
  id?: string;
  title: string;
}

/**
 * Renders a section title with an optional supporting sentence, stacked for readability.
 */
export function SectionHeading({ description, id, title }: SectionHeadingProps): ReactNode {
  return (
    <Box sx={{ maxWidth: 680 }}>
      <Typography component="h2" id={id} variant="h2">
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 1.25 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
