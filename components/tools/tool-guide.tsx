import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import type { ToolContent } from "@/lib/tools/tool-content";
import { FONT_HEADING } from "@/theme/typography";

interface ToolGuideProps {
  content: ToolContent;
  /** Keeps the questions' ids unique on the page. */
  idPrefix: string;
  toolName: string;
}

/**
 * The words around a tool: how to use it, step by step, and answers to the questions people ask
 * about it. It is plain, visible text, so readers get help and search engines get real content.
 */
export function ToolGuide({ content, idPrefix, toolName }: ToolGuideProps): ReactNode {
  return (
    <Box sx={{ display: "grid", gap: { xs: 4, md: 5 }, maxWidth: 860 }}>
      <Box aria-labelledby="tool-howto-heading" component="section">
        <Typography component="h2" id="tool-howto-heading" variant="h4">
          How to use the {toolName}
        </Typography>
        <Box component="ol" sx={{ display: "grid", gap: 1.5, listStyle: "none", m: 0, mt: 2.5, p: 0 }}>
          {content.steps.map((step, index) => (
            <Box component="li" key={step} sx={{ alignItems: "flex-start", display: "flex", gap: 1.75 }}>
              <Box
                aria-hidden="true"
                sx={{
                  alignItems: "center",
                  bgcolor: "primary.main",
                  borderRadius: "50%",
                  color: "primary.contrastText",
                  display: "inline-flex",
                  flexShrink: 0,
                  fontFamily: FONT_HEADING,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  height: 30,
                  justifyContent: "center",
                  width: 30,
                }}
              >
                {index + 1}
              </Box>
              <Typography sx={{ lineHeight: 1.65, pt: 0.25 }}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box aria-labelledby="tool-faq-heading" component="section">
        <Typography component="h2" id="tool-faq-heading" variant="h4">
          Questions about the {toolName}
        </Typography>
        <Box sx={{ mt: 2.5 }}>
          <FaqAccordion items={content.faqs.map((faq, index) => ({ ...faq, id: `${idPrefix}-${index + 1}` }))} />
        </Box>
      </Box>
    </Box>
  );
}
