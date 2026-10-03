import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalDocument } from "@/components/legal/legal-document";
import { PRIVACY_POLICY } from "@/lib/legal/legal-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description: PRIVACY_POLICY.description,
  path: `/${PRIVACY_POLICY.slug}`,
  title: PRIVACY_POLICY.title,
});

/**
 * Renders the privacy policy.
 */
export default function PrivacyPage(): ReactNode {
  return <LegalDocument document={PRIVACY_POLICY} />;
}
