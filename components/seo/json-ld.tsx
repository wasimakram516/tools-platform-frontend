import type { ReactNode } from "react";

interface JsonLdProps {
  data: Record<string, unknown> | readonly Record<string, unknown>[];
}

/**
 * Emits schema.org structured data. "<" is escaped so content can never close the script tag.
 */
export function JsonLd({ data }: JsonLdProps): ReactNode {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");

  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
