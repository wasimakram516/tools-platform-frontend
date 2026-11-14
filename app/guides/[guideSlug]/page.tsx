import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GuideBody } from "@/components/guides/guide-body";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { NextLink } from "@/components/ui/next-link";
import { homeCrumb, PageTitle } from "@/components/ui/page-title";
import { formatIsoDate } from "@/lib/format-iso-date";
import { getGuideBySlug, getGuides, guidePath } from "@/lib/guides/guides";
import { breadcrumbJsonLd, buildPageMetadata, faqJsonLd, organizationJsonLd, techArticleJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools/tool-registry";

interface GuidePageProps {
  params: Promise<{ guideSlug: string }>;
}

/**
 * Prebuilds every guide.
 */
export function generateStaticParams(): Array<{ guideSlug: string }> {
  return getGuides().map((guide) => ({ guideSlug: guide.slug }));
}

/**
 * Uses the guide's own title and description in search results.
 */
export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug((await params).guideSlug);

  return guide ? buildPageMetadata({ description: guide.metaDescription, path: guidePath(guide), title: guide.seoTitle }) : {};
}

/**
 * A reference guide: the sections, a link to the paired tool, questions, and the sources the
 * facts were checked against, with the date they were checked.
 */
export default async function GuidePage({ params }: GuidePageProps): Promise<ReactNode> {
  const guide = getGuideBySlug((await params).guideSlug);
  const tool = guide ? getToolBySlug(guide.toolSlug) : undefined;

  if (!guide || !tool) {
    notFound();
  }

  const path = guidePath(guide);

  return (
    <PageFrame>
      <JsonLd
        data={[
          organizationJsonLd(),
          techArticleJsonLd({ dateModified: guide.updatedAt, description: guide.metaDescription, headline: guide.name, path }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.name, path },
          ]),
          faqJsonLd(guide.faqs),
        ]}
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[{ ...homeCrumb }, { href: "/guides", label: "Guides" }, { label: guide.name }]}
            description={guide.intro}
            title={guide.name}
          />
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem", mt: { xs: -2, md: -3 } }}>
            Checked against the sources below on <time dateTime={guide.updatedAt}>{formatIsoDate(guide.updatedAt)}</time>.
          </Typography>

          <GuideBody sections={guide.sections} />

          <Stack
            sx={{
              alignItems: { sm: "center" },
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              flexDirection: { sm: "row", xs: "column" },
              gap: 2,
              justifyContent: "space-between",
              p: 3,
            }}
          >
            <Box>
              <Typography component="h2" variant="h5">
                {tool.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {tool.shortDescription}
              </Typography>
            </Box>
            <Button component={NextLink} href={`/tools/${tool.slug}`} sx={{ flexShrink: 0 }} variant="contained">
              {guide.toolAction}
            </Button>
          </Stack>

          <Box aria-labelledby="guide-faq" component="section">
            <Typography component="h2" id="guide-faq" variant="h4">
              Questions
            </Typography>
            <Box sx={{ mt: 2.5 }}>
              <FaqAccordion items={guide.faqs.map((entry, index) => ({ ...entry, id: `guide-faq-${index + 1}` }))} />
            </Box>
          </Box>

          <Box aria-labelledby="guide-sources" component="section">
            <Typography component="h2" id="guide-sources" variant="h5">
              Sources
            </Typography>
            <Box component="ul" sx={{ display: "grid", gap: 0.75, lineHeight: 1.6, mt: 1.5, pl: 3 }}>
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <Link href={source.url} rel="noopener" underline="always">
                    {source.label}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </PageFrame>
  );
}
