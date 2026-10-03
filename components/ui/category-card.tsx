import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { NextLink } from "@/components/ui/next-link";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import type { ToolCategory } from "@/types/tool";

interface CategoryCardProps {
  category: ToolCategory;
  toolCount: number;
}

/**
 * Renders a category as a clickable card when it has tools, or a "coming soon" card otherwise.
 */
export function CategoryCard({ category, toolCount }: CategoryCardProps): ReactNode {
  const isAvailable = category.status === "available";
  const content = (
    <Stack sx={{ gap: 2, height: "100%", p: 3 }}>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <IconTile icon={category.icon} muted={!isAvailable} size={52} />
        <Chip
          color={isAvailable ? "success" : "default"}
          label={isAvailable ? `${toolCount} ${toolCount === 1 ? "tool" : "tools"}` : "Coming soon"}
          size="small"
          variant={isAvailable ? "filled" : "outlined"}
        />
      </Stack>
      <Box sx={{ flexGrow: 1 }}>
        <Typography component="h3" variant="h5">
          {category.name}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.75 }}>
          {category.description}
        </Typography>
      </Box>
      {isAvailable ? (
        <Typography
          color="primary"
          sx={{
            alignItems: "center",
            display: "inline-flex",
            fontSize: "0.9rem",
            fontWeight: 700,
            gap: 0.5,
          }}
        >
          Browse {category.name.toLowerCase()}
          <ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} />
        </Typography>
      ) : null}
    </Stack>
  );

  return (
    <Card
      component="article"
      variant="outlined"
      sx={{
        height: "100%",
        transition: "border-color 150ms ease, transform 150ms ease",
        ...(isAvailable && {
          "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
        }),
      }}
    >
      {isAvailable ? (
        <CardActionArea
          component={NextLink}
          href={`/categories/${category.slug}`}
          sx={{ height: "100%" }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
