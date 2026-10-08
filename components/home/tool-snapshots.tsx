import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { createQrCode, qrToSvg } from "@/lib/tools/generators/qr";
import { strengthOf } from "@/lib/tools/generators/password";
import { analyzeText } from "@/lib/tools/text/text-stats";
import { BRAND_DOMAIN, BRAND_TAGLINE } from "@/lib/site-config";
import { CONTROL_RADIUS, SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";
import { FONT_HEADING, FONT_MONO } from "@/theme/typography";

/** An example only. It is shown as a sample and never generated or sent anywhere. */
const SAMPLE_PASSWORD = "mQ7!vL2-xRt9";
/** The symbols a generated password can draw from, plus letters and digits: 26 + 26 + 10 + 27. */
const SAMPLE_POOL_SIZE = 89;

/**
 * The surface of one snapshot: a small, framed piece of the real product.
 */
function SnapshotCard({ children, label, tilt = 0 }: { children: ReactNode; label: string; tilt?: number }): ReactNode {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: SURFACE_RADIUS,
        boxShadow: SURFACE_SHADOW,
        p: 2,
        transform: { md: `rotate(${tilt}deg)` },
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", mb: 1.25, textTransform: "uppercase" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/**
 * Three small pieces of the real tools, drawn by the same code the tools use: a QR code that
 * scans to this site, live counts for the tagline, and a password strength reading. They show
 * what the product is without a paragraph of description.
 */
export function ToolSnapshots(): ReactNode {
  const qr = createQrCode(`https://www.${BRAND_DOMAIN}`, "M");
  const qrUrl = qr.ok
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrToSvg(qr.code, { background: "#ffffff", foreground: "#14211c", quietZone: 2 }))}`
    : null;
  const stats = analyzeText(BRAND_TAGLINE);
  const strength = strengthOf(SAMPLE_PASSWORD.length * Math.log2(SAMPLE_POOL_SIZE));

  return (
    <Box
      aria-hidden="true"
      sx={{
        backgroundImage: "radial-gradient(circle, rgba(31, 122, 90, 0.18) 1px, transparent 1.5px)",
        backgroundSize: "18px 18px",
        borderRadius: SURFACE_RADIUS,
        display: "grid",
        gap: 2.5,
        alignItems: "center",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        p: { xs: 1, md: 3 },
      }}
    >
      <SnapshotCard label="QR code" tilt={-2}>
        {qrUrl ? (
          <Box alt="" component="img" src={qrUrl} sx={{ borderRadius: CONTROL_RADIUS, display: "block", imageRendering: "pixelated", width: "100%" }} />
        ) : null}
      </SnapshotCard>

      <Stack sx={{ gap: 2.5 }}>
        <SnapshotCard label="Word counter" tilt={1.5}>
          <Typography sx={{ fontFamily: FONT_HEADING, fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>
            {BRAND_TAGLINE}
          </Typography>
          <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(2, 1fr)", mt: 1.5 }}>
            {[
              { label: "Words", value: stats.words },
              { label: "Characters", value: stats.characters },
            ].map((stat) => (
              <Box key={stat.label} sx={{ bgcolor: "action.hover", borderRadius: CONTROL_RADIUS, px: 1.5, py: 1 }}>
                <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ fontFamily: FONT_HEADING, fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.2 }}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </SnapshotCard>

        <SnapshotCard label="Password generator" tilt={-1}>
          <Typography sx={{ fontFamily: FONT_MONO, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.02em" }}>
            {SAMPLE_PASSWORD}
          </Typography>
          <Typography color="primary" sx={{ fontSize: "0.8rem", fontWeight: 700, mt: 1 }}>
            {strength.label}
          </Typography>
        </SnapshotCard>
      </Stack>
    </Box>
  );
}
