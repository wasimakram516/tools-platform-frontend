"use client";

import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Collapse, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { revealDelay } from "@/lib/reveal-delay";
import { SURFACE_RADIUS, SURFACE_SHADOW } from "@/theme/surface";

export interface FaqAccordionItem {
  answer: string;
  /** Unique on the page. Used to link each question to its answer for assistive technology. */
  id: string;
  question: string;
}

interface FaqRowProps {
  index: number;
  isOpen: boolean;
  item: FaqAccordionItem;
  onToggle: (expanded: boolean) => void;
}

/**
 * One question that opens to its answer, numbered, and highlighted while open.
 */
function FaqRow({ index, isOpen, item, onToggle }: FaqRowProps): ReactNode {
  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={isOpen}
      onChange={(_event, expanded) => onToggle(expanded)}
      // MUI wraps the button in an h3 by default. The question is already an h3, so the wrapper
      // becomes a plain div and there is no heading inside a heading.
      slotProps={{ heading: { component: "div" }, transition: { timeout: 220 } }}
      sx={{
        "&::before": { display: "none" },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: isOpen ? "primary.main" : "divider",
        borderRadius: `${SURFACE_RADIUS} !important`,
        boxShadow: isOpen ? SURFACE_SHADOW : "none",
        overflow: "hidden",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <AccordionSummary
        aria-controls={`faq-${item.id}-content`}
        expandIcon={null}
        id={`faq-${item.id}-header`}
        sx={{
          alignItems: "center",
          gap: 2,
          px: 2.5,
          py: 1,
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 2, m: 0 },
        }}
      >
        <Typography
          aria-hidden="true"
          sx={{
            color: isOpen ? "primary.main" : "text.disabled",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.85rem",
            fontWeight: 700,
            minWidth: 24,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </Typography>
        <Typography component="h3" sx={{ flexGrow: 1, fontSize: "1.05rem", fontWeight: 650 }}>
          {item.question}
        </Typography>
        <Box
          aria-hidden="true"
          sx={{
            alignItems: "center",
            bgcolor: isOpen ? "primary.main" : "action.hover",
            borderRadius: "50%",
            color: isOpen ? "primary.contrastText" : "primary.main",
            display: "inline-flex",
            flexShrink: 0,
            height: 32,
            justifyContent: "center",
            transition: "background-color 200ms ease, color 200ms ease",
            width: 32,
          }}
        >
          {isOpen ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
        </Box>
      </AccordionSummary>
      <AccordionDetails id={`faq-${item.id}-content`} sx={{ pb: 2.75, pl: { xs: 2.5, sm: 8.5 }, pr: 2.5, pt: 0 }}>
        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
          {item.answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

interface FaqAccordionProps {
  items: readonly FaqAccordionItem[];
  /** How many questions show before "Show more". Leave out to show them all. */
  visibleCount?: number;
}

const MORE_QUESTIONS_ID_PREFIX = "faq-more-questions";

/**
 * A list of questions, shown the same way everywhere on the site. One answer is open at a time.
 * When there are more questions than `visibleCount`, the rest are folded away behind a "Show
 * more" button. Every answer stays in the page, so search engines read all of them.
 */
export function FaqAccordion({ items, visibleCount = items.length }: FaqAccordionProps): ReactNode {
  const [openId, setOpenId] = useState<string | false>(false);
  const [showAll, setShowAll] = useState(false);
  const firstItems = items.slice(0, visibleCount);
  const moreItems = items.slice(visibleCount);
  const moreId = `${MORE_QUESTIONS_ID_PREFIX}-${items[0]?.id ?? "list"}`;

  /**
   * Opens or closes one answer, keeping only one open at a time.
   */
  function handleToggle(id: string, expanded: boolean): void {
    setOpenId(expanded ? id : false);
  }

  /**
   * Shows or hides the extra questions, closing an answer that would be hidden with them.
   */
  function handleShowToggle(): void {
    if (showAll && moreItems.some((item) => item.id === openId)) {
      setOpenId(false);
    }

    setShowAll((current) => !current);
  }

  return (
    <Box>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {firstItems.map((item, index) => (
          <Reveal delay={revealDelay(index)} key={item.id}>
            <FaqRow index={index} isOpen={openId === item.id} item={item} onToggle={(expanded) => handleToggle(item.id, expanded)} />
          </Reveal>
        ))}
      </Box>

      {moreItems.length > 0 ? (
        <>
          <Collapse id={moreId} in={showAll} timeout={350}>
            <Box sx={{ display: "grid", gap: 1.5, pt: 1.5 }}>
              {moreItems.map((item, index) => (
                <FaqRow
                  index={visibleCount + index}
                  isOpen={openId === item.id}
                  item={item}
                  key={item.id}
                  onToggle={(expanded) => handleToggle(item.id, expanded)}
                />
              ))}
            </Box>
          </Collapse>
          <Button
            aria-controls={moreId}
            aria-expanded={showAll}
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={handleShowToggle}
            sx={{ mt: 1.5 }}
          >
            {showAll ? "Show less" : `Show more questions (${moreItems.length})`}
          </Button>
        </>
      ) : null}
    </Box>
  );
}
