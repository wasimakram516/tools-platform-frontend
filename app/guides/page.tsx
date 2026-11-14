import { Box, Container, Link, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { NextLink } from "@/components/ui/next-link";
import { homeCrumb, PageTitle } from "@/components/ui/page-title";
import { formatIsoDate } from "@/lib/format-iso-date";
import { getGuides, guidePath, latestGuideUpdate } from "@/lib/guides/guides";
import { breadcrumbJsonLd, buildPageMetadata, webPageJsonLd } from "@/lib/seo";

const PATH = "/guides";
const TITLE = "Guides: Excel Dates, JWT Claims, UTM Tags";
const DESCRIPTION =
  "Reference guides that go further than a tool: Excel date serial numbers, JWT claims, UTM parameters, and character limits, each checked against sources.";

export const metadata: Metadata = buildPageMetadata({ description: DESCRIPTION, path: PATH, title: TITLE });

/**
 * Lists the reference guides, with the character limits page, which is the same kind of page.
 */
export default function GuidesPage(): ReactNode {
  const entries = [
    ...getGuides().map((guide) => ({ description: guide.metaDescription, href: guidePath(guide), name: guide.name, updatedAt: guide.updatedAt })),
    {
      description: "How much you can write in a post, a title, a description, or a text message, and where each figure comes from.",
      href: "/character-limits",
      name: "Character limits",
      updatedAt: undefined,
    },
  ];

  return (
    <PageFrame>
      <JsonLd
        data={[
          webPageJsonLd({ dateModified: latestGuideUpdate(), description: DESCRIPTION, name: "Guides", path: PATH }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: PATH },
          ]),
        ]}
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[{ ...homeCrumb }, { label: "Guides" }]}
            description="How things work, with tables, examples, and sources. Each guide links to the tool that does the job."
            title="Guides"
          />
          <Box component="ul" sx={{ display: "grid", gap: 3, listStyle: "none", m: 0, p: 0 }}>
            {entries.map((entry) => (
              <Box component="li" key={entry.href}>
                <Typography component="h2" variant="h5">
                  <Link component={NextLink} href={entry.href} underline="hover">
                    {entry.name}
                  </Link>
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 0.5 }}>
                  {entry.description}
                </Typography>
                {entry.updatedAt ? (
                  <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                    Checked <time dateTime={entry.updatedAt}>{formatIsoDate(entry.updatedAt)}</time>
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </PageFrame>
  );
}
