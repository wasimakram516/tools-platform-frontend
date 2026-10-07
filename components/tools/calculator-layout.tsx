import { Box, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface CalculatorLayoutProps {
  inputs: ReactNode;
  result: ReactNode;
}

/**
 * Lays out a calculator: the inputs on the left and the live result beside them on desktop,
 * stacked on small screens.
 */
export function CalculatorLayout({ inputs, result }: CalculatorLayoutProps): ReactNode {
  return (
    <Box
      sx={{
        alignItems: "start",
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 360px) minmax(0, 1fr)" },
      }}
    >
      <Stack sx={{ gap: 2.5 }}>{inputs}</Stack>
      <Box>{result}</Box>
    </Box>
  );
}
