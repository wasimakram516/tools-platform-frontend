import type { ToolExtras } from "@/lib/tools/tool-extras";

const IMAGE_BATCH_LIMIT = "Up to 50 images at once, each up to 50 MB and 100 million pixels.";
const JPG_HAS_NO_TRANSPARENCY = "JPG has no transparency, so transparent areas are filled with the colour you choose.";
const NUMBER_LIMIT = "Numbers can be as large as 1 trillion.";
const DATA_INPUT_LIMIT = "Up to 2 million characters of input are accepted.";
const LIST_LIMIT = "Up to 5,000 entries at a time, one per line.";
const NOT_A_CERTIFIED_DRAW = "It is fair for games and picks, but it is not a certified draw for prizes or regulated lotteries.";

/**
 * Examples, explanations, and limits for the pages made for one job with another tool, keyed by
 * registry id. They are merged into TOOL_EXTRAS, so the same tests check them, including that
 * text outputs are what the tool's own code produces.
 */
export const VARIANT_EXTRAS: Readonly<Record<string, ToolExtras>> = {
  "IMG-16": {
    about:
      "The tool saves your image as a JPG several times at different qualities and keeps the highest quality that comes in under your target. Your browser does the work, so the photo is never uploaded. For a very large photo, setting a maximum width first keeps more detail.",
    example: {
      input: "A 3 MB JPG photo from a phone, target size 100 KB.",
      output:
        "A JPG under 100 KB, saved at the highest quality that fits. The card says which quality was used, for example: Saved at quality 62% to fit under 100 KB.",
      title: "A phone photo for an application form",
    },
    limits: [
      IMAGE_BATCH_LIMIT,
      "If an image cannot fit even at the lowest quality, the smallest result is shown with a note, and a smaller width will help.",
      "Lowering the quality loses detail for good, so keep your original.",
    ],
  },
  "IMG-06": {
    about:
      "Each PNG is decoded by your browser, drawn onto a canvas with your fill colour behind any transparent areas, and saved again as a JPG at the quality you chose. Your own browser does it, so the images are never uploaded.",
    example: {
      input: "screenshot.png, quality 80%.",
      output: "screenshot.jpg, with its new size and the percentage saved shown on its card.",
      title: "A screenshot to JPG",
    },
    limits: [
      IMAGE_BATCH_LIMIT,
      JPG_HAS_NO_TRANSPARENCY,
      "JPG loses a little detail each time it is saved, so keep the PNG if you will edit the image again.",
    ],
  },
  "IMG-05": {
    about:
      "Each JPG is decoded by your browser and saved again as a lossless PNG, so no more detail is lost from this point on. Your own browser does the work, so the photos are never uploaded.",
    example: {
      input: "holiday.jpg, a photo from a phone.",
      output: "holiday.png, usually larger than the JPG because PNG keeps every pixel. Both sizes are shown on its card.",
      title: "A photo to PNG",
    },
    limits: [
      IMAGE_BATCH_LIMIT,
      "Converting to PNG does not bring back detail that JPG compression removed.",
      "PNG cannot be fitted to a target size, because it is lossless.",
    ],
  },
  "IMG-07": {
    about:
      "Each WebP image is decoded by your browser, drawn onto a canvas, and saved again as a JPG at the quality you chose, with any transparent areas filled with your colour. The images never leave your device.",
    example: {
      input: "product.webp, saved from a website, quality 80%.",
      output: "product.jpg, which opens in any photo app. Its size and the change from the original are shown on its card.",
      title: "An image saved from a website",
    },
    limits: [
      IMAGE_BATCH_LIMIT,
      JPG_HAS_NO_TRANSPARENCY,
      "The JPG is often larger than the WebP it came from, because WebP compresses better at the same quality.",
    ],
  },
  "IMG-08": {
    about:
      "Each image is decoded by your browser and saved again as WebP at the quality you chose, keeping any transparency. In target size mode it tries several qualities and keeps the highest that fits. Nothing is uploaded.",
    example: {
      input: "Three JPG product photos, quality 80%.",
      output: "Three WebP files, each card showing the size before and after and the percentage saved.",
      title: "Photos for a website",
    },
    limits: [
      IMAGE_BATCH_LIMIT,
      "A browser that cannot write WebP saves PNG instead, and says so.",
      "Lowering the quality loses detail for good, so keep your originals.",
    ],
  },
  "CAL-02": {
    about:
      "The amount off is the price times the percentage, divided by 100, and it is taken from the price to give the sale price. The answer updates as you type and shows both figures.",
    example: {
      input: "Original price 80, discount 25%.",
      output: "Sale price: 60.00. You save 20.00.",
      title: "25% off",
    },
    limits: [
      NUMBER_LIMIT,
      "A discount has to be between 0% and 100%.",
      "Money is shown to two decimal places. Tax is not added or taken off.",
    ],
  },
  "CAL-09": {
    about:
      "Profit is the selling price minus the cost. Markup is the profit as a share of the cost, and margin is the profit as a share of the price. Starting from the markup or margin you want, the calculator works back to the price to charge.",
    example: {
      input: "Cost 40, selling price 50.",
      output: "Margin: 20%. Markup 25%, profit 10.00, selling price 50.00.",
      title: "Cost 40, sold at 50",
    },
    limits: [
      NUMBER_LIMIT,
      "A margin you ask for has to be below 100%, because the cost is part of the price.",
      "Tax, shipping, and overheads are not included unless you add them to the cost.",
    ],
  },
  "CAL-16": {
    about:
      "The difference between the new number and the old one is divided by the old number and shown as a percentage, with the direction. The old number is always the base, so the order you type them in matters.",
    example: {
      input: "From 1,200 to 1,500.",
      output: "25% increase. The difference is 300.",
      title: "Sales went up",
    },
    limits: [
      NUMBER_LIMIT,
      "A change from zero has no percentage, so the calculator says so instead.",
      "Results are shown rounded, so very long decimals are shortened.",
    ],
  },
  "CAL-08": {
    about:
      "Simple interest is the starting amount times the yearly rate times the number of years. It is earned on the starting amount only, so the same interest is added every year. Switch to compound to compare the two.",
    example: {
      input: "10,000 at 5% a year for 3 years, simple interest.",
      output: "Final balance 11,500, from 10,000 paid in and 1,500 of interest.",
      title: "Three years at 5%",
    },
    limits: [
      "Amounts up to 1 trillion, rates up to 100%, and terms up to 100 years are accepted.",
      "The rate is treated as fixed for the whole term. Tax, fees, and inflation are not taken off.",
    ],
  },
  "DAT-02": {
    about:
      "Each object in the list becomes a row, and the keys become columns, in the order they first appear. Values with commas, quotes, or line breaks are quoted by the standard CSV rules, so the file opens correctly in a spreadsheet.",
    example: {
      input: '[{"name":"Ada","age":36,"city":"London"},{"name":"Linus","age":28,"city":"Helsinki"}]',
      output: "name,age,city\r\nAda,36,London\r\nLinus,28,Helsinki",
      title: "A list of two people",
    },
    limits: [
      DATA_INPUT_LIMIT,
      "Lists inside objects are written into a single cell as JSON text, because CSV has no way to nest.",
      "Every item in the list has to be the same kind: all objects, all lists, or all plain values.",
    ],
  },
  "DAT-06": {
    about:
      "The JSON is read with your browser's own parser and written as YAML with the indentation you pick. Words that older YAML readers would turn into true or false are quoted, so the meaning does not change.",
    example: {
      input: '{"name":"Ada","roles":["admin","editor"],"active":true}',
      output: "name: Ada\nroles:\n  - admin\n  - editor\nactive: true",
      title: "A small JSON object",
    },
    limits: [
      DATA_INPUT_LIMIT,
      "The JSON has to be valid. A mistake is reported, not guessed at.",
      "Keys keep their order unless you choose to sort them.",
    ],
  },
  "DAT-04": {
    about:
      "Each key in the JSON becomes an element, and each item in a list becomes a repeated element with the list's name. Keys that start with @ become attributes, so XML converted to JSON here converts back.",
    example: {
      input: '{"user":{"name":"Ada","age":36,"roles":["admin","editor"]}}',
      output: "<user>\n  <name>Ada</name>\n  <age>36</age>\n  <roles>admin</roles>\n  <roles>editor</roles>\n</user>",
      title: "A user with two roles",
    },
    limits: [
      DATA_INPUT_LIMIT,
      "Keys have to be valid XML names: a letter or underscore first, and no spaces.",
      "JSON has no comments or processing instructions, so the XML has none either.",
    ],
  },
  "DEV-16": {
    about:
      "Your text is turned into UTF-8 bytes and hashed by your browser's built in Web Crypto functions. With a secret key, the same functions make an HMAC-SHA256 instead. The SHA-1, SHA-384, and SHA-512 hashes are shown alongside.",
    example: {
      input: "hello world",
      output: "SHA-256: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      title: "Hashing two words",
    },
    limits: [
      "Up to 1 million characters of text, and a secret key of up to 10,000 characters.",
      "It hashes text you type or paste, not files.",
      "A fast hash alone is not a safe way to store passwords. Use a slow password hashing method for that.",
    ],
  },
  "GEN-16": {
    about:
      "Each word is picked from the EFF short word list of 1,296 words with your browser's secure random generator, so every word is equally likely and there is no pattern to guess. A strength estimate is shown for each passphrase.",
    example: {
      input: "5 words, separated by dashes.",
      output: "A different passphrase each time, in the form word-word-word-word-word, which is never stored or sent.",
      title: "Five random words",
    },
    limits: [
      "Passphrases can have 3 to 12 words, and up to 50 can be made at once.",
      "Some sites limit the length or ask for a symbol or a number, so add a number or capitals when asked.",
    ],
  },
  "GEN-17": {
    about:
      "Your network name, security type, and password are written in the standard Wi-Fi format that phone cameras understand, then encoded as a QR code in your browser. Characters such as ; and : in the name or password are escaped so the code reads correctly.",
    example: {
      input: "Network HomeWiFi, WPA, password sunflower42.",
      output: "A QR code holding WIFI:T:WPA;S:HomeWiFi;P:sunflower42;; that joins the network when scanned.",
      title: "A home network",
    },
    limits: [
      "Network names are limited to 32 bytes, and WPA passwords to 8 to 63 characters, as the Wi-Fi standard requires.",
      "Workplace networks that need a username as well as a password are not supported.",
      "Anyone who can see the code can read the password from it.",
    ],
  },
  "GEN-18": {
    about:
      "The list is split into one entry per line, and blank lines are skipped. Winners are drawn with your browser's secure random generator, every entry equally likely and none drawn twice.",
    example: {
      input: "Ada, Grace, Alan, Linus, and Margaret, one per line. Pick 1 winner.",
      output: "One name, for example Grace. Each draw is different.",
      title: "A classroom pick",
    },
    limits: [LIST_LIMIT, NOT_A_CERTIFIED_DRAW],
  },
  "GEN-19": {
    about:
      "The names are shuffled with your browser's secure random generator and then shared out one at a time across the teams, so team sizes never differ by more than one person.",
    example: {
      input: "Ten names, one per line, split into 3 teams.",
      output: "Three teams of 4, 3, and 3 people, in a new random mix each time.",
      title: "Ten players, three teams",
    },
    limits: [LIST_LIMIT, "The split is random, not balanced by skill or anything else.", "There have to be at least 2 teams."],
  },
  "GEN-20": {
    about:
      "Each die and coin is drawn from your browser's secure random generator, scaled to the number of sides without bias, so every face is equally likely. The total of the dice and the count of heads and tails are shown.",
    example: {
      input: "Roll one 20 sided die.",
      output: "A number from 1 to 20, such as 17. Each roll is different.",
      title: "A d20 roll",
    },
    limits: ["Up to 100 dice of 2 to 1,000 sides, and up to 1,000 coins, at a time.", NOT_A_CERTIFIED_DRAW],
  },
};
