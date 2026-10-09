"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CodeOutput } from "@/components/tools/code-output";
import { SelectField } from "@/components/tools/calculator-fields";
import { IssueList } from "@/components/tools/issue-list";
import { OptionSwitch } from "@/components/tools/option-switch";
import { TextInput } from "@/components/tools/text-input";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  buildMetaTags,
  DESCRIPTION_SHOWN_CHARACTERS,
  displayUrl,
  TITLE_SHOWN_CHARACTERS,
  truncateAtWord,
  type MetaTagInput,
} from "@/lib/tools/seo/meta-tags";
import { SURFACE_RADIUS } from "@/theme/surface";

const EMPTY: MetaTagInput = {
  description: "",
  followLinks: true,
  imageAlt: "",
  imageUrl: "",
  indexable: true,
  locale: "en_US",
  ogType: "website",
  siteName: "",
  themeColor: "",
  title: "",
  twitterCard: "summary_large_image",
  twitterHandle: "",
  url: "",
};

const EXAMPLE: MetaTagInput = {
  ...EMPTY,
  description: "Free online tools for everyday tasks. Compress images, convert data, count words, and more, with every tool running in your browser.",
  imageAlt: "The QuicklySorted logo on a green background",
  imageUrl: "https://www.example.com/images/share.png",
  siteName: "Example Tools",
  themeColor: "#1F7A5A",
  title: "Example Tools: free online tools for everyday tasks",
  twitterHandle: "@exampletools",
  url: "https://www.example.com/",
};

const OG_TYPE_OPTIONS = [
  { label: "Website or page", value: "website" },
  { label: "Article or blog post", value: "article" },
];

const CARD_OPTIONS = [
  { label: "Large image", value: "summary_large_image" },
  { label: "Small image", value: "summary" },
];

/**
 * Shows how many characters a field holds against the length search results show.
 */
function countHint(value: string, shown: number): string {
  const length = value.trim().length;

  return `${length} of about ${shown} characters shown in search results.`;
}

/**
 * Builds the meta tags for the head of a page, with a live preview of the search result and the
 * shared link card, and advice on length and format.
 */
export function MetaTagTool(): ReactNode {
  const [input, setInput] = useState<MetaTagInput>(EMPTY);
  const { html, issues } = buildMetaTags(input);
  const previewTitle = input.title.trim() === "" ? "Your page title appears here" : truncateAtWord(input.title, TITLE_SHOWN_CHARACTERS);
  const previewDescription = input.description.trim() === "" ? "Your description appears here, under the title." : truncateAtWord(input.description, DESCRIPTION_SHOWN_CHARACTERS);
  const address = input.url.trim() === "" ? "www.example.com › page" : displayUrl(input.url.trim());

  /**
   * Changes one field and leaves the rest as they were.
   */
  function update<Key extends keyof MetaTagInput>(key: Key, value: MetaTagInput[Key]): void {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <ToolWorkspace
      label="Meta tag generator workspace"
      secondaryActions={
        <>
          <Button color="inherit" onClick={() => setInput(EXAMPLE)} size="small" startIcon={<LightbulbOutlinedIcon />}>
            Load example
          </Button>
          <Button color="inherit" onClick={() => setInput(EMPTY)} size="small" startIcon={<DeleteOutlinedIcon />}>
            Clear
          </Button>
        </>
      }
    >
      <Box sx={{ alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 5fr) minmax(0, 6fr)" } }}>
        <Stack sx={{ gap: 2 }}>
          <TextInput helperText={countHint(input.title, TITLE_SHOWN_CHARACTERS)} id="meta-title" label="Page title" maxLength={200} onChange={(value) => update("title", value)} value={input.title} />
          <TextInput helperText={countHint(input.description, DESCRIPTION_SHOWN_CHARACTERS)} id="meta-description" label="Description" maxLength={500} multiline onChange={(value) => update("description", value)} value={input.description} />
          <TextInput helperText="The full address of this page. It is also the canonical link." id="meta-url" label="Page address" onChange={(value) => update("url", value)} placeholder="https://www.example.com/page" value={input.url} />
          <TextInput id="meta-site-name" label="Site name" onChange={(value) => update("siteName", value)} value={input.siteName} />
          <TextInput helperText="A full address. 1200 by 630 pixels works well." id="meta-image" label="Share image address" onChange={(value) => update("imageUrl", value)} placeholder="https://www.example.com/share.png" value={input.imageUrl} />
          <TextInput id="meta-image-alt" label="Image description" onChange={(value) => update("imageAlt", value)} value={input.imageAlt} />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
            <SelectField id="meta-og-type" label="Page type" onChange={(value) => update("ogType", value as MetaTagInput["ogType"])} options={OG_TYPE_OPTIONS} value={input.ogType} />
            <SelectField id="meta-card" label="Card on X" onChange={(value) => update("twitterCard", value as MetaTagInput["twitterCard"])} options={CARD_OPTIONS} value={input.twitterCard} />
            <TextInput id="meta-handle" label="X handle" onChange={(value) => update("twitterHandle", value)} placeholder="@example" value={input.twitterHandle} />
            <TextInput id="meta-locale" label="Locale" onChange={(value) => update("locale", value)} placeholder="en_US" value={input.locale} />
            <TextInput helperText="A hex colour for the browser bar on phones." id="meta-theme" label="Theme colour" onChange={(value) => update("themeColor", value)} placeholder="#1F7A5A" value={input.themeColor} />
          </Box>
          <Stack>
            <OptionSwitch checked={input.indexable} label="Let search engines show this page" onChange={(value) => update("indexable", value)} tooltip="Turn off to ask search engines to keep this page out of results (noindex)." />
            <OptionSwitch checked={input.followLinks} label="Let search engines follow its links" onChange={(value) => update("followLinks", value)} tooltip="Turn off to ask search engines not to follow the links on this page (nofollow)." />
          </Stack>
        </Stack>

        <Stack sx={{ gap: 2.5, minWidth: 0 }}>
          <IssueList issues={issues} />

          <Box aria-label="Search result preview" component="section">
            <Typography component="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1 }}>
              How it may look in search
            </Typography>
            <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 2 }}>
              <Typography color="text.secondary" sx={{ fontSize: "0.82rem", overflowWrap: "anywhere" }}>
                {input.siteName.trim() === "" ? "Your site" : input.siteName.trim()} · {address}
              </Typography>
              <Typography component="p" sx={{ color: "primary.main", fontSize: "1.2rem", lineHeight: 1.3, mt: 0.5, overflowWrap: "anywhere" }}>
                {previewTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "0.9rem", lineHeight: 1.5, mt: 0.5, overflowWrap: "anywhere" }}>
                {previewDescription}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: "0.78rem", mt: 0.75 }}>
              An approximation. Search engines decide the final title and description, and cut them by width, not by character count.
            </Typography>
          </Box>

          <Box aria-label="Shared link preview" component="section">
            <Typography component="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1 }}>
              How a shared link may look
            </Typography>
            <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, overflow: "hidden" }}>
              <Box
                sx={{
                  alignItems: "center",
                  bgcolor: "action.hover",
                  color: "text.secondary",
                  aspectRatio: "1.91 / 1",
                  display: input.twitterCard === "summary" ? "none" : "flex",
                  fontSize: "0.82rem",
                  justifyContent: "center",
                  p: 2,
                  textAlign: "center",
                }}
              >
                {input.imageUrl.trim() === "" ? "No image yet" : `Image: ${input.imageUrl.trim()}`}
              </Box>
              <Box sx={{ p: 1.75 }}>
                <Typography color="text.secondary" sx={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                  {input.url.trim() === "" ? "example.com" : displayUrl(input.url.trim()).split(" › ")[0]}
                </Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.25, overflowWrap: "anywhere" }}>{previewTitle}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.88rem", mt: 0.25, overflowWrap: "anywhere" }}>
                  {previewDescription}
                </Typography>
              </Box>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: "0.78rem", mt: 0.75 }}>
              The picture itself is not loaded here, because this site never fetches anything from other websites. Its address is checked and used in the tags below.
            </Typography>
          </Box>

          <CodeOutput id="meta-output" label="HTML tags" placeholder="The tags appear here. Paste them inside the head of your page." value={html} />
        </Stack>
      </Box>
    </ToolWorkspace>
  );
}
