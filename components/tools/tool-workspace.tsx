import { Box, Paper, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface ToolWorkspaceProps extends PropsWithChildren {
  /** The main call to action, shown beside the options. */
  actions: ReactNode;
  label: string;
  /** Settings that shape the result, such as direction or indentation. Shown first. */
  options?: ReactNode;
  /** Low-emphasis helpers such as loading an example or clearing, aligned to the far end. */
  secondaryActions?: ReactNode;
}

/**
 * Provides the shared tool surface: settings, then the main action, then helpers, above a
 * padded working area.
 */
export function ToolWorkspace({
  actions,
  children,
  label,
  options,
  secondaryActions,
}: ToolWorkspaceProps): ReactNode {
  return (
    <Paper
      aria-label={label}
      component="section"
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1.5,
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { xs: "stretch", sm: "center" }, flexWrap: "wrap", gap: 1.5 }}
        >
          {options}
          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
            {actions}
          </Stack>
        </Stack>
        {secondaryActions ? (
          <Stack
            direction="row"
            useFlexGap
            sx={{ flexWrap: "wrap", gap: 0.5, ml: { md: "auto" } }}
          >
            {secondaryActions}
          </Stack>
        ) : null}
      </Stack>
      <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
    </Paper>
  );
}

interface ToolStatusLineProps {
  message: string;
}

/**
 * Announces the latest tool outcome to assistive technology without moving focus.
 */
export function ToolStatusLine({ message }: ToolStatusLineProps): ReactNode {
  return (
    <Typography
      aria-live="polite"
      color="text.secondary"
      role="status"
      sx={{ fontSize: "0.85rem" }}
    >
      {message}
    </Typography>
  );
}

interface ToolFooterProps extends PropsWithChildren {
  message: string;
}

/**
 * Pairs the live status message with an optional trailing action, such as copying a result.
 */
export function ToolFooter({ children, message }: ToolFooterProps): ReactNode {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ alignItems: { sm: "center" }, gap: 1.5, justifyContent: "space-between", mt: 2.5 }}
    >
      <ToolStatusLine message={message} />
      {children}
    </Stack>
  );
}
