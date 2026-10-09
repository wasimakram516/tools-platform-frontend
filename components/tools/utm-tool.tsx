"use client";

import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LinkIcon from "@mui/icons-material/Link";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { SelectField } from "@/components/tools/calculator-fields";
import { ToolbarSelect } from "@/components/tools/converter-options";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { IssueList } from "@/components/tools/issue-list";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { TextInput } from "@/components/tools/text-input";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { buildUtmUrl, parseUrl, UTM_PRESETS, type SpaceStyle, type UtmInput, type UtmOptions } from "@/lib/tools/seo/utm";
import { SURFACE_RADIUS } from "@/theme/surface";

type Mode = "build" | "parse";

const EMPTY: UtmInput = { campaign: "", content: "", id: "", medium: "", source: "", term: "", url: "" };
const EXAMPLE: UtmInput = {
  campaign: "Spring Sale",
  content: "header banner",
  id: "",
  medium: "email",
  source: "newsletter",
  term: "",
  url: "www.example.com/offers?ref=home",
};
const EXAMPLE_PARSE = "https://www.example.com/offers/spring?ref=home&utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale#reviews";

const PRESET_OPTIONS = [
  { label: "Choose a source and medium", value: "" },
  ...UTM_PRESETS.map((preset) => ({ label: preset.label, value: preset.label })),
];

const SPACE_OPTIONS: readonly { label: string; value: SpaceStyle }[] = [
  { label: "Spaces to dashes", value: "dash" },
  { label: "Spaces to underscores", value: "underscore" },
  { label: "Keep spaces", value: "keep" },
];

/**
 * Builds a link with campaign tags (UTM) for tracking in analytics, with advice on the common
 * mistakes, or takes any link apart into its site, path, and query.
 */
export function UtmTool(): ReactNode {
  const [mode, setMode] = useState<Mode>("build");
  const [input, setInput] = useState<UtmInput>(EMPTY);
  const [options, setOptions] = useState<UtmOptions>({ lowercase: true, spaces: "dash" });
  const [parseText, setParseText] = useState("");
  const [status, setStatus] = useState("");
  const built = buildUtmUrl(input, options);
  const parsed = parseText.trim() === "" ? null : parseUrl(parseText);
  const hasStarted = Object.values(input).some((value) => value.trim() !== "");

  /**
   * Changes one field and leaves the rest as they were.
   */
  function update<Key extends keyof UtmInput>(key: Key, value: string): void {
    setInput((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  /**
   * Fills the source and the medium from a common pair.
   */
  function applyPreset(label: string): void {
    const preset = UTM_PRESETS.find((entry) => entry.label === label);

    if (preset) {
      setInput((current) => ({ ...current, medium: preset.medium, source: preset.source }));
    }
  }

  /**
   * Copies the link and says so.
   */
  async function copyLink(value: string): Promise<void> {
    setStatus((await copyToClipboard(value)) ? "Link copied." : copyBlockedMessage("link"));
  }

  return (
    <ToolWorkspace
      label="UTM link builder workspace"
      options={
        <>
          <ModeToggle
            label="What to do"
            onChange={(next: Mode) => {
              setMode(next);
              setStatus("");
            }}
            options={[
              { icon: <LinkIcon fontSize="small" />, label: "Build a link", tooltip: "Add campaign tags to a link", value: "build" },
              { icon: <CallSplitIcon fontSize="small" />, label: "Take a link apart", tooltip: "See the parts of any link", value: "parse" },
            ]}
            value={mode}
          />
          {mode === "build" ? (
            <>
              <OptionSwitch checked={options.lowercase} label="Lower case" onChange={(lowercase) => setOptions((current) => ({ ...current, lowercase }))} tooltip="Write every value in lower case, so Email and email do not split in reports." />
              <ToolbarSelect id="utm-spaces" label="Spaces" onChange={(spaces: SpaceStyle) => setOptions((current) => ({ ...current, spaces }))} options={SPACE_OPTIONS} value={options.spaces} />
            </>
          ) : null}
        </>
      }
      secondaryActions={
        <>
          <Button
            color="inherit"
            onClick={() => (mode === "build" ? setInput(EXAMPLE) : setParseText(EXAMPLE_PARSE))}
            size="small"
            startIcon={<LightbulbOutlinedIcon />}
          >
            Load example
          </Button>
          <Button
            color="inherit"
            onClick={() => (mode === "build" ? setInput(EMPTY) : setParseText(""))}
            size="small"
            startIcon={<DeleteOutlinedIcon />}
          >
            Clear
          </Button>
        </>
      }
    >
      {mode === "build" ? (
        <Box sx={{ alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
          <Stack sx={{ gap: 2 }}>
            <TextInput helperText="The page the link opens. You can leave out https://." id="utm-url" label="Website address" onChange={(value) => update("url", value)} placeholder="www.example.com/offer" value={input.url} />
            <SelectField id="utm-preset" label="Quick start" onChange={applyPreset} options={PRESET_OPTIONS} value="" />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
              <TextInput helperText="Where the visit comes from, such as newsletter." id="utm-source" label="Source" onChange={(value) => update("source", value)} value={input.source} />
              <TextInput helperText="The kind of link, such as email or social." id="utm-medium" label="Medium" onChange={(value) => update("medium", value)} value={input.medium} />
              <TextInput helperText="The name of your campaign or offer." id="utm-campaign" label="Campaign" onChange={(value) => update("campaign", value)} value={input.campaign} />
              <TextInput helperText="Optional. An id to tie to your records." id="utm-id" label="Campaign id" onChange={(value) => update("id", value)} value={input.id} />
              <TextInput helperText="Optional. A paid search keyword." id="utm-term" label="Term" onChange={(value) => update("term", value)} value={input.term} />
              <TextInput helperText="Optional. Tells links in one campaign apart." id="utm-content" label="Content" onChange={(value) => update("content", value)} value={input.content} />
            </Box>
          </Stack>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            {hasStarted ? <IssueList issues={built.issues} /> : <Alert severity="info" variant="outlined">Fill in the address, a source, a medium, and a campaign to build the link.</Alert>}
            {built.url ? <CopyableValueRow id="utm-link" onCopy={() => void copyLink(built.url)} title="Campaign link" value={built.url} /> : null}
          </Stack>
        </Box>
      ) : (
        <Stack sx={{ gap: 2 }}>
          <TextInput helperText="Paste any link. Nothing is opened or sent anywhere." id="utm-parse" label="Link to take apart" maxLength={4000} onChange={setParseText} placeholder="https://www.example.com/page?a=1#top" value={parseText} />
          {parsed && !parsed.ok ? <Alert severity="error">{parsed.message}</Alert> : null}
          {parsed?.ok ? (
            <>
              <IssueList issues={parsed.issues} />
              <Box component="dl" sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "max-content 1fr" }, m: 0 }}>
                {[
                  ["Scheme", parsed.parts.protocol],
                  ["Site", parsed.parts.host],
                  ["Port", parsed.parts.port || "default"],
                  ["Path", parsed.parts.path],
                  ["After the #", parsed.parts.hash || "none"],
                ].map(([label, value]) => (
                  <Box component="div" key={label} sx={{ display: "contents" }}>
                    <Typography color="text.secondary" component="dt" sx={{ fontSize: "0.9rem" }}>
                      {label}
                    </Typography>
                    <Typography component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, overflow: "hidden" }}>
                <Typography component="h3" sx={{ bgcolor: "action.hover", fontSize: "0.95rem", fontWeight: 700, px: 2, py: 1.25 }}>
                  Query ({parsed.parts.query.length})
                </Typography>
                {parsed.parts.query.length === 0 ? (
                  <Typography color="text.secondary" sx={{ px: 2, py: 1.5 }}>
                    This link has no query.
                  </Typography>
                ) : (
                  <Box component="table" sx={{ borderCollapse: "collapse", width: "100%" }}>
                    <Box component="tbody">
                      {parsed.parts.query.map((pair, index) => (
                        <Box component="tr" key={`${pair.key}-${index}`} sx={{ "&:not(:last-child) td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                          <Box component="td" sx={{ fontWeight: pair.key.toLowerCase().startsWith("utm_") ? 700 : 500, overflowWrap: "anywhere", px: 2, py: 1, width: "40%" }}>
                            {pair.key}
                          </Box>
                          <Box component="td" sx={{ overflowWrap: "anywhere", px: 2, py: 1 }}>
                            {pair.value || <Typography color="text.secondary" component="span">empty</Typography>}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : null}
        </Stack>
      )}
      <ToolFooter message={status || (mode === "build" ? "The link is built as you type, in your browser." : "Paste a link to see its parts.")} />
    </ToolWorkspace>
  );
}
