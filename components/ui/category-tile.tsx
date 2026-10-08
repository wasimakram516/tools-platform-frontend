import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import { NextLink } from "@/components/ui/next-link";
import { CARD_HOVER_SX } from "@/theme/surface";
import type { ToolCategory } from "@/types/tool";

interface CategoryTileProps {
  category: ToolCategory;
  toolCount: number;
}

/**
 * A compact link to a category: its icon, name, and how many tools it holds. Many of these fit
 * in a short grid, so the home page stays tidy however many categories there are.
 */
export function CategoryTile({ category, toolCount }: CategoryTileProps): ReactNode {
  return (
    <Card component="article" sx={{ height: "100%", ...CARD_HOVER_SX }} variant="outlined">
      <CardActionArea component={NextLink} href={`/categories/${category.slug}`} sx={{ height: "100%" }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.75, p: 2.25 }}>
          <IconTile icon={category.icon} size={44} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography component="h3" sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.25 }}>
              {category.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.25 }}>
              {toolCount} {toolCount === 1 ? "tool" : "tools"}
            </Typography>
          </Box>
          <ArrowForwardIcon aria-hidden="true" color="primary" sx={{ fontSize: 18 }} />
        </Stack>
      </CardActionArea>
    </Card>
  );
}
