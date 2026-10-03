import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ProcessingMode } from "@/types/tool";

const PROCESSING_LABELS: Readonly<Record<ProcessingMode, string>> = {
  browser: "On this device",
  worker: "On this device · background worker",
  wasm: "On this device · WebAssembly",
  server: "Secure server processing",
};

interface ProcessingBadgeProps {
  mode: ProcessingMode;
}

/**
 * States where a tool processes its input as a quiet inline note, so the privacy claim is
 * visible on every tool without competing with the page title.
 */
export function ProcessingBadge({ mode }: ProcessingBadgeProps): ReactNode {
  const isLocal = mode !== "server";

  return (
    <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <LockOutlinedIcon
        aria-hidden="true"
        color={isLocal ? "success" : "warning"}
        sx={{ fontSize: 18 }}
      />
      <Typography
        color={isLocal ? "success.main" : "warning.main"}
        sx={{ fontSize: "0.88rem", fontWeight: 650 }}
      >
        {PROCESSING_LABELS[mode]}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
        {isLocal ? "No signup. Your input is never uploaded." : "No signup."}
      </Typography>
    </Stack>
  );
}
