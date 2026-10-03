import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import { NextLink } from "@/components/ui/next-link";
import type { ToolDefinition } from "@/types/tool";

interface ToolCardProps {
  tool: ToolDefinition;
}

/**
 * Renders a tool as one fully clickable vertical card, or an inert card while it is planned.
 */
export function ToolCard({ tool }: ToolCardProps): ReactNode {
  const isAvailable = tool.status === "available";
  const content = (
    <Stack sx={{ gap: 2, height: "100%", p: 3 }}>
      <IconTile icon={tool.icon} muted={!isAvailable} size={52} />
      <Stack sx={{ flexGrow: 1 }}>
        <Typography component="h3" variant="h6">
          {tool.name}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.92rem", lineHeight: 1.55, mt: 0.75 }}>
          {tool.shortDescription}
        </Typography>
      </Stack>
      <Typography
        color={isAvailable ? "primary" : "text.disabled"}
        sx={{
          alignItems: "center",
          display: "inline-flex",
          fontSize: "0.85rem",
          fontWeight: 700,
          gap: 0.5,
        }}
      >
        {isAvailable ? "Open tool" : "Planned"}
        {isAvailable ? <ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} /> : null}
      </Typography>
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
        <CardActionArea component={NextLink} href={`/tools/${tool.slug}`} sx={{ height: "100%" }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
