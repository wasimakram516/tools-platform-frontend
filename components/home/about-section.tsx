import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CodeIcon from "@mui/icons-material/Code";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import { Box, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { HomeSection } from "@/components/home/home-section";
import { ToolSnapshots } from "@/components/home/tool-snapshots";
import { Reveal } from "@/components/ui/reveal";
import { revealDelay } from "@/lib/reveal-delay";
import { ToolIcon } from "@/components/ui/tool-icon";
import {
  ABOUT_HEADING,
  ABOUT_PARAGRAPHS,
  USE_CASES,
  USE_CASES_HEADING,
  type UseCaseGroup,
} from "@/lib/home-content";
import { getAvailableToolCategories, getToolBySlug, getTools } from "@/lib/tools/tool-registry";
import { CONTROL_RADIUS, SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";
import { FONT_HEADING } from "@/theme/typography";

const GROUP_ICONS: Readonly<Record<UseCaseGroup["icon"], ReactNode>> = {
  developers: <CodeIcon fontSize="small" />,
  everyone: <GroupsOutlinedIcon fontSize="small" />,
  owners: <LanguageOutlinedIcon fontSize="small" />,
  writers: <EditNoteOutlinedIcon fontSize="small" />,
};

/**
 * Says plainly what QuicklySorted is. The left side is text and live counts taken from the
 * registry; the right side shows real pieces of the tools. Below, each kind of visitor gets
 * links to the exact jobs they come for, worded the way people search for them.
 */
export function AboutSection(): ReactNode {
  const facts = [
    { label: "free tools", value: getTools().filter((tool) => tool.status === "available").length },
    { label: "categories", value: getAvailableToolCategories().length },
    { label: "accounts needed", value: 0 },
  ];

  return (
    <HomeSection headingId="home-about-heading" tone="tint">
      <Box
        sx={{
          alignItems: "center",
          display: "grid",
          gap: { xs: 5, md: 8 },
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 6fr) minmax(0, 6fr)" },
        }}
      >
        <Box>
          <Typography component="h2" id="home-about-heading" variant="h2">
            {ABOUT_HEADING}
          </Typography>
          <Stack sx={{ gap: 1.75, mt: 2.5 }}>
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <Typography color="text.secondary" key={paragraph} sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
                {paragraph}
              </Typography>
            ))}
          </Stack>
          <Box
            component="dl"
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: SURFACE_RADIUS,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              m: 0,
              mt: 4,
              overflow: "hidden",
            }}
          >
            {facts.map((fact, index) => (
              <Box
                key={fact.label}
                sx={{
                  borderColor: "divider",
                  borderLeft: index > 0 ? "1px solid" : 0,
                  display: "flex",
                  flexDirection: "column-reverse",
                  px: { xs: 1.5, sm: 2.5 },
                  py: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  component="dt"
                  sx={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", mt: 0.5, textTransform: "uppercase" }}
                >
                  {fact.label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{ fontFamily: FONT_HEADING, fontSize: "1.75rem", fontVariantNumeric: "tabular-nums", fontWeight: 700, lineHeight: 1.1, m: 0 }}
                >
                  {fact.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <ToolSnapshots />
      </Box>

      <Typography component="h3" sx={{ mb: 2.5, mt: { xs: 6, md: 8 } }} variant="h4">
        {USE_CASES_HEADING}
      </Typography>
      <Box
        component="ul"
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          listStyle: "none",
          m: 0,
          p: 0,
        }}
      >
        {USE_CASES.map((group) => (
          <Reveal
            as="li"
            delay={revealDelay(USE_CASES.indexOf(group))}
            key={group.id}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: SURFACE_RADIUS,
              boxShadow: SURFACE_SHADOW,
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              sx={{ alignItems: "center", bgcolor: "primary.main", color: "primary.contrastText", gap: 1.25, px: 2.25, py: 1.5 }}
            >
              <Box aria-hidden="true" sx={{ display: "flex" }}>
                {GROUP_ICONS[group.icon]}
              </Box>
              <Typography component="h4" sx={{ fontSize: "1rem", fontWeight: 700 }}>
                {group.title}
              </Typography>
            </Stack>
            <Box component="ul" sx={{ display: "grid", gap: 0.25, listStyle: "none", m: 0, p: 1 }}>
              {group.links.map((link) => {
                const tool = getToolBySlug(link.slug);

                return (
                  <Box
                    component="li"
                    key={link.slug}
                    sx={{
                      "& a": {
                        alignItems: "center",
                        borderRadius: CONTROL_RADIUS,
                        color: "text.primary",
                        display: "flex",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        gap: 1.25,
                        px: 1.25,
                        py: 1,
                        textDecoration: "none",
                        transition: "background-color 150ms ease, color 150ms ease",
                      },
                      "& a:hover": { bgcolor: "action.hover", color: "primary.main" },
                      "& a:hover .about-arrow": { color: "primary.main", transform: "translateX(3px)" },
                    }}
                  >
                    <NextLink href={`/tools/${link.slug}`}>
                      {tool ? <ToolIcon name={tool.icon} fontSize="small" sx={{ color: "primary.main" }} /> : null}
                      <span style={{ flexGrow: 1 }}>{link.label}</span>
                      <ArrowForwardIcon
                        aria-hidden="true"
                        className="about-arrow"
                        fontSize="small"
                        sx={{ color: "text.secondary", transition: "color 150ms ease, transform 150ms ease" }}
                      />
                    </NextLink>
                  </Box>
                );
              })}
            </Box>
          </Reveal>
        ))}
      </Box>
    </HomeSection>
  );
}
