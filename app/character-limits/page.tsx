import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { NextLink } from "@/components/ui/next-link";
import { homeCrumb, PageTitle } from "@/components/ui/page-title";
import { formatIsoDate } from "@/lib/format-iso-date";
import { breadcrumbJsonLd, buildPageMetadata, faqJsonLd, webPageJsonLd } from "@/lib/seo";
import {
  CHARACTER_LIMITS_CHECKED_ON,
  LIMIT_GROUPS,
  limitsInGroup,
  SOURCE_LABELS,
  type CharacterLimit,
} from "@/lib/tools/text/character-limits";

const PATH = "/character-limits";
const TITLE = "Character Limits: X, Instagram, LinkedIn, SMS";
const DESCRIPTION =
  "Every character limit in one place: X, Instagram, LinkedIn, YouTube, SMS, page titles, and meta descriptions, with how each is counted and where it comes from.";

const FAQ = [
  {
    answer:
      "Yes. X counts each emoji as 2 and every link as 23 characters, whatever its real length, so a post can reach 280 sooner than the visible text suggests.",
    question: "Do emoji count as more than one character on X?",
  },
  {
    answer:
      "Each segment of a longer message carries a small header so the phone can join the parts in order. That leaves 153 characters of text per segment in the standard character set, and 67 when the message uses Unicode.",
    question: "Why does a long SMS split at 153 characters?",
  },
  {
    answer:
      "Google says there is no limit, and shortens the snippet to fit the device. About 160 characters is a rule of thumb for what usually shows, and Google may choose different text from the page instead.",
    question: "Is there a character limit for a meta description?",
  },
  {
    answer:
      "Paste it into the Character Counter. It shows the count with and without spaces, and you can choose any limit from this page to see how much room is left.",
    question: "How do I count the characters in my own text?",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({ description: DESCRIPTION, path: PATH, title: TITLE });

/**
 * One row of a limits table: where it applies, the number, how it is counted, and the source.
 */
function LimitRow({ entry }: { entry: CharacterLimit }): ReactNode {
  return (
    <Box component="tr" sx={{ "& td, & th": { borderBottom: "1px solid", borderColor: "divider", p: 1.5, textAlign: "left", verticalAlign: "top" } }}>
      <Box component="th" scope="row" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
        {entry.label}
      </Box>
      <Box component="td" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, whiteSpace: "nowrap" }}>
        {entry.limit.toLocaleString("en-US")}
      </Box>
      <Box component="td" sx={{ lineHeight: 1.6 }}>
        {entry.note}
      </Box>
      <Box component="td" sx={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
        <strong>{SOURCE_LABELS[entry.source]}</strong>
        {entry.sourceUrl && entry.sourceName ? (
          <>
            <br />
            <a href={entry.sourceUrl} rel="noopener" target="_blank">
              {entry.sourceName}
            </a>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * Lists the character limits of the places people write most, with how each is counted and where
 * the figure comes from, and links to the Character Counter to check a text against them.
 */
export default function CharacterLimitsPage(): ReactNode {
  return (
    <PageFrame>
      <JsonLd
        data={[
          webPageJsonLd({
            dateModified: CHARACTER_LIMITS_CHECKED_ON,
            description: DESCRIPTION,
            name: "Character limits",
            path: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Character limits", path: PATH },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitle
            breadcrumbs={[{ ...homeCrumb }, { label: "Character limits" }]}
            description="How much you can write in a post, a title, a description, or a text message, with how each number is counted and where it comes from."
            title="Character limits"
          />

          <Typography sx={{ lineHeight: 1.7, maxWidth: 820 }}>
            Platforms change these numbers, and some never publish them, so each row says how well it is sourced.
            An official figure comes from the platform&apos;s own documentation. A widely reported figure is
            enforced by the app but not documented. A rule of thumb is a guide, because the platform sets no fixed
            limit. Last checked <time dateTime={CHARACTER_LIMITS_CHECKED_ON}>{formatIsoDate(CHARACTER_LIMITS_CHECKED_ON)}</time>.
          </Typography>

          {LIMIT_GROUPS.map((group) => (
            <Box aria-labelledby={`limits-${group.id}`} component="section" key={group.id}>
              <Typography component="h2" id={`limits-${group.id}`} variant="h4">
                {group.label}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {group.summary}
              </Typography>
              <Box sx={{ mt: 2, overflowX: "auto" }}>
                <Box component="table" sx={{ borderCollapse: "collapse", minWidth: 640, width: "100%" }}>
                  <Box component="caption" sx={{ border: 0, clip: "rect(0 0 0 0)", height: 1, overflow: "hidden", position: "absolute", width: 1 }}>
                    {group.label}: character limits
                  </Box>
                  <Box component="thead">
                    <Box component="tr" sx={{ "& th": { borderBottom: "2px solid", borderColor: "divider", fontSize: "0.85rem", p: 1.5, textAlign: "left" } }}>
                      <th scope="col">Where</th>
                      <th scope="col">Limit</th>
                      <th scope="col">How it is counted</th>
                      <th scope="col">Source</th>
                    </Box>
                  </Box>
                  <tbody>
                    {limitsInGroup(group.id).map((entry) => (
                      <LimitRow entry={entry} key={entry.id} />
                    ))}
                  </tbody>
                </Box>
              </Box>
            </Box>
          ))}

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
                Check your own text
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Paste it into the Character Counter and pick a limit to see how much room is left.
              </Typography>
            </Box>
            <Button component={NextLink} href="/tools/character-counter" variant="contained">
              Open the Character Counter
            </Button>
          </Stack>

          <Box aria-labelledby="limits-faq" component="section">
            <Typography component="h2" id="limits-faq" variant="h4">
              Questions about character limits
            </Typography>
            <Box sx={{ mt: 2.5, maxWidth: 860 }}>
              <FaqAccordion items={FAQ.map((entry, index) => ({ ...entry, id: `limits-${index + 1}` }))} />
            </Box>
          </Box>
        </Stack>
      </Container>
    </PageFrame>
  );
}
