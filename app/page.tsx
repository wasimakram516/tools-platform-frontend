import { Box, Button, Chip, Container, Link, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getToolCategories,
  getToolsByCategory,
} from "@/lib/tools/tool-registry";

/**
 * Renders the registry-backed product entry point and first available tool.
 */
export default function HomePage(): ReactNode {
  const [developerCategory] = getToolCategories();
  const developerTools = developerCategory ? getToolsByCategory(developerCategory.id) : [];

  return (
    <>
      <SiteHeader />
      <Box component="main">
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 9 } }}>
          <Box
            sx={{
              alignItems: "stretch",
              display: "grid",
              gap: { xs: 4, lg: 8 },
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.1fr) minmax(420px, 0.9fr)" },
            }}
          >
            <Stack sx={{ justifyContent: "center", maxWidth: 760 }}>
              <Typography
                color="primary"
                sx={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  letterSpacing: "0.11em",
                  mb: 2,
                  textTransform: "uppercase",
                }}
              >
                Workbench 001 · Developer tools
              </Typography>
              <Typography component="h1" variant="h1">
                Useful work,
                <Box component="span" sx={{ color: "primary.main", display: "block" }}>
                  without the upload.
                </Box>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: "1rem", md: "1.18rem" }, lineHeight: 1.7, mt: 3, maxWidth: 640 }}
              >
                Focused utilities that do the job in your browser. Start with JSON formatting;
                more developer essentials are already mapped into the same reusable workspace.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, mt: 4 }}>
                <Button href="/tools/json-formatter" size="large" variant="contained">
                  Open JSON Formatter
                </Button>
                <Button
                  href="/categories/developer-tools"
                  size="large"
                  variant="outlined"
                >
                  Browse developer tools
                </Button>
              </Stack>
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1, mt: 4 }}>
                {["Runs locally", "No signup", "No file retention"].map((pillar) => (
                  <Chip key={pillar} label={pillar} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  bgcolor: "text.primary",
                  color: "common.white",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.76rem" }}>
                  CATEGORY / DEVELOPER
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.76rem" }}>
                  01 READY
                </Typography>
              </Stack>
              <Box>
                {developerTools.map((tool, index) => (
                  <Box
                    key={tool.id}
                    sx={{
                      alignItems: "center",
                      borderBottom: index === developerTools.length - 1 ? 0 : "1px solid",
                      borderColor: "divider",
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: "42px minmax(0, 1fr) auto",
                      p: 2.25,
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        color: tool.status === "available" ? "primary.main" : "text.disabled",
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "0.72rem",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{tool.name}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.25 }}>
                        {tool.shortDescription}
                      </Typography>
                    </Box>
                    {tool.status === "available" ? (
                      <Link
                        href={`/tools/${tool.slug}`}
                        underline="hover"
                        sx={{ fontSize: "0.76rem", fontWeight: 700 }}
                      >
                        OPEN
                      </Link>
                    ) : (
                      <Typography
                        color="text.disabled"
                        sx={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.68rem" }}
                      >
                        NEXT
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Container>

        <Box sx={{ bgcolor: "secondary.main", borderBlock: "1px solid", borderColor: "divider" }}>
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              }}
            >
              {[
                ["LOCAL", "Input stays in this browser."],
                ["DIRECT", "No account between you and the result."],
                ["EXPLICIT", "Every tool states where processing happens."],
              ].map(([label, detail], index) => (
                <Box
                  key={label}
                  sx={{
                    borderRight: { md: index < 2 ? "1px solid" : 0 },
                    borderBottom: { xs: index < 2 ? "1px solid" : 0, md: 0 },
                    borderColor: "divider",
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{detail}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Box>
      <SiteFooter />
    </>
  );
}
