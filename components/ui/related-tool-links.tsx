import { Box, Chip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { NextLink } from "@/components/ui/next-link";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolDefinition } from "@/types/tool";

interface RelatedToolLinksProps {
  tools: readonly ToolDefinition[];
}

/**
 * A single quiet line of links to related tools: a small label, then a rounded pill for each tool
 * with its icon. It replaces a row of cards so the tool itself stays the focus of the page.
 */
export function RelatedToolLinks({ tools }: RelatedToolLinksProps): ReactNode {
  if (tools.length === 0) {
    return null;
  }

  return (
    <Box
      aria-labelledby="related-tools-heading"
      component="nav"
      sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1.25, pt: 1 }}
    >
      <Typography
        color="text.secondary"
        component="h2"
        id="related-tools-heading"
        sx={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.01em", mr: 0.5 }}
      >
        Related tools
      </Typography>
      <Box component="ul" sx={{ display: "contents", listStyle: "none", m: 0, p: 0 }}>
        {tools.map((tool) => (
          <Box component="li" key={tool.id} sx={{ display: "inline-flex" }}>
            <Chip
              clickable
              component={NextLink}
              href={`/tools/${tool.slug}`}
              icon={<ToolIcon name={tool.icon} sx={{ fontSize: 18 }} />}
              label={tool.name}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "999px",
                height: 38,
                px: 0.5,
                transition: "border-color 150ms ease, background-color 150ms ease",
                "& .MuiChip-icon": { color: "primary.main" },
                "&:hover, &:focus-visible": { bgcolor: "action.hover", borderColor: "primary.main" },
              }}
              variant="outlined"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
