import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { NextLink } from "@/components/ui/next-link";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import type { IconKey } from "@/components/ui/tool-icon";

export interface BreadcrumbItem {
  href?: string;
  icon?: ReactNode;
  label: string;
}

const CRUMB_ICON_SX = { fontSize: 18 } as const;

export const homeCrumb: BreadcrumbItem = {
  href: "/",
  icon: <HomeOutlinedIcon aria-hidden="true" sx={CRUMB_ICON_SX} />,
  label: "Home",
};

export const categoriesCrumb: BreadcrumbItem = {
  icon: <GridViewOutlinedIcon aria-hidden="true" sx={CRUMB_ICON_SX} />,
  label: "Categories",
};

interface PageTitleProps {
  breadcrumbs: readonly BreadcrumbItem[];
  description: string;
  icon?: IconKey;
  title: string;
}

/**
 * Renders breadcrumbs, an optional icon, the page h1, and a supporting description.
 */
export function PageTitle({
  breadcrumbs,
  description,
  icon,
  title,
}: PageTitleProps): ReactNode {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <Breadcrumbs aria-label="Breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
        {breadcrumbs.map((item) =>
          item.href ? (
            <Link
              color="text.secondary"
              component={NextLink}
              href={item.href}
              key={item.label}
              sx={{ alignItems: "center", display: "inline-flex", gap: 0.75 }}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Typography
              color="text.primary"
              key={item.label}
              sx={{ alignItems: "center", display: "inline-flex", fontWeight: 600, gap: 0.75 }}
            >
              {item.icon}
              {item.label}
            </Typography>
          ),
        )}
      </Breadcrumbs>
      <Stack direction="row" sx={{ alignItems: "flex-start", gap: 2.5 }}>
        {icon ? <IconTile icon={icon} size={64} /> : null}
        <Box sx={{ maxWidth: 820 }}>
          <Typography component="h1" variant="h1" sx={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.65, mt: 1.5 }}
          >
            {description}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
