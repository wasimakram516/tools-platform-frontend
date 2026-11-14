import type { Guide } from "@/lib/guides/guide-types";

/**
 * A JavaScript regular expression cheat sheet. Every example result was produced by running it
 * in Node.js 22, which uses the same regex engine as Chrome and Edge.
 */
export const REGEX_CHEAT_SHEET_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "Add ? after the quantifier. .* takes as much as it can, while .*? takes as little as it can, so <b>.*?</b> stops at the first closing tag instead of the last.",
      question: "How do I make a regex match as little as possible?",
    },
    {
      answer:
        "A regex with the g or y flag remembers where its last match ended in lastIndex, and test() starts from there the next time. Testing the same string twice can therefore give true, then false. Create the regex inside the function, or reset lastIndex to 0.",
      question: "Why does test() return true, then false, on the same text?",
    },
    {
      answer:
        "Put a backslash before it: \\. matches a dot, \\( a bracket, and \\\\ a backslash. Inside a character class most symbols lose their meaning, so [.] also matches a dot.",
      question: "How do I match a literal dot or bracket?",
    },
    {
      answer:
        "Mostly, but not entirely. Lookbehind, named groups, and flags differ between engines, and some languages support features JavaScript lacks, such as possessive quantifiers. Test a pattern in the engine that will run it.",
      question: "Does a JavaScript regex work the same in Python or PHP?",
    },
  ],
  intro:
    "A quick reference to JavaScript regular expressions: the characters, quantifiers, groups, lookarounds, and flags you will use most, with a working example of each and the traps that catch people. Every result shown here was produced by running the pattern in JavaScript.",
  metaDescription:
    "JavaScript regex cheat sheet: character classes, quantifiers, groups, lookahead and lookbehind, flags, and common patterns, each with a tested example.",
  name: "JavaScript regex cheat sheet",
  sections: [
    {
      blocks: [
        {
          caption: "Characters and character classes",
          columns: ["Pattern", "Matches"],
          kind: "table",
          rows: [
            [".", "Any character except a line break, unless the s flag is on"],
            ["\\d  \\D", "A digit 0 to 9, and anything that is not one"],
            ["\\w  \\W", "A letter A to Z or a to z, a digit, or an underscore, and anything else"],
            ["\\s  \\S", "Whitespace, such as a space, tab, or line break, and anything else"],
            ["[abc]", "One of a, b, or c"],
            ["[^abc]", "Any one character except a, b, or c"],
            ["[a-z0-9]", "One character in either range"],
            ["\\p{L}", "Any letter in any language, with the u flag"],
            ["\\.  \\\\  \\/", "A literal dot, backslash, or slash"],
          ],
        },
        {
          kind: "paragraph",
          text: "\\w covers only the English alphabet. To match words such as Ünïcødé, use \\p{L}+ with the u flag: /\\p{L}+/gu finds Ünïcødé in Ünïcødé 123.",
        },
      ],
      heading: "Characters",
      id: "characters",
    },
    {
      blocks: [
        {
          caption: "Anchors and quantifiers",
          columns: ["Pattern", "Means"],
          kind: "table",
          rows: [
            ["^  $", "The start and end of the text, or of each line with the m flag"],
            ["\\b", "A word boundary: /\\bcat\\b/g finds cat in cat catalog bobcat, but not the other two"],
            ["*  +  ?", "Zero or more, one or more, zero or one"],
            ["{3}  {2,}  {2,4}", "Exactly 3, at least 2, between 2 and 4"],
            ["*?  +?  ??", "The same, but as few as possible"],
          ],
        },
        {
          kind: "paragraph",
          text: "Quantifiers are greedy unless you add ?. On the text <b>one</b><b>two</b>, the pattern <b>.*</b> matches the whole string, while <b>.*?</b> matches only <b>one</b>.",
        },
      ],
      heading: "Anchors and quantifiers",
      id: "quantifiers",
    },
    {
      blocks: [
        {
          caption: "Groups and references",
          columns: ["Pattern", "Does"],
          kind: "table",
          rows: [
            ["(abc)", "Captures a group, numbered from 1"],
            ["(?<year>\\d{4})", "Captures a named group, read as match.groups.year"],
            ["(?:abc)", "Groups without capturing"],
            ["a|b", "Either a or b"],
            ["\\1  \\k<year>", "Matches the same text a group captured earlier"],
            ["$1  $<year>", "Inserts a group in a replacement"],
          ],
        },
        {
          kind: "code",
          label: "Named groups, then a replacement that reorders them",
          text: 'const date = /(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/;\n\n"2026-11-14".match(date).groups;\n// { y: "2026", m: "11", d: "14" }\n\n"2026-11-14".replace(date, "$<d>/$<m>/$<y>");\n// "14/11/2026"',
        },
      ],
      heading: "Groups",
      id: "groups",
    },
    {
      blocks: [
        {
          caption: "Lookahead and lookbehind",
          columns: ["Pattern", "Matches", "Example result"],
          kind: "table",
          rows: [
            ["a(?=b)", "a only when b follows", "/\\d+(?=px)/g on 100px 2em 30px gives 100 and 30"],
            ["a(?!b)", "a only when b does not follow", "/\\bfile\\.(?!js\\b)\\w+/g on file.js file.ts file.jsx gives file.ts and file.jsx"],
            ["(?<=b)a", "a only when b comes before it", "/(?<=\\$)\\d+/g on $5 and €7 and $12 gives 5 and 12"],
            ["(?<!b)a", "a only when b does not come before it", "The opposite of the row above"],
          ],
        },
        {
          kind: "paragraph",
          text: "Lookarounds check text without including it in the match. Lookbehind arrived in JavaScript with ES2018 and works in every current browser.",
        },
      ],
      heading: "Lookahead and lookbehind",
      id: "lookarounds",
    },
    {
      blocks: [
        {
          caption: "JavaScript regex flags",
          columns: ["Flag", "Name", "Effect"],
          kind: "table",
          rows: [
            ["g", "global", "Find every match, not just the first"],
            ["i", "ignore case", "/hello/i matches HeLLo"],
            ["m", "multiline", "^ and $ match at the start and end of each line"],
            ["s", "dot all", ". also matches line breaks"],
            ["u", "unicode", "Reads the pattern as Unicode, so an emoji counts as one character and \\p{...} works"],
            ["y", "sticky", "Matches only at exactly lastIndex"],
            ["d", "indices", "Adds the start and end of each group to the match"],
            ["v", "unicode sets", "A newer form of u that allows set operations in classes, such as [\\p{L}--[a-z]]"],
          ],
        },
        {
          kind: "paragraph",
          text: "Without the u flag, JavaScript counts an emoji such as 😀 as two characters. With it, /./u matches the whole emoji.",
        },
      ],
      heading: "Flags",
      id: "flags",
    },
    {
      blocks: [
        {
          caption: "Patterns people look up most",
          columns: ["To match", "Pattern", "Notes"],
          kind: "table",
          rows: [
            ["A whole number", "^\\d+$", "Add -? at the start to allow negatives"],
            ["A hex colour", "^#(?:[0-9a-f]{3}){1,2}$ with i", "Accepts #abc and #1a2B3c, rejects #abcd"],
            ["A rough email check", "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "Catches typos only. Send a confirmation email to be sure"],
            ["A date as YYYY-MM-DD", "^\\d{4}-\\d{2}-\\d{2}$", "Checks the shape, not that the date exists"],
            ["Commas with any spaces around them", "\\s*,\\s*", "\"a, b,c ,d\".split(/\\s*,\\s*/) gives a, b, c, d"],
          ],
        },
      ],
      heading: "Common patterns",
      id: "patterns",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "lastIndex with the g flag. const re = /a/g; then re.test(\"aa\") three times gives true, true, false, because each call starts where the last match ended.",
            "Forgetting to escape. /a.c/ matches abc as well as a.c. Write /a\\.c/ for a literal dot.",
            "Catastrophic backtracking. Nested quantifiers such as (a+)+$ can take seconds or longer on text that almost matches. Make each part match only one way.",
            "Building a pattern from user input. Escape the input first, or a value such as a+ or ( changes the pattern's meaning.",
            "Using a regex to parse HTML or JSON. Use a parser; patterns break on nesting, quotes, and comments.",
          ],
        },
        {
          kind: "paragraph",
          text: "Try any pattern on your own text in the [Regex Tester](/tools/regex-tester). It uses your browser's JavaScript engine, supports the g, i, m, s, and u flags, lists every match with its position and groups, previews a replacement, and stops a pattern that runs longer than two seconds.",
        },
      ],
      heading: "Traps",
      id: "traps",
    },
  ],
  seoTitle: "JavaScript Regex Cheat Sheet with Examples",
  slug: "javascript-regex-cheat-sheet",
  sources: [
    { label: "MDN: Regular expressions guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions" },
    { label: "MDN: RegExp flags", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags" },
    { label: "ECMAScript language specification: RegExp objects", url: "https://tc39.es/ecma262/multipage/text-processing.html" },
  ],
  toolAction: "Open the Regex Tester",
  toolSlug: "regex-tester",
  updatedAt: "2026-11-14",
};
