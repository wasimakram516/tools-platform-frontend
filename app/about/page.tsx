import { Box, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InlineLinks } from "@/components/legal/inline-links";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCrumb, PageTitle } from "@/components/ui/page-title";
import { ABOUT_DESCRIPTION, ABOUT_INTRO, ABOUT_SECTIONS, ABOUT_TITLE, ABOUT_UPDATED_ISO } from "@/lib/about-content";
import { breadcrumbJsonLd, buildPageMetadata, organizationJsonLd, webPageJsonLd } from "@/lib/seo";

const PATH = "/about";

export const metadata: Metadata = buildPageMetadata({ description: ABOUT_DESCRIPTION, path: PATH, title: ABOUT_TITLE });

/**
 * Says who makes the site, why, and how the promise that tool input stays on the device is kept.
 */
export default function AboutPage(): ReactNode {
  return (
    <PageFrame>
      <JsonLd
        data={[
          organizationJsonLd(),
          { ...webPageJsonLd({ dateModified: ABOUT_UPDATED_ISO, description: ABOUT_DESCRIPTION, name: ABOUT_TITLE, path: PATH }), "@type": "AboutPage" },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: PATH },
          ]),
        ]}
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle breadcrumbs={[{ ...homeCrumb }, { label: "About" }]} description={ABOUT_INTRO} title={ABOUT_TITLE} />
          {ABOUT_SECTIONS.map((section) => (
            <Box aria-labelledby={`about-${section.id}`} component="section" key={section.id}>
              <Typography component="h2" id={`about-${section.id}`} variant="h4">
                {section.heading}
              </Typography>
              <Stack sx={{ gap: 1.5, mt: 2 }}>
                {section.paragraphs.map((paragraph) => (
                  <Typography key={paragraph} sx={{ lineHeight: 1.7 }}>
                    <InlineLinks text={paragraph} />
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Container>
    </PageFrame>
  );
}
