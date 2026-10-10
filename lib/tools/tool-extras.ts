/**
 * A worked example, plain limits, and a short explanation for a tool page. The text sits beside
 * the tool so a reader can see what to expect, and so search engines have real, specific words
 * about what each tool does and where it stops.
 */
export interface ToolExtras {
  /** How the tool works, in a few sentences. */
  about: string;
  /** One real input and what the tool gives back for it. */
  example: ToolExample;
  /** What the tool does not do, and the sizes it accepts. Each is one sentence. */
  limits: readonly string[];
}

export interface ToolExample {
  /** A one line label for the example, such as "A small JSON object". */
  title: string;
  /** What goes in. Written exactly as it would be typed or chosen. */
  input: string;
  /** What comes out. Where it is code or data, it is exactly what the tool produces. */
  output: string;
}

/**
 * Finds the extras for a tool by its registry id.
 */
export function getToolExtras(toolId: string): ToolExtras | undefined {
  return TOOL_EXTRAS[toolId];
}

/**
 * Extras for every available tool, keyed by the tool's registry id. Where the output is text,
 * it was produced by the tool's own code, and a test keeps every tool covered.
 */
export const TOOL_EXTRAS: Readonly<Record<string, ToolExtras>> = {
  "CAL-01": {
    about:
      "Pick the question you are asking, such as what a percentage of a number is, or how much a price changed, and fill in the two numbers. The result is worked out directly from them, with the working shown in words so you can check it.",
    example: {
      input: "A price rises from 80 to 100. What is the percentage change?",
      output: "An increase of 20, which is 25%.",
      title: "A price goes up",
    },
    limits: [
      "Numbers can be as large as 1 trillion.",
      "Margin and markup are different: a cost of 40 sold at 50 is a 25% markup but a 20% margin.",
      "Results are shown rounded, so very long decimals are shortened.",
    ],
  },
  "CAL-04": {
    about:
      "Your weight is divided by your height squared. The result is placed in the standard adult categories, and the weights that give a BMI of 18.5 to 24.9 at your height are shown as the healthy range.",
    example: {
      input: "Height 175 cm, weight 70 kg.",
      output: "BMI 22.9, in the Healthy weight category. The healthy range at this height is 56.7 to 76.3 kg.",
      title: "An adult in metric units",
    },
    limits: [
      "Heights up to 272 cm and weights up to 650 kg are accepted.",
      "BMI is a rough screening number for adults. It does not measure body fat, and muscle, age, and build all change what it means.",
      "Children and teenagers are judged on growth charts, not on adult categories.",
    ],
  },
  "CAL-05": {
    about:
      "The monthly payment comes from the standard formula for a loan that is paid off in equal monthly payments at a fixed rate. The schedule then splits each payment into interest and principal, month by month, until the balance reaches zero.",
    example: {
      input: "10,000 borrowed at 6% a year for 60 months, with an extra 100 paid each month.",
      output: "Monthly payment 193.33. Paid off in 38 months, with 991.06 of interest instead of 1,599.68, which saves 608.62.",
      title: "A five year loan with extra payments",
    },
    limits: [
      "Loan amounts up to 1 trillion, rates up to 100%, and terms up to 50 years are accepted.",
      "It assumes a fixed rate and equal monthly payments. Fees, insurance, taxes, and changing rates are not included.",
      "A lender's own figure can differ by a few cents because of how they round.",
    ],
  },
  "CAL-07": {
    about:
      "Simple interest is charged on your starting amount only. Compound interest is added to the balance as often as you choose, so later interest is earned on earlier interest. Monthly additions are put in at the end of each month.",
    example: {
      input: "5,000 to start, 100 added each month, 5% a year, compounded monthly, for 10 years.",
      output: "Final balance 23,763.28, from 17,000 paid in and 6,763.28 of interest.",
      title: "Saving for ten years",
    },
    limits: [
      "Amounts up to 1 trillion, rates up to 100%, and terms up to 100 years are accepted.",
      "The rate is treated as fixed for the whole term. Tax, fees, and inflation are not taken off.",
      "Real accounts may compound or credit interest on different days, so a bank's figure can differ slightly.",
    ],
  },
  "CAL-10": {
    about:
      "The tip is a percentage of the bill, the total is the bill plus the tip, and the total is divided evenly between the people. You can round each share up to a whole number, which raises the tip slightly.",
    example: {
      input: "A bill of 120, an 18% tip, split between 4 people.",
      output: "Tip 21.60, total 141.60, and 35.40 each.",
      title: "Dinner for four",
    },
    limits: [
      "Up to 100 people and a tip of up to 100% are accepted.",
      "The split is always even. It does not handle people who ordered different amounts.",
      "Tax is not separated out, so enter the bill amount you want the tip based on.",
    ],
  },
  "DAT-01": {
    about:
      "The CSV is read with the standard rules for quoted fields, then each row becomes an object keyed by the header names, or a list when there is no header. Going the other way, the keys of the objects become the columns.",
    example: {
      input: "name,age,city\nAda,36,London\nLinus,28,Helsinki",
      output:
        '[\n  { "name": "Ada", "age": 36, "city": "London" },\n  { "name": "Linus", "age": 28, "city": "Helsinki" }\n]',
      title: "Two rows with a header",
    },
    limits: [
      "Up to 2 million characters of input are accepted.",
      "Numbers with more than 15 digits, and values with leading zeros, stay as text so they are not changed.",
      "Lists inside JSON objects are written into a single CSV cell as JSON text, because CSV has no way to nest.",
    ],
  },
  "DAT-03": {
    about:
      "The XML is read with your browser's own XML parser, so malformed markup is reported instead of guessed at. Elements become keys, and attributes can be kept as keys that start with @. The other direction writes keys as elements.",
    example: {
      input: '<user id="7"><name>Ada</name><age>36</age></user>',
      output: '{\n  "user": {\n    "@id": 7,\n    "name": "Ada",\n    "age": 36\n  }\n}',
      title: "An element with an attribute",
    },
    limits: [
      "Up to 2 million characters of input are accepted.",
      "JSON has no attributes, comments, or processing instructions, so a round trip through JSON can change how the XML looks.",
      "The XML must be well formed. A missing closing tag is reported as an error, not repaired.",
    ],
  },
  "DAT-05": {
    about:
      "The YAML is parsed with a full YAML parser and written out as JSON with the indentation you pick. In the other direction, JSON is written as YAML, with words like yes, no, on, and off put in quotes so other tools do not read them as true and false.",
    example: {
      input: "name: Ada\nroles:\n  - admin\n  - editor\nactive: true",
      output:
        '{\n  "name": "Ada",\n  "roles": [\n    "admin",\n    "editor"\n  ],\n  "active": true\n}',
      title: "A small YAML file",
    },
    limits: [
      "Up to 2 million characters of input are accepted.",
      "JSON has no comments, so any comments in the YAML are lost when converting to JSON.",
      "Anchors and aliases are filled in with their values, and a file with several documents becomes a JSON list.",
    ],
  },
  "DAT-08": {
    about:
      "Whole numbers are read in the base you choose and written in the others, using exact big number arithmetic, so large values are not rounded. Text is turned into the bytes of its UTF-8 form, and Roman numerals are converted by the standard rules.",
    example: {
      input: "255 in base 10",
      output: "Base 16: FF. Base 2: 11111111. Base 8: 377.",
      title: "A number in other bases",
    },
    limits: [
      "Bases from 2 to 36 are supported, with numbers up to 10,000 digits long.",
      "Roman numerals cover 1 to 3999, the range the standard notation can write.",
      "Text to bytes handles up to 100,000 characters and uses the UTF-8 encoding.",
    ],
  },
  "DAT-12": {
    about:
      "Each unit is defined by how many of a base unit it holds, so a value is converted to the base unit and then to the one you chose. Temperatures use their own formulas, because their zero points differ.",
    example: {
      input: "98.6 degrees Fahrenheit to Celsius",
      output: "37 degrees Celsius.",
      title: "Body temperature",
    },
    limits: [
      "Temperatures below absolute zero are rejected.",
      "Results are shown to ten significant digits.",
      "A year is taken as 365.25 days, the average length of a calendar year.",
    ],
  },
  "DEV-01": {
    about:
      "Your text is parsed with the browser's JSON parser. If it is valid, it is written back with the indentation you chose, or on one line to minify it. If not, the error is reported with the line and column. The work runs in a background worker, so large files do not freeze the page.",
    example: {
      input: '{"name":"Ada","skills":["math","code"],"active":true}',
      output: '{\n  "name": "Ada",\n  "skills": [\n    "math",\n    "code"\n  ],\n  "active": true\n}',
      title: "Formatting one line of JSON",
    },
    limits: [
      "Up to 5 million characters are accepted.",
      "Only strict JSON is valid: comments, single quotes, and trailing commas are reported as errors.",
      "Numbers are read as ordinary floating point values, so whole numbers larger than 9,007,199,254,740,991 can lose digits.",
    ],
  },
  "DEV-02": {
    about:
      "A JWT has three parts joined by dots. The first two are JSON written in Base64URL, which this tool decodes and displays. The third part is the signature, which is shown as present but not checked.",
    example: {
      input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSJ9.c2lnbmF0dXJl",
      output: 'Header: {"alg":"HS256","typ":"JWT"}. Payload: {"sub":"1234567890","name":"Ada"}.',
      title: "A short token",
    },
    limits: [
      "The signature is not verified, so a decoded token is not proof that it is genuine.",
      "Only the compact form with three parts is read, and up to 100,000 characters.",
      "Anyone can read a JWT's contents, so keep secrets out of the payload.",
    ],
  },
  "DEV-03": {
    about:
      "Each UUID is a version 4 value made from random numbers supplied by your browser's secure random generator, so it is not based on a time or an address.",
    example: {
      input: "Count: 3",
      output: "Three values in the form 3b241101-e2bb-4255-8caf-4136c566a962, each different, every time.",
      title: "A batch of three",
    },
    limits: [
      "From 1 to 100 UUIDs can be made at once.",
      "Only version 4 is produced. Other versions, such as time ordered ones, are not.",
      "The browser must support secure random values, which needs a secure (HTTPS) page.",
    ],
  },
  "DEV-04": {
    about:
      "Encoding turns your text into its UTF-8 bytes and writes them with the 64 characters of the Base64 alphabet. Decoding reverses that, and tells you if the result is not valid text.",
    example: {
      input: "Hello, world!",
      output: "SGVsbG8sIHdvcmxkIQ==",
      title: "Encoding a greeting",
    },
    limits: [
      "Up to 5 million characters are accepted.",
      "Decoding expects the standard alphabet of letters, digits, plus, and slash.",
      "Base64 is a way of writing data, not encryption. Anyone can decode it.",
    ],
  },
  "DEV-05": {
    about:
      "Encoding replaces every character that is not safe inside a part of a web address with a percent sign and its UTF-8 byte values. Decoding turns them back. It is for one part of a URL, such as a query value, not a whole address.",
    example: {
      input: "name=Ada Lovelace&city=São Paulo",
      output: "name%3DAda%20Lovelace%26city%3DS%C3%A3o%20Paulo",
      title: "A query string",
    },
    limits: [
      "Up to 5 million characters are accepted.",
      "Characters such as &, =, /, and ? are encoded too, so do not paste a whole address if you want it to stay usable.",
      "A percent sign that is not followed by two hex digits cannot be decoded and is reported as an error.",
    ],
  },
  "DEV-08": {
    about:
      "Your text is converted to UTF-8 bytes and passed to your browser's built in cryptography functions. With a secret key, the same functions make an HMAC instead, which proves who made a hash.",
    example: {
      input: "hello",
      output: "SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      title: "Hashing one word",
    },
    limits: [
      "Up to 1 million characters of text, and a secret key of up to 10,000 characters.",
      "SHA-1, SHA-256, SHA-384, and SHA-512 are supported. MD5 is not.",
      "A hash alone is not a safe way to store passwords. Use a slow password hashing method for that.",
    ],
  },
  "DTM-01": {
    about:
      "The age is the number of whole years, months, and days between the date of birth and the date you pick, counted on the calendar. The next birthday and the totals in months, weeks, and days are worked out from the same dates.",
    example: {
      input: "Born 15 June 1990, on 10 October 2026.",
      output: "36 years, 3 months, 25 days. 13,266 days old. The next birthday is Tuesday, 15 June 2027.",
      title: "An age on a given date",
    },
    limits: [
      "Dates up to the year 9999 are supported, and the birth date cannot be after the date you ask about.",
      "Only calendar dates are used, not times or time zones.",
      "It does not work out legal ages, which can depend on local rules.",
    ],
  },
  "DTM-02": {
    about:
      "The dates are compared on the calendar. You get the gap as years, months, and days, and also as total days and as weeks with days left over. An option counts the end date as well.",
    example: {
      input: "From 15 January 2024 to 1 March 2024.",
      output: "46 days. That is 1 month and 15 days, or 6 weeks and 4 days.",
      title: "Across a leap day",
    },
    limits: [
      "Dates up to the year 9999 are supported.",
      "Every calendar day is counted. Weekends and public holidays are not left out.",
      "Times and time zones are not used.",
    ],
  },
  "DTM-04": {
    about:
      "The years, months, weeks, and days are added to or taken from the start date. When a month is shorter than the day you start on, the result is the last day of that month, so 31 January plus one month is the last day of February.",
    example: {
      input: "31 January 2024, add 30 days.",
      output: "Friday, 1 March 2024.",
      title: "Adding days across a short month",
    },
    limits: [
      "Each amount can be a whole number up to 1,000,000, and the result must fall between the years 1 and 9999.",
      "Weekends and public holidays are counted like any other day.",
      "Times and time zones are not used.",
    ],
  },
  "DTM-06": {
    about:
      "The start time is subtracted from the end time, then the break is taken off. If the end time is earlier than the start, the shift is treated as running past midnight.",
    example: {
      input: "09:00 to 17:30, with a 30 minute break.",
      output: "8h 00m, which is 8 hours as a decimal.",
      title: "A day shift",
    },
    limits: [
      "It works out one shift at a time. Add several results yourself for a week.",
      "A shift is under 24 hours, so the start and end times cannot be the same, and a break can be at most 1,440 minutes.",
      "Overtime rules and pay are not calculated.",
    ],
  },
  "DTM-08": {
    about:
      "A Unix timestamp counts the seconds, or milliseconds, since 1 January 1970 UTC. The tool works out which one you gave from its size, then shows the date in UTC, in ISO 8601, and in your own time zone.",
    example: {
      input: "1700000000",
      output: "Detected as seconds. 2023-11-14T22:13:20.000Z, which is 14 November 2023, 10:13:20 pm UTC.",
      title: "A timestamp in seconds",
    },
    limits: [
      "Input can be up to 100 characters, and dates up to about 270,000 years either side of 1970 are supported.",
      "A value of 100,000,000,000 or more is read as milliseconds and anything smaller as seconds, so a small millisecond value is read as seconds.",
      "The Local line uses your device's time zone setting.",
    ],
  },
  "DTM-11": {
    about:
      "An Excel date is a day count from a starting day. The 1900 system, which Excel for Windows uses by default, counts from 1 January 1900. The 1904 system, used by older Mac files, counts from 1 January 1904. The tool converts both ways and handles the time of day as a fraction.",
    example: {
      input: "1 January 2024 in the 1900 system.",
      output: "The serial number 45292.",
      title: "A date to a serial number",
    },
    limits: [
      "Dates before 1 January 1900, or 1904 for the other system, are not valid Excel dates.",
      "Excel's 1900 system counts a 29 February 1900 that never happened as number 60, which this tool follows, so number 60 has no real date.",
      "Check which system your workbook uses before converting. They differ by 1,462 days.",
    ],
  },
  "GEN-01": {
    about:
      "Characters are picked one at a time from your browser's secure random generator, so there is no pattern to guess. Passphrases pick whole words from a word list the same way.",
    example: {
      input: "Length 16, with letters, digits, and symbols.",
      output: "A different 16 character password each time, which is never stored or sent anywhere.",
      title: "A strong password",
    },
    limits: [
      "Passwords can be up to 128 characters, tokens up to 256, passphrases up to 12 words, and PINs up to 12 digits.",
      "Up to 50 can be made at once.",
      "Your password manager or your account's own rules may still limit the length or the characters it will take.",
    ],
  },
  "GEN-02": {
    about:
      "Your text, link, or details are encoded into a grid of squares, using the standard QR code format with error correction so a small smudge does not stop it being read. It is drawn in your browser, so the content is never uploaded.",
    example: {
      input: "https://quicklysorted.com",
      output: "A QR code that opens that address when scanned. Download it as a PNG or an SVG.",
      title: "A QR code for a link",
    },
    limits: [
      "Up to 2,000 characters of content are accepted. A shorter link makes a simpler code that is easier to scan.",
      "A QR code cannot be changed after it is printed, so use a link you will keep.",
      "Wi-Fi names are limited to 32 bytes and passwords to 63 characters, as the Wi-Fi standard requires.",
    ],
  },
  "GEN-03": {
    about:
      "Each number, die, or coin is drawn from your browser's secure random generator, scaled to the range you asked for without bias, so every outcome is equally likely.",
    example: {
      input: "Roll two six sided dice.",
      output: "For example 4 and 6, a total of 10. Each roll is different.",
      title: "Two dice",
    },
    limits: [
      "Up to 1,000 numbers, 100 dice of up to 1,000 sides, 1,000 coins, and 5,000 list items at a time.",
      "Decimals can have up to 8 places.",
      "It is fair for games and picks, but it is not a certified draw for prizes or regulated lotteries.",
    ],
  },
  "IMG-01": {
    about:
      "Each image is decoded by your browser, drawn onto a canvas, and saved again in the format and quality you chose. Because it is your own browser doing it, the pictures are never uploaded.",
    example: {
      input: "A 4000 by 3000 pixel PNG photo, converted to WebP.",
      output: "A WebP file that is smaller than the PNG. The tool shows the size before and after for each image.",
      title: "A large photo to WebP",
    },
    limits: [
      "Up to 50 images at once, each up to 50 MB and 100 million pixels.",
      "JPG, PNG, WebP, GIF, BMP, AVIF, and SVG can be read. JPG, PNG, and WebP can be written.",
      "Compressing JPG or WebP at lower quality loses detail for good, so keep your original.",
    ],
  },
  "IMG-02": {
    about:
      "Your browser decodes the image and draws it again at the size, crop, rotation, or flip you chose, then saves it in the format you picked. Nothing is uploaded.",
    example: {
      input: "A 4000 by 3000 photo, resized to 50 percent.",
      output: "A 2000 by 1500 image, with the same shape as the original.",
      title: "Halving a photo",
    },
    limits: [
      "Output can be up to 16,384 pixels on a side and 100 million pixels in total.",
      "Enlarging an image makes it bigger but not sharper.",
      "Resizing in percent can go up to 1,000 percent.",
    ],
  },
  "IMG-12": {
    about:
      "Your image is drawn at each of the sizes browsers and devices ask for, from 16 to 512 pixels. The small ones are packed into a favicon.ico file, and a web app manifest and the HTML tags to link everything are written for you.",
    example: {
      input: "A square logo of 512 by 512 pixels.",
      output: "favicon.ico, PNG icons from 16 to 512 pixels, site.webmanifest, and the link tags to add to your page head.",
      title: "A logo to a favicon set",
    },
    limits: [
      "Icons inside favicon.ico go up to 256 by 256 pixels.",
      "Favicons are square, so start from a square image for the best result.",
      "The site name in the manifest is limited to 45 characters.",
    ],
  },
  "SEO-01": {
    about:
      "Your title, description, and address are written out as the title tag, the description, a canonical link, and the Open Graph and Twitter tags that control how the page looks when shared. A preview and checks show how long each is.",
    example: {
      input: "Title: Free Online Tools. Description: Free online tools that run in your browser. URL: https://example.com/",
      output:
        '<title>Free Online Tools</title>\n<meta name="description" content="Free online tools that run in your browser.">\n<link rel="canonical" href="https://example.com/">\n<meta property="og:type" content="website">',
      title: "Basic tags for a home page",
    },
    limits: [
      "Search results usually show about 60 characters of a title and 160 of a description. Longer text is cut off.",
      "Search engines may rewrite your title or description. The tags are a suggestion.",
      "The tags are made for you to paste into your page. The tool does not check a live site.",
    ],
  },
  "SEO-05": {
    about:
      "The rules you set are written in the robots.txt format, with a group for all crawlers first, then a block for each AI crawler you choose to turn away, then your sitemap addresses. The sitemap tool writes the standard XML format from a list of addresses.",
    example: {
      input: "Block /admin/ and /cart for everyone, and block AI training crawlers.",
      output: "User-agent: *\nDisallow: /admin/\nDisallow: /cart\n\nUser-agent: GPTBot\nDisallow: /\n\n(and a group for each other chosen AI crawler)",
      title: "A robots.txt file",
    },
    limits: [
      "robots.txt is a request. Well behaved crawlers follow it, but others may not.",
      "A sitemap can hold up to 50,000 addresses, and every address must be on the same site as the first.",
      "Companies rename their crawlers, so check each company's documentation from time to time.",
    ],
  },
  "SEO-07": {
    about:
      "The campaign values are tidied, with spaces replaced and letters lowered if you choose, then added to your address as utm_ parameters. The other direction takes a link apart and lists its tags.",
    example: {
      input: "example.com/shop, source newsletter, medium email, campaign Spring Sale.",
      output: "https://example.com/shop?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale",
      title: "A newsletter link",
    },
    limits: [
      "The tags only work if the page has analytics installed that reads them.",
      "Use the same spelling every time, because Email and email show up as two different rows.",
      "Avoid tagging links between pages on your own site, because it can break how visits are counted.",
    ],
  },
  "SEO-08": {
    about:
      "You fill in the details and the tool writes JSON-LD, which is the format search engines read for structured data. It supports FAQ, article, product, local business, organization, and breadcrumb markup.",
    example: {
      input: "One question, Is it free?, with the answer Yes, it is free.",
      output:
        '{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Is it free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, it is free." } } ] }',
      title: "FAQ markup",
    },
    limits: [
      "The markup must describe content that is visible on the page, or search engines may ignore it.",
      "Valid markup does not guarantee a rich result. Since 2023, FAQ results show only for well known government and health sites.",
      "Article headlines are limited to 110 characters.",
    ],
  },
  "TXT-01": {
    about:
      "Your text is split into words and counted on this device as you type, along with sentences, paragraphs, and an estimate of reading time at 238 words a minute and speaking time at 130.",
    example: {
      input: "The quick brown fox jumps over the lazy dog.",
      output: "9 words, 44 characters (36 without spaces), 1 sentence.",
      title: "A one sentence text",
    },
    limits: [
      "Programs count words a little differently, so Word or Google Docs can give a slightly different number for hyphenated words or numbers.",
      "Reading and speaking times are averages, and your own pace will differ.",
      "Up to 1 million characters are accepted.",
    ],
  },
  "TXT-02": {
    about:
      "Each visible character is counted, as one unit, so an accented letter or an emoji counts once. You can set a limit to see how many characters you have left.",
    example: {
      input: "The quick brown fox jumps over the lazy dog.",
      output: "44 characters, or 36 without spaces.",
      title: "Counting a sentence",
    },
    limits: [
      "Platforms count in their own ways, such as links on X, so use the limit field as a guide.",
      "Up to 1 million characters are accepted.",
      "Counting uses the way your browser groups characters, and an older browser may count some emoji as more than one.",
    ],
  },
  "TXT-03": {
    about:
      "Your text is split into words, and the words are joined again in the style you pick, such as camelCase, snake_case, or Title Case. All 16 styles can be seen at once.",
    example: {
      input: "the quick brown fox",
      output: "camelCase: theQuickBrownFox. snake_case: the_quick_brown_fox. kebab-case: the-quick-brown-fox. Title Case: The Quick Brown Fox.",
      title: "One sentence in four styles",
    },
    limits: [
      "Title Case and Sentence case follow simple rules and do not know every style guide's exceptions.",
      "Up to 1 million characters are accepted.",
      "Text in scripts without upper and lower case is left as it is.",
    ],
  },
  "TXT-07": {
    about:
      "Your lines are cleaned as you ask, with spaces trimmed, blanks and repeats removed, and then put in the order you chose. Numbers inside lines can be read as numbers, so item 2 comes before item 10.",
    example: {
      input: "pear\napple\nBanana\napple\n(ignoring case, blank lines removed)",
      output: "apple\napple\nBanana\npear",
      title: "A short list, A to Z",
    },
    limits: [
      "Order can be A to Z, Z to A, shortest, longest, reversed, or shuffled.",
      "Sorting uses your browser's language rules, so accented letters are placed where your language puts them.",
      "A shuffle is different every time, and up to 1 million characters are accepted.",
    ],
  },
  "TXT-08": {
    about:
      "Each line is compared with the lines before it, after trimming spaces and ignoring case if you choose. You can keep the first of each, keep only lines that appear once, or list only the lines that repeat.",
    example: {
      input: "red\nblue\nred\ngreen\nblue",
      output: "red\nblue\ngreen\n(2 repeated lines removed)",
      title: "Repeats removed",
    },
    limits: [
      "Lines must match completely. Two lines that differ by a word are not repeats.",
      "The first copy of each line keeps its place, so the order is not changed.",
      "Spaces at the ends of lines can be ignored, but spaces in the middle matter. Up to 1 million characters are accepted.",
    ],
  },
};
