import { Box, Container, Link, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { NextLink } from "@/components/ui/next-link";
import { WisemenSoftLogo } from "@/components/ui/wisemen-soft-logo";
import { LEGAL_DOCUMENTS } from "@/lib/legal/legal-content";
import { COMPANY_NAME, COMPANY_URL } from "@/lib/site-config";
import { getAvailableToolCategories } from "@/lib/tools/tool-registry";

interface FooterLinkGroupProps {
  links: ReadonlyArray<{ href: string; label: string }>;
  title: string;
}

/**
 * Renders one titled column of footer links.
 */
function FooterLinkGroup({ links, title }: FooterLinkGroupProps): ReactNode {
  return (
    <Stack aria-label={title} component="nav" sx={{ gap: 1.25 }}>
      <Typography color="text.secondary" component="h2" sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
        {title}
      </Typography>
      {links.map((link) => (
        <Link
          color="text.primary"
          component={NextLink}
          href={link.href}
          key={link.href}
          sx={{ fontSize: "0.92rem" }}
        >
          {link.label}
        </Link>
      ))}
    </Stack>
  );
}

/**
 * Renders the product footer: brand blurb, browse and legal links, and company attribution.
 */
export function SiteFooter(): ReactNode {
  const browseLinks = [
    { href: "/categories", label: "All categories" },
    ...getAvailableToolCategories().map((category) => ({
      href: `/categories/${category.slug}`,
      label: category.name,
    })),
  ];
  const legalLinks = LEGAL_DOCUMENTS.map((document) => ({
    href: `/${document.slug}`,
    label: document.title,
  }));

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", mt: 8 }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "2fr 1fr 1fr" },
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            <Typography sx={{ fontWeight: 750 }}>Tools Platform</Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.9rem", lineHeight: 1.7, mt: 1 }}>
              Free tools for everyday work. Each tool states where your input is processed, and
              nothing needs an account.
            </Typography>
          </Box>
          <FooterLinkGroup links={browseLinks} title="Browse" />
          <FooterLinkGroup links={legalLinks} title="Legal" />
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 2,
            justifyContent: "space-between",
            mt: 5,
            pt: 3,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
            <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              A product of
            </Typography>
            <Link href={COMPANY_URL} rel="noopener" sx={{ display: "inline-flex" }}>
              <WisemenSoftLogo />
            </Link>
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            {`© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.`}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
