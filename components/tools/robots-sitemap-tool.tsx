"use client";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { SelectField } from "@/components/tools/calculator-fields";
import { CodeOutput } from "@/components/tools/code-output";
import { IssueList } from "@/components/tools/issue-list";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { TextInput } from "@/components/tools/text-input";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { AI_SEARCH_CRAWLERS, AI_TRAINING_CRAWLERS, buildRobotsTxt, type RobotsInput } from "@/lib/tools/seo/robots";
import { buildSitemap, CHANGE_FREQUENCIES, type SitemapInput } from "@/lib/tools/seo/sitemap";

type Mode = "robots" | "sitemap";

const EMPTY_ROBOTS: RobotsInput = {
  allowPaths: "",
  blockAiSearch: false,
  blockAiTraining: false,
  blockEverything: false,
  crawlDelay: "",
  disallowPaths: "",
  sitemaps: "",
};

const EXAMPLE_ROBOTS: RobotsInput = {
  ...EMPTY_ROBOTS,
  allowPaths: "/admin/help/",
  blockAiTraining: true,
  disallowPaths: "/admin/\n/cart/\n/search",
  sitemaps: "https://www.example.com/sitemap.xml",
};

const EMPTY_SITEMAP: SitemapInput = { changeFrequency: "", lastModified: "", priority: "", urls: "" };

const EXAMPLE_SITEMAP: SitemapInput = {
  ...EMPTY_SITEMAP,
  lastModified: "2026-10-09",
  urls: "https://www.example.com/\nhttps://www.example.com/about\nhttps://www.example.com/blog/first-post",
};

const FREQUENCY_OPTIONS = [{ label: "No hint", value: "" }, ...CHANGE_FREQUENCIES.map((value) => ({ label: value, value }))];

/**
 * Builds a robots.txt file, or an XML sitemap from a list of addresses. Both are made as you
 * type, checked for common mistakes, and ready to copy or download.
 */
export function RobotsSitemapTool(): ReactNode {
  const [mode, setMode] = useState<Mode>("robots");
  const [robots, setRobots] = useState<RobotsInput>(EMPTY_ROBOTS);
  const [sitemap, setSitemap] = useState<SitemapInput>(EMPTY_SITEMAP);
  const robotsResult = buildRobotsTxt(robots);
  const sitemapResult = buildSitemap(sitemap);

  /**
   * Changes one robots.txt setting and leaves the rest as they were.
   */
  function updateRobots<Key extends keyof RobotsInput>(key: Key, value: RobotsInput[Key]): void {
    setRobots((current) => ({ ...current, [key]: value }));
  }

  /**
   * Changes one sitemap setting and leaves the rest as they were.
   */
  function updateSitemap<Key extends keyof SitemapInput>(key: Key, value: SitemapInput[Key]): void {
    setSitemap((current) => ({ ...current, [key]: value }));
  }

  return (
    <ToolWorkspace
      label="robots.txt and sitemap generator workspace"
      options={
        <ModeToggle
          label="What to make"
          onChange={setMode}
          options={[
            { icon: <SmartToyOutlinedIcon fontSize="small" />, label: "robots.txt", tooltip: "Tell crawlers which parts of your site to visit", value: "robots" },
            { icon: <AccountTreeOutlinedIcon fontSize="small" />, label: "XML sitemap", tooltip: "List the pages of your site for search engines", value: "sitemap" },
          ]}
          value={mode}
        />
      }
      secondaryActions={
        <>
          <Button
            color="inherit"
            onClick={() => (mode === "robots" ? setRobots(EXAMPLE_ROBOTS) : setSitemap(EXAMPLE_SITEMAP))}
            size="small"
            startIcon={<LightbulbOutlinedIcon />}
          >
            Load example
          </Button>
          <Button
            color="inherit"
            onClick={() => (mode === "robots" ? setRobots(EMPTY_ROBOTS) : setSitemap(EMPTY_SITEMAP))}
            size="small"
            startIcon={<DeleteOutlinedIcon />}
          >
            Clear
          </Button>
        </>
      }
    >
      {mode === "robots" ? (
        <Box sx={{ alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
          <Stack sx={{ gap: 2 }}>
            <OptionSwitch checked={robots.blockEverything} label="Keep every crawler out of the whole site" onChange={(value) => updateRobots("blockEverything", value)} tooltip="For a site that is not ready to be found. Search engines will not list it." />
            <TextInput helperText="One path on each line, such as /admin/. These are kept out of search." id="robots-disallow" label="Block these paths" multiline onChange={(value) => updateRobots("disallowPaths", value)} rows={4} value={robots.disallowPaths} />
            <TextInput helperText="Paths that stay open inside a blocked path." id="robots-allow" label="Allow these paths" multiline onChange={(value) => updateRobots("allowPaths", value)} rows={3} value={robots.allowPaths} />
            <TextInput helperText="One address on each line. Each starts with https://." id="robots-sitemaps" label="Sitemap addresses" multiline onChange={(value) => updateRobots("sitemaps", value)} rows={2} value={robots.sitemaps} />
            <Box sx={{ maxWidth: 220 }}>
              <TextInput id="robots-delay" label="Crawl delay in seconds" onChange={(value) => updateRobots("crawlDelay", value)} value={robots.crawlDelay} />
            </Box>
            <Stack>
              <OptionSwitch checked={robots.blockAiTraining} label="Block AI training crawlers" onChange={(value) => updateRobots("blockAiTraining", value)} tooltip={`Asks ${AI_TRAINING_CRAWLERS.map((crawler) => crawler.token).join(", ")} to stay away.`} />
              <OptionSwitch checked={robots.blockAiSearch} label="Block AI search crawlers" onChange={(value) => updateRobots("blockAiSearch", value)} tooltip={`Asks ${AI_SEARCH_CRAWLERS.map((crawler) => crawler.token).join(", ")} to stay away. Your pages will not appear in those assistants' answers.`} />
            </Stack>
          </Stack>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            <IssueList issues={robotsResult.issues} />
            <CodeOutput fileName="robots.txt" id="robots-output" label="robots.txt" placeholder="Your robots.txt appears here. Save it as robots.txt at the top of your site." value={robotsResult.text} />
          </Stack>
        </Box>
      ) : (
        <Box sx={{ alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
          <Stack sx={{ gap: 2 }}>
            <TextInput helperText="One full address on each line, all on the same site." id="sitemap-urls" label="Page addresses" maxLength={2_000_000} multiline onChange={(value) => updateSitemap("urls", value)} placeholder={"https://www.example.com/\nhttps://www.example.com/about"} rows={9} value={sitemap.urls} />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
              <TextInput helperText="YYYY-MM-DD, for every page." id="sitemap-lastmod" label="Last changed" onChange={(value) => updateSitemap("lastModified", value)} placeholder="2026-10-09" value={sitemap.lastModified} />
              <SelectField id="sitemap-frequency" label="Change frequency" onChange={(value) => updateSitemap("changeFrequency", value as SitemapInput["changeFrequency"])} options={FREQUENCY_OPTIONS} value={sitemap.changeFrequency} />
              <TextInput helperText="0 to 1." id="sitemap-priority" label="Priority" onChange={(value) => updateSitemap("priority", value)} placeholder="0.8" value={sitemap.priority} />
            </Box>
          </Stack>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            <IssueList issues={sitemapResult.issues} />
            <CodeOutput fileName="sitemap.xml" id="sitemap-output" label="sitemap.xml" mime="application/xml" placeholder="Your sitemap appears here." value={sitemapResult.xml} />
            {sitemapResult.count > 0 ? (
              <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
                {sitemapResult.count.toLocaleString("en-US")} {sitemapResult.count === 1 ? "address" : "addresses"} in this sitemap.
              </Typography>
            ) : null}
          </Stack>
        </Box>
      )}
    </ToolWorkspace>
  );
}
