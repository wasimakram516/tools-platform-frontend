import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalDocument } from "@/components/legal/legal-document";
import { TERMS_OF_USE } from "@/lib/legal/legal-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description: TERMS_OF_USE.description,
  path: `/${TERMS_OF_USE.slug}`,
  title: TERMS_OF_USE.title,
});

/**
 * Renders the terms of use.
 */
export default function TermsPage(): ReactNode {
  return <LegalDocument document={TERMS_OF_USE} />;
}
