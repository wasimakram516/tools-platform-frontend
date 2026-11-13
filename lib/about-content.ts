import { BRAND_NAME, COMPANY_NAME, COMPANY_URL, CONTACT_URL } from "@/lib/site-config";

/**
 * The words on the About page: who makes the site, why, and how the promise that tool input is
 * never uploaded is kept. Text may hold [label](url) links, which the page turns into links.
 */

export interface AboutSection {
  heading: string;
  id: string;
  paragraphs: readonly string[];
}

/** When the About page last meaningfully changed (YYYY-MM-DD). Used for the sitemap. */
export const ABOUT_UPDATED_ISO = "2026-11-13";

export const ABOUT_TITLE = `About ${BRAND_NAME}`;

export const ABOUT_DESCRIPTION = `Who makes ${BRAND_NAME}, why it exists, and how its tools keep your text, files, and images on your own device.`;

export const ABOUT_INTRO = `${BRAND_NAME} is a set of free tools for the small jobs that come up every day, built so that what you put into them stays on your device.`;

export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    heading: "Who makes it",
    id: "who",
    paragraphs: [
      `${BRAND_NAME} is built and run by [${COMPANY_NAME}](${COMPANY_URL}), a software company that builds business systems for schools, print shops, and other organisations. The same team writes, tests, and maintains every tool on this site.`,
    ],
  },
  {
    heading: "Why it exists",
    id: "why",
    paragraphs: [
      "Formatting some JSON, shrinking a photo, or counting the words in an essay should take seconds. Many sites that do these jobs make you wait through adverts, ask you to sign up, or quietly upload what you paste to their servers.",
      `${BRAND_NAME} does each job in one page, with no account, and does the work inside your browser.`,
    ],
  },
  {
    heading: "How your data stays on your device",
    id: "privacy",
    paragraphs: [
      "Every tool available today runs in your browser, using JavaScript and, for heavier work, a background worker on your own device. Your text, files, and images are not sent anywhere to be processed. Each tool page says where its processing happens, under the tool.",
      "This is also enforced by the browser. The site sends a Content Security Policy that only lets its pages connect to this site's own address, so a page cannot send what you enter to any other website. No tool sends your input to this site either.",
      "You can check this yourself: open your browser's developer tools, choose the Network tab, and use a tool. Nothing you type or drop in is sent.",
    ],
  },
  {
    heading: "How the tools are checked",
    id: "quality",
    paragraphs: [
      "Every tool has automated tests for its calculations and edge cases. The worked example on each tool page is the tool's real output, and each page lists the tool's limits, such as the largest file it accepts, so you know where it stops before you rely on it.",
    ],
  },
  {
    heading: "What the site records",
    id: "records",
    paragraphs: [
      "The site counts page visits and measures page speed without cookies and without identifying you. It never records what you enter into a tool. The [privacy policy](/privacy) explains exactly what is collected.",
    ],
  },
  {
    heading: "Suggest a tool or report a problem",
    id: "contact",
    paragraphs: [
      `If a tool gives a wrong answer, or there is a tool you wish existed, [tell us through the ${COMPANY_NAME.split(" (")[0]} contact form](${CONTACT_URL}).`,
    ],
  },
];
