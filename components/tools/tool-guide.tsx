import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import type { ToolContent } from "@/lib/tools/tool-content";
import type { ToolExtras } from "@/lib/tools/tool-extras";
import { FONT_HEADING } from "@/theme/typography";

interface ToolGuideProps {
  content: ToolContent;
  /** A worked example, limits, and an explanation of how the tool works. */
  extras?: ToolExtras;
  /** Keeps the questions' ids unique on the page. */
  idPrefix: string;
  toolName: string;
}

/**
 * One side of the worked example: a small label above the text, kept exactly as written.
 */
function ExampleBlock({ label, text }: { label: string; text: string }): ReactNode {
  return (
    <Box sx={{ bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 0, p: 2 }}>
      <Typography color="text.secondary" sx={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: "0.88rem", lineHeight: 1.6, m: 0, mt: 1, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {text}
      </Box>
    </Box>
  );
}

/**
 * The words around a tool: how to use it, step by step, and answers to the questions people ask
 * about it. It is plain, visible text, so readers get help and search engines get real content.
 */
export function ToolGuide({ content, extras, idPrefix, toolName }: ToolGuideProps): ReactNode {
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

      {extras ? (
        <>
          <Box aria-labelledby="tool-example-heading" component="section">
            <Typography component="h2" id="tool-example-heading" variant="h4">
              An example
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {extras.example.title}
            </Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr", xs: "minmax(0, 1fr)" }, mt: 2 }}>
              <ExampleBlock label="You enter" text={extras.example.input} />
              <ExampleBlock label="You get" text={extras.example.output} />
            </Box>
          </Box>

          <Box aria-labelledby="tool-about-heading" component="section">
            <Typography component="h2" id="tool-about-heading" variant="h4">
              How the {toolName} works
            </Typography>
            <Typography sx={{ lineHeight: 1.7, mt: 2 }}>{extras.about}</Typography>
          </Box>

          <Box aria-labelledby="tool-limits-heading" component="section">
            <Typography component="h2" id="tool-limits-heading" variant="h4">
              Limits to know about
            </Typography>
            <Box component="ul" sx={{ display: "grid", gap: 1, m: 0, mt: 2, pl: 3 }}>
              {extras.limits.map((limit) => (
                <Typography component="li" key={limit} sx={{ lineHeight: 1.65 }}>
                  {limit}
                </Typography>
              ))}
            </Box>
          </Box>
        </>
      ) : null}

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
