import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { InlineLinks } from "@/components/legal/inline-links";
import { VISUALLY_HIDDEN_SX } from "@/components/ui/hidden-heading";
import type { GuideBlock, GuideSection } from "@/lib/guides/guide-types";
import { FONT_MONO } from "@/theme/typography";

const CELL_SX = { borderBottom: "1px solid", borderColor: "divider", lineHeight: 1.55, p: 1.25, textAlign: "left", verticalAlign: "top" } as const;

/**
 * A table from a guide, scrolling sideways on a narrow screen rather than squeezing its columns.
 */
function GuideTable({ block }: { block: Extract<GuideBlock, { kind: "table" }> }): ReactNode {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box component="table" sx={{ borderCollapse: "collapse", minWidth: 560, width: "100%" }}>
        <Box component="caption" sx={VISUALLY_HIDDEN_SX}>
          {block.caption}
        </Box>
        <thead>
          <Box component="tr" sx={{ "& th": { ...CELL_SX, borderBottomWidth: 2, fontSize: "0.85rem" } }}>
            {block.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </Box>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <Box component="tr" key={row.join("|")} sx={{ "& td, & th": CELL_SX }}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <Box component="th" key={index} scope="row" sx={{ fontFamily: FONT_MONO, fontSize: "0.9rem", fontWeight: 700 }}>
                    {cell}
                  </Box>
                ) : (
                  <td key={index}>{cell}</td>
                ),
              )}
            </Box>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

/**
 * Renders one block of a guide: a paragraph, a list, a code sample, or a table.
 */
function GuideBlockView({ block }: { block: GuideBlock }): ReactNode {
  switch (block.kind) {
    case "paragraph":
      return (
        <Typography sx={{ lineHeight: 1.75 }}>
          <InlineLinks text={block.text} />
        </Typography>
      );
    case "list":
      return (
        <Box component="ul" sx={{ display: "grid", gap: 1, lineHeight: 1.7, m: 0, pl: 3 }}>
          {block.items.map((item) => (
            <li key={item}>
              <InlineLinks text={item} />
            </li>
          ))}
        </Box>
      );
    case "code":
      return (
        <Box component="figure" sx={{ m: 0 }}>
          <Typography component="figcaption" sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 700, mb: 0.75 }}>
            {block.label}
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              fontFamily: FONT_MONO,
              fontSize: "0.88rem",
              lineHeight: 1.6,
              m: 0,
              overflowX: "auto",
              p: 2,
            }}
          >
            <code>{block.text}</code>
          </Box>
        </Box>
      );
    case "table":
      return <GuideTable block={block} />;
  }
}

/**
 * Renders a guide's sections, each with an h2 and its blocks in order.
 */
export function GuideBody({ sections }: { sections: readonly GuideSection[] }): ReactNode {
  return (
    <>
      {sections.map((section) => (
        <Box aria-labelledby={`guide-${section.id}`} component="section" key={section.id}>
          <Typography component="h2" id={`guide-${section.id}`} variant="h4">
            {section.heading}
          </Typography>
          <Stack sx={{ gap: 2, mt: 2 }}>
            {section.blocks.map((block, index) => (
              <GuideBlockView block={block} key={`${section.id}-${index}`} />
            ))}
          </Stack>
        </Box>
      ))}
    </>
  );
}
