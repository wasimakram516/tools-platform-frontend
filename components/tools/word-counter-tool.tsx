"use client";

import { Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { OptionSwitch } from "@/components/tools/option-switch";
import { RankedCountTable } from "@/components/tools/ranked-count-table";
import { StatGrid } from "@/components/tools/stat-grid";
import { TextAnalysisTool } from "@/components/tools/text-analysis-tool";
import type { TextStats } from "@/lib/tools/text/text-stats";
import { analyzeWords, formatSeconds } from "@/lib/tools/text/word-insights";

/**
 * Counts the words in text as you type, and goes deeper: the most used words, average lengths,
 * the longest words, and estimated reading and speaking time.
 */
export function WordCounterTool(): ReactNode {
  const [ignoreCommonWords, setIgnoreCommonWords] = useState(false);

  /**
   * Draws the counts, the timing and length insights, and the keyword table.
   */
  function renderResults(stats: TextStats, text: string): ReactNode {
    const insights = analyzeWords(text, stats, { ignoreCommonWords });

    return (
      <>
        <StatGrid
          stats={[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.characters },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Lines", value: stats.lines },
          ]}
        />
        <StatGrid
          featureFirst={false}
          stats={[
            { label: "Reading time (estimate)", value: formatSeconds(insights.readingSeconds) },
            { label: "Speaking time (estimate)", value: formatSeconds(insights.speakingSeconds) },
            { label: "Average word length", value: `${insights.averageWordLength} letters` },
            { label: "Average sentence length", value: `${insights.averageSentenceLength} words` },
          ]}
        />
        {insights.longestWords.length > 0 ? (
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Longest words: {insights.longestWords.join(", ")}
          </Typography>
        ) : null}
        <RankedCountTable
          emptyMessage="The most used words appear here once you add text."
          labelHeading="Word"
          rows={insights.keywords.map((keyword) => ({
            count: keyword.count,
            label: keyword.word,
            percent: keyword.percent,
          }))}
          title="Most used words"
        />
      </>
    );
  }

  return (
    <TextAnalysisTool
      idPrefix="word-counter"
      inputLabel="Your text"
      inputPlaceholder="Type or paste your text to count its words."
      options={
        <OptionSwitch
          checked={ignoreCommonWords}
          label="Ignore common words in the keyword table"
          onChange={setIgnoreCommonWords}
          tooltip="Leave out words such as the, and, of, and to"
        />
      }
      renderResults={renderResults}
      statusMessage="Words are groups of text separated by spaces. Sentences are estimated from . ! and ? endings. Times assume about 238 words a minute reading and 130 speaking."
      workspaceLabel="Word counter workspace"
    />
  );
}
