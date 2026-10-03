import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { Box, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { InlineLinks } from "@/components/legal/inline-links";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCrumb, PageTitle } from "@/components/ui/page-title";
import { LEGAL_LAST_UPDATED, type LegalDocumentContent } from "@/lib/legal/legal-content";
import { breadcrumbJsonLd } from "@/lib/seo";

interface LegalDocumentProps {
  document: LegalDocumentContent;
}

/**
 * Renders a legal document as a readable single column: title, update date, then numbered
 * sections. Content lives in lib/legal so wording changes never touch layout code.
 */
export function LegalDocument({ document }: LegalDocumentProps): ReactNode {
  return (
    <PageFrame>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: document.title, path: `/${document.slug}` },
        ])}
      />
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[
              homeCrumb,
              {
                icon: <GavelOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />,
                label: document.title,
              },
            ]}
            description={document.intro}
            title={document.title}
          />
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Last updated {LEGAL_LAST_UPDATED}
          </Typography>
          <Stack sx={{ gap: 4 }}>
            {document.sections.map((section, index) => (
              <Box component="section" key={section.heading}>
                <Typography component="h2" variant="h5">
                  {`${index + 1}. ${section.heading}`}
                </Typography>
                {section.paragraphs.map((paragraph) => (
                  <Typography
                    color="text.secondary"
                    key={paragraph}
                    sx={{ lineHeight: 1.75, mt: 1.5 }}
                  >
                    <InlineLinks text={paragraph} />
                  </Typography>
                ))}
                {section.bullets ? (
                  <Box
                    component="ul"
                    sx={{ color: "text.secondary", lineHeight: 1.75, mt: 1, pl: 3 }}
                  >
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>
                        <InlineLinks text={bullet} />
                      </li>
                    ))}
                  </Box>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </PageFrame>
  );
}
