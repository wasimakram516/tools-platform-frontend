"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import { alpha, Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { hintFor } from "@/components/ui/field-hint";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { OptionSwitch } from "@/components/tools/option-switch";
import { TextEditorPanel } from "@/components/tools/text-editor-panel";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import {
  buildHighlightSegments,
  MAX_REGEX_MATCHES,
  MAX_REGEX_PATTERN_CHARACTERS,
  MAX_REGEX_REPLACEMENT_CHARACTERS,
  MAX_REGEX_TEXT_CHARACTERS,
  normalizeFlags,
  type RegexFlag,
  type RegexMatch,
  type RegexResult,
  type RegexSuccess,
} from "@/lib/tools/regex-tester";
import { runRegexInWorker, type RegexRunner } from "@/lib/tools/regex-tester-worker";
import { SURFACE_RADIUS } from "@/theme/surface";
import { FONT_MONO } from "@/theme/typography";

interface RegexTesterToolProps {
  run?: RegexRunner;
}

const RUN_DELAY_MILLISECONDS = 200;

const IDLE_MESSAGE = "Type a pattern and some text to see the matches. Nothing leaves this device.";

const FLAG_OPTIONS: readonly { flag: RegexFlag; label: string; tooltip: string }[] = [
  { flag: "g", label: "Global (g)", tooltip: "Find every match, not just the first." },
  { flag: "i", label: "Ignore case (i)", tooltip: "Treat upper and lower case letters as the same." },
  { flag: "m", label: "Multiline (m)", tooltip: "Let ^ and $ match at the start and end of each line." },
  { flag: "s", label: "Dot matches newline (s)", tooltip: "Let . match line breaks too." },
  { flag: "u", label: "Unicode (u)", tooltip: "Treat the pattern and text as Unicode, so emoji and other symbols count as one character." },
];

const EXAMPLE = {
  pattern: "(?<user>[\\w.]+)@(?<domain>[\\w-]+\\.[a-z]{2,})",
  replacement: "$<user> at $<domain>",
  text: "Write to ada@example.com or grace.hopper@navy.mil for help.\nNot an address: sales@localhost",
};

/**
 * Describes how many matches were found, for the status line.
 */
function describeMatchCount(result: RegexSuccess): string {
  if (result.matches.length === 0) {
    return "No matches.";
  }

  const count = result.matches.length === 1 ? "1 match" : `${result.matches.length} matches`;

  return result.truncated ? `First ${count} shown. Narrow the pattern to see the rest.` : `${count} found.`;
}

/**
 * Writes one group's value, or says that it did not take part in the match.
 */
function describeGroup(value: string | null): string {
  return value === null ? "did not take part" : JSON.stringify(value);
}

/**
 * Lists the numbered and named groups of one match as small labelled values.
 */
function GroupList({ match }: { match: RegexMatch }): ReactNode {
  const lines = [
    ...match.groups.map((group, position) => `Group ${position + 1}: ${describeGroup(group)}`),
    ...Object.entries(match.namedGroups).map(([name, group]) => `Named group ${name}: ${describeGroup(group)}`),
  ];

  if (lines.length === 0) {
    return null;
  }

  return (
    <Stack component="ul" sx={{ gap: 0.25, listStyle: "none", m: 0, mt: 0.75, p: 0 }}>
      {lines.map((line) => (
        <Typography
          component="li"
          key={line}
          sx={{ color: "text.secondary", fontFamily: FONT_MONO, fontSize: "0.8rem", overflowWrap: "anywhere" }}
        >
          {line}
        </Typography>
      ))}
    </Stack>
  );
}

/**
 * Tests a regular expression against sample text as you type: it highlights the matches, lists
 * each one with its position and groups, and can preview a replacement. The pattern runs in a
 * worker that is stopped if it takes too long.
 */
export function RegexTesterTool({ run = runRegexInWorker }: RegexTesterToolProps = {}): ReactNode {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const [replacement, setReplacement] = useState("");
  const [result, setResult] = useState<RegexResult | null>(null);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!pattern) {
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(() => {
      run({ flags, pattern, replacement, text })
        .then((outcome) => {
          if (isCurrent) {
            setResult(outcome);
            setWorkerError(null);
            setStatusMessage("");
          }
        })
        .catch((error: unknown) => {
          if (isCurrent) {
            setWorkerError(error instanceof Error ? error.message : "The pattern could not be tested.");
          }
        });
    }, RUN_DELAY_MILLISECONDS);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [pattern, flags, text, replacement, run]);

  const shown = pattern ? result : null;
  const success = shown?.ok ? shown : null;
  const failureMessage = workerError ?? (shown && !shown.ok ? shown.message : null);
  const segments = success ? buildHighlightSegments(text, success.matches) : [];

  /**
   * Turns one flag on or off, keeping the flags in standard order.
   */
  function handleFlagChange(flag: RegexFlag, enabled: boolean): void {
    setFlags((current) => normalizeFlags(enabled ? `${current}${flag}` : current.replace(flag, "")));
  }

  /**
   * Fills the pattern, text, and replacement with a worked example.
   */
  function handleLoadExample(): void {
    setPattern(EXAMPLE.pattern);
    setText(EXAMPLE.text);
    setReplacement(EXAMPLE.replacement);
    setFlags("g");
    setStatusMessage("Example loaded.");
  }

  /**
   * Clears every field and the results.
   */
  function handleClear(): void {
    setPattern("");
    setText("");
    setReplacement("");
    setFlags("g");
    setResult(null);
    setWorkerError(null);
    setStatusMessage("Cleared.");
  }

  /**
   * Copies the matched text, one match per line.
   */
  async function handleCopyMatches(): Promise<void> {
    if (!success || success.matches.length === 0) {
      return;
    }

    if (await copyToClipboard(success.matches.map((match) => match.value).join("\n"))) {
      setStatusMessage("Matches copied.");
    } else {
      setWorkerError(copyBlockedMessage("matches", true));
    }
  }

  /**
   * Copies the text with the replacement applied.
   */
  async function handleCopyReplaced(): Promise<void> {
    if (!success || success.replaced === null) {
      return;
    }

    if (await copyToClipboard(success.replaced)) {
      setStatusMessage("Replaced text copied.");
    } else {
      setWorkerError(copyBlockedMessage("replaced text"));
    }
  }

  return (
    <ToolWorkspace
      label="Regular expression tester workspace"
      options={
        <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", columnGap: 2, rowGap: 0.5 }}>
          {FLAG_OPTIONS.map((option) => (
            <OptionSwitch
              checked={flags.includes(option.flag)}
              key={option.flag}
              label={option.label}
              onChange={(enabled) => handleFlagChange(option.flag, enabled)}
              tooltip={option.tooltip}
            />
          ))}
        </Stack>
      }
      secondaryActions={
        <>
          <Button color="inherit" onClick={handleLoadExample} size="small" startIcon={<ScienceOutlinedIcon />}>
            Load example
          </Button>
          <Button color="inherit" onClick={handleClear} size="small" startIcon={<DeleteOutlinedIcon />}>
            Clear
          </Button>
        </>
      }
    >
      {failureMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {failureMessage}
        </Alert>
      ) : null}
      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <Stack sx={{ gap: 2.5 }}>
          <TextField
            autoComplete="off"
            fullWidth
            helperText={hintFor("The pattern only, without the slashes or flags. Switch flags on in the bar above.")}
            id="regex-pattern"
            label="Pattern"
            onChange={(event) => setPattern(event.target.value)}
            placeholder="For example \d+ or (?<word>\w+)"
            slotProps={{
              htmlInput: { maxLength: MAX_REGEX_PATTERN_CHARACTERS, spellCheck: false, style: { fontFamily: FONT_MONO } },
              inputLabel: { shrink: true },
            }}
            value={pattern}
          />
          <TextEditorPanel
            characterLimit={MAX_REGEX_TEXT_CHARACTERS}
            id="regex-text"
            label="Text to test"
            onChange={(event) => setText(event.target.value)}
            placeholder="Type or paste the text to search."
            value={text}
          />
          <TextField
            autoComplete="off"
            fullWidth
            helperText={hintFor("Optional. Use $1 for a group, $<name> for a named group, or $& for the whole match.")}
            id="regex-replacement"
            label="Replace with (optional)"
            onChange={(event) => setReplacement(event.target.value)}
            placeholder="Leave empty to only find matches"
            slotProps={{
              htmlInput: { maxLength: MAX_REGEX_REPLACEMENT_CHARACTERS, spellCheck: false },
              inputLabel: { shrink: true },
            }}
            value={replacement}
          />
        </Stack>
        <Stack aria-label="Results" role="group" sx={{ gap: 2 }}>
          {success ? (
            <>
              <Box>
                <Typography component="h3" sx={{ fontSize: "0.92rem", fontWeight: 700, mb: 1 }}>
                  Matches in your text
                </Typography>
                <Box
                  data-testid="regex-highlight"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: SURFACE_RADIUS,
                    fontFamily: FONT_MONO,
                    fontSize: "0.85rem",
                    maxHeight: 280,
                    overflow: "auto",
                    overflowWrap: "anywhere",
                    p: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {segments.map((segment, position) =>
                    segment.matchIndex === null ? (
                      <span key={position}>{segment.text}</span>
                    ) : (
                      <Box
                        component="mark"
                        key={position}
                        sx={(theme) => ({
                          bgcolor: alpha(theme.palette.primary.main, 0.28),
                          borderRadius: "3px",
                          color: "inherit",
                          px: 0.25,
                        })}
                      >
                        {segment.text}
                      </Box>
                    ),
                  )}
                </Box>
              </Box>
              {success.matches.length > 0 ? (
                <Box>
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography component="h3" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                      Match list
                    </Typography>
                    <Button onClick={() => void handleCopyMatches()} size="small" startIcon={<ContentCopyIcon />}>
                      Copy matches
                    </Button>
                  </Stack>
                  <Stack
                    component="ol"
                    sx={{ gap: 1, listStyle: "none", m: 0, maxHeight: 360, overflow: "auto", p: 0 }}
                  >
                    {success.matches.map((match, position) => (
                      <Box
                        component="li"
                        data-testid={`regex-match-${position + 1}`}
                        key={position}
                        sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 1.5 }}
                      >
                        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                          Match {position + 1} at position {match.index}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT_MONO, fontSize: "0.85rem", overflowWrap: "anywhere" }}>
                          {match.value === "" ? "(empty match)" : match.value}
                        </Typography>
                        <GroupList match={match} />
                      </Box>
                    ))}
                  </Stack>
                  {success.truncated ? (
                    <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", mt: 1 }}>
                      Only the first {MAX_REGEX_MATCHES.toLocaleString("en-US")} matches are listed.
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
              {success.replaced !== null ? (
                <CopyableValueRow
                  id="replaced"
                  onCopy={() => void handleCopyReplaced()}
                  title="Text with the replacement"
                  value={success.replaced}
                />
              ) : null}
            </>
          ) : failureMessage ? null : (
            <Typography
              color="text.secondary"
              sx={{ border: "1px dashed", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 3 }}
            >
              The matches appear here as you type.
            </Typography>
          )}
        </Stack>
      </Box>
      <ToolFooter message={statusMessage || (success ? describeMatchCount(success) : IDLE_MESSAGE)} />
    </ToolWorkspace>
  );
}
