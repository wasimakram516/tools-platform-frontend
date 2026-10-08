import { COMPANY_NAME } from "@/lib/site-config";
import type { FaqEntry } from "@/lib/seo";
import { MAX_BATCH_FILES, MAX_IMAGE_FILE_BYTES } from "@/lib/tools/image/format";
import { MAX_TEXT_TOOL_CHARACTERS } from "@/lib/tools/text/text-stats";

/**
 * The words on the home page that explain what the site is, who it is for, and why to use it,
 * and the frequently asked questions. They live here, as data, so the page and the search engine
 * structured data are always built from the same text. Numbers come from the real limits in the
 * code, so the answers cannot drift out of date.
 */

export interface UseCaseLink {
  /** What the visitor wants to do, worded the way people search for it. */
  label: string;
  /** The tool's slug in the registry. A test checks that every slug is a live tool. */
  slug: string;
}

export interface UseCaseGroup {
  /** Which icon the page draws for this group. */
  icon: "developers" | "writers" | "owners" | "everyone";
  id: string;
  links: readonly UseCaseLink[];
  title: string;
}

export interface ReasonEntry {
  description: string;
  icon: "free" | "browser" | "clear" | "consistent";
  id: string;
  title: string;
}

export const ABOUT_HEADING = "What is QuicklySorted?";

export const ABOUT_PARAGRAPHS: readonly string[] = [
  "Free tools for the small jobs that come up every day. Each one does a single job well, opens in one click, and needs no account.",
];

export const USE_CASES_HEADING = "What people use it for";

export const USE_CASES: readonly UseCaseGroup[] = [
  {
    icon: "developers",
    id: "developers",
    links: [
      { label: "Format JSON", slug: "json-formatter" },
      { label: "Decode a JWT", slug: "jwt-decoder" },
      { label: "Generate a hash", slug: "hash-generator" },
      { label: "Encode Base64", slug: "base64-encoder-decoder" },
    ],
    title: "Developers",
  },
  {
    icon: "writers",
    id: "writers",
    links: [
      { label: "Count words", slug: "word-counter" },
      { label: "Change text case", slug: "case-converter" },
      { label: "Sort a list", slug: "sort-lines" },
      { label: "Remove duplicate lines", slug: "remove-duplicate-lines" },
    ],
    title: "Writers and students",
  },
  {
    icon: "owners",
    id: "owners",
    links: [
      { label: "Compress images", slug: "image-compressor-converter" },
      { label: "Resize and crop an image", slug: "image-resizer" },
      { label: "Make a favicon", slug: "favicon-generator" },
      { label: "Create a QR code", slug: "qr-code-generator" },
    ],
    title: "Site owners and designers",
  },
  {
    icon: "everyone",
    id: "everyone",
    links: [
      { label: "Work out an age", slug: "age-calculator" },
      { label: "Convert an Excel date", slug: "excel-date-converter" },
      { label: "Generate a password", slug: "password-generator" },
      { label: "Pick a winner or roll dice", slug: "random-number-generator" },
    ],
    title: "Anyone with a quick task",
  },
];

export const WHY_HEADING = "Why use QuicklySorted?";

export const REASONS: readonly ReasonEntry[] = [
  {
    description: "Every tool is free to use. There is nothing to sign up for and no email to hand over.",
    icon: "free",
    id: "free",
    title: "Free, with no signup",
  },
  {
    description:
      "The tools available today do their work on your device, so the text, files, and images you use are not sent to a server.",
    icon: "browser",
    id: "browser",
    title: "Runs in your browser",
  },
  {
    description: "Each tool page says how it handles your data, so you never have to guess.",
    icon: "clear",
    id: "clear",
    title: "Clear about your data",
  },
  {
    description:
      "Every tool follows the same simple layout, adapts to your screen, and works in light and dark themes.",
    icon: "consistent",
    id: "consistent",
    title: "Simple and consistent",
  },
];

export const FAQ_HEADING = "Frequently asked questions";
export const FAQ_INTRO = "Short answers to the questions people ask most. If yours is not here, ask us and we will add it.";

const MAX_IMAGE_MEGABYTES = MAX_IMAGE_FILE_BYTES / 1024 / 1024;

export const FAQ_ITEMS: readonly (FaqEntry & { id: string })[] = [
  {
    answer:
      "QuicklySorted is a growing collection of free online tools for everyday tasks, including developer tools, date and time tools, text tools, image tools, and generators. Each one does a single job and opens in one click.",
    id: "what",
    question: "What is QuicklySorted?",
  },
  {
    answer: "Yes. Every tool is free to use, and there is no account or signup to create.",
    id: "free",
    question: "Is it really free, and do I need an account?",
  },
  {
    answer:
      "No, not for the tools available today. They run in your browser, so what you type, paste, or choose stays on your device. Each tool page states how it handles your data, and if a future tool ever needs a server, it will say so before you use it.",
    id: "privacy",
    question: "Are my files and text uploaded anywhere?",
  },
  {
    answer:
      "QuicklySorted is built for current versions of Chrome, Edge, Firefox, and Safari on computers, tablets, and phones. A few features depend on the browser. For example, some browsers cannot save images as WebP, and the tool tells you and saves a PNG instead.",
    id: "browsers",
    question: "Which browsers and devices does it work on?",
  },
  {
    answer:
      "We test calculations and conversions against independent references wherever we can, such as date arithmetic and hashes. Even so, please double-check anything important, like a legal, medical, or financial decision, before you rely on a result.",
    id: "trust",
    question: "Can I trust the results?",
  },
  {
    answer: `A few, to keep your browser responsive. The text tools handle up to ${MAX_TEXT_TOOL_CHARACTERS.toLocaleString("en-US")} characters, and the image tools accept files up to ${MAX_IMAGE_MEGABYTES} MB, with up to ${MAX_BATCH_FILES} images at a time in the compressor. A tool shows a clear message if you go over.`,
    id: "limits",
    question: "Are there any limits?",
  },
  {
    answer: `QuicklySorted is made by ${COMPANY_NAME}, a software company based in Pakistan that builds business systems and web products.`,
    id: "who",
    question: "Who makes QuicklySorted?",
  },
  {
    answer:
      "Use the contact form on the Wisemen Soft website and tell us what you wanted to do, and which tool would have helped, or what went wrong. Requests like these shape what we build next.",
    id: "suggest",
    question: "How do I suggest a tool or report a problem?",
  },
];

export const SUGGEST_HEADING = "Missing a tool?";
export const SUGGEST_TEXT = "Tell us what you wanted to do. Your ideas decide which tools we build next.";
