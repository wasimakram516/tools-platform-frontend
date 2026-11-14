import type { Guide } from "@/lib/guides/guide-types";

/**
 * QR code error correction levels, versions, capacity, the quiet zone, and practical printing
 * advice. Figures were checked against DENSO WAVE, the company that created the QR code.
 */
export const QR_ERROR_CORRECTION_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "M, which recovers about 15% of damage, suits most printed codes and is the level DENSO WAVE says is chosen most often. Use L for a long link shown on a clean screen, and Q or H for codes that will get dirty, worn, or covered by a logo.",
      question: "Which QR error correction level should I use?",
    },
    {
      answer:
        "Yes, if the logo covers less of the code than the error correction can rebuild, and it does not cover the three large corner squares. Use level H, keep the logo small and central, and test the printed code with several phones.",
      question: "Can I put a logo in the middle of a QR code?",
    },
    {
      answer:
        "Up to 2,953 bytes of text or 7,089 digits, at version 40 with level L, and 1,273 bytes at level H. A code that full has 177 by 177 modules and is hard to scan, so the generator here accepts up to 2,000 characters, and shorter is better.",
      question: "How much can a QR code hold?",
    },
    {
      answer:
        "Nothing about the code itself. A static QR code holds its content directly and works for as long as that content is valid. A code that points at a short link stops working if the link service does.",
      question: "Do QR codes expire?",
    },
  ],
  intro:
    "A QR code still scans when part of it is dirty, torn, or covered, because it carries spare data to rebuild what is missing. How much it can rebuild is set by its error correction level. This guide explains the four levels, how they change the size of the code, how much a code can hold, and how to print one that scans first time.",
  metaDescription:
    "QR code error correction levels L, M, Q, and H explained: how much damage each survives, how they change the code's size, capacity, and printing tips.",
  name: "QR code error correction levels explained",
  relatedGuides: ["utm-parameters"],
  relatedTools: ["wifi-qr-code-generator", "utm-link-builder"],
  searchTerms: ["qr", "qr code", "error correction", "quiet zone", "reed solomon", "qr logo"],
  sections: [
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A QR code stores its content as codewords of 8 bits each, and adds extra codewords made with Reed-Solomon error correction, the same family of codes used on CDs. A scanner that cannot read some codewords works them out from the extra ones. The more extra codewords, the more damage the code survives, and the more room they take.",
        },
        {
          caption: "The four error correction levels",
          columns: ["Level", "Recovers about", "Best for"],
          kind: "table",
          rows: [
            ["L", "7% of codewords", "Codes on screens and clean surfaces, or long content that must stay small"],
            ["M", "15% of codewords", "Most printed codes: posters, flyers, packaging, menus"],
            ["Q", "25% of codewords", "Codes that get handled or worn, such as labels and tickets"],
            ["H", "30% of codewords", "Codes outdoors, in dirty places, or with a logo over part of them"],
          ],
        },
        {
          kind: "paragraph",
          text: "DENSO WAVE, which created the QR code, notes that M is the level chosen most often. The percentages are of codewords, not of the printed area, so a scratch through the middle of a code can cost more than its size suggests if it crosses many codewords.",
        },
      ],
      heading: "What error correction does",
      id: "how-it-works",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "QR codes come in 40 sizes, called versions. Version 1 is 21 by 21 modules, the small squares that make up the code, and each version adds 4 modules to each side, up to version 40 at 177 by 177. The generator picks the smallest version that holds your content at the level you chose.",
        },
        {
          kind: "paragraph",
          text: "Raising the level therefore makes the code bigger for the same content, or holds less in a code of the same size. On a small print, a bigger version means smaller modules, which are harder to scan. That is the real trade off: more protection against damage, but less tolerance for small prints, blur, and distance.",
        },
        {
          caption: "The most a code can hold, at version 40 and level L",
          columns: ["Kind of content", "Most it holds"],
          kind: "table",
          rows: [
            ["Digits only", "7,089 digits"],
            ["Capital letters A to Z, digits, space, and $ % * + - . / :", "4,296 characters"],
            ["Any text, such as a link, as bytes", "2,953 bytes"],
            ["Kanji", "1,817 characters"],
          ],
        },
        {
          kind: "paragraph",
          text: "At level H the same version holds much less: 1,273 bytes of text instead of 2,953. Lower case letters are not in the compact capital letters set, so a typical link is stored as bytes.",
        },
        {
          kind: "paragraph",
          text: "Real codes should be far below these limits. A short link of 30 to 40 characters fits in a small version at any level and scans easily. If a code looks crowded, shorten the content before you lower the error correction.",
        },
      ],
      heading: "Versions, size, and how much a code holds",
      id: "versions",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "Leave a quiet zone. A QR code needs a clear margin four modules wide on every side, with nothing printed in it, so scanners can find its edges.",
            "Keep strong contrast. Dark modules on a light background scan best. A light code on a dark background is not read by every scanner.",
            "Do not cover the three large squares in the corners. Scanners use them to find and straighten the code, and error correction cannot rebuild them.",
            "Make it big enough. A common rule of thumb is a code at least one tenth as wide as the distance it will be scanned from, so about 3 cm across for a scan from 30 cm.",
            "Download SVG for print. It stays sharp at any size, while a small PNG that is enlarged blurs the module edges.",
            "Test the printed code with more than one phone, in the light where it will be used, before you print many.",
          ],
        },
      ],
      heading: "Printing a code that scans first time",
      id: "printing",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A logo over the centre of a code works because the covered modules count as damage that error correction rebuilds. Use level H, keep the logo well under the share it can recover, since a smudge or glare will need some of that margin too, and keep it clear of the corner squares. A code that is already near its limit, from long content, leaves little room for a logo.",
        },
        {
          kind: "paragraph",
          text: "Colour works too, as long as the contrast stays high. Keep the modules darker than the background, and check the result with the contrast warning in the generator.",
        },
      ],
      heading: "Logos and colours",
      id: "logos",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A QR code cannot be changed once it is printed. To change where it points later, encode a link you control, such as a page on your own site, and update that page instead. For a Wi-Fi code, print a new one whenever the password changes, because the password is inside the code.",
        },
        {
          kind: "paragraph",
          text: "The [QR Code Generator](/tools/qr-code-generator) lets you choose any of the four levels, sets a four module quiet zone by default, warns when the colours are too close, and downloads PNG or SVG. The [Wi-Fi QR Code Generator](/tools/wifi-qr-code-generator) does the same for a network name and password.",
        },
      ],
      heading: "Changing a code after printing",
      id: "changing",
    },
  ],
  seoTitle: "QR Code Error Correction Levels Explained",
  slug: "qr-code-error-correction",
  sources: [
    { label: "DENSO WAVE: Error correction feature", url: "https://www.qrcode.com/en/about/error_correction.html" },
    { label: "DENSO WAVE: Information capacity and versions", url: "https://www.qrcode.com/en/about/version.html" },
    { label: "DENSO WAVE: QR Code standardization", url: "https://www.qrcode.com/en/about/standards.html" },
    { label: "DENSO WAVE: Securing the margin", url: "https://www.qrcode.com/en/howto/code.html" },
  ],
  toolAction: "Open the QR Code Generator",
  toolSlug: "qr-code-generator",
  updatedAt: "2026-11-14",
};
