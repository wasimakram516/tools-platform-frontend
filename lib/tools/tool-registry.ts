import type { ToolCategory, ToolDefinition } from "@/types/tool";

/**
 * The categories. When you add a tool, put it in the category its MAIN AUDIENCE would look in,
 * not the one named after its file format or technique. Tools that mostly developers use (data
 * format converters such as CSV, JSON, YAML, and XML, timestamps, hashes, and encoders) go in
 * Developer tools. Tools for everyone (calculators, unit conversion, QR codes, passwords, text and
 * image tools) go in the general categories. Add a new category only for a distinct audience.
 */
const TOOL_CATEGORIES = [
  {
    id: "developer",
    slug: "developer-tools",
    name: "Developer tools",
    description:
      "Format, inspect, encode, and generate development data without sending it to a server.",
    eyebrow: "Code and data",
    icon: "developer",
    status: "available",
  },
  {
    id: "image",
    slug: "image-tools",
    name: "Image tools",
    description: "Compress, resize, convert, and crop images.",
    eyebrow: "Photos and graphics",
    icon: "image",
    status: "available",
  },
  {
    id: "text",
    slug: "text-tools",
    name: "Text tools",
    description: "Count, clean, compare, and reshape text in one place.",
    eyebrow: "Writing and cleanup",
    icon: "text",
    status: "available",
  },
  {
    id: "calculator",
    slug: "calculators",
    name: "Calculators",
    description: "Percentages, loans, interest, BMI, and splitting a bill, with clear workings.",
    eyebrow: "Numbers",
    icon: "calculator",
    status: "available",
  },
  {
    id: "datetime",
    slug: "date-and-time-tools",
    name: "Date and time tools",
    description: "Work out ages, the days between dates, hours worked, and convert timestamps and Excel dates.",
    eyebrow: "Calendars and clocks",
    icon: "datetime",
    status: "available",
  },
  {
    id: "generator",
    slug: "generators",
    name: "Generators",
    description: "Passwords, QR codes, random values, and other things you would rather not invent.",
    eyebrow: "Create on demand",
    icon: "generator",
    status: "available",
  },
  {
    id: "seo",
    slug: "web-and-seo-tools",
    name: "Web and SEO tools",
    description: "Meta tags and previews, robots.txt and sitemaps, campaign links, and schema markup for site owners.",
    eyebrow: "Sites and search",
    icon: "seo",
    status: "available",
  },
] as const satisfies readonly ToolCategory[];

const TOOL_DEFINITIONS = [
  {
    id: "DEV-01",
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription: "Format, minify, and validate JSON locally.",
    description:
      "Turn compact or difficult-to-read JSON into a clear structure, validate its syntax, or minify it for transport.",
    categoryId: "developer",
    keywords: ["json", "formatter", "validator", "beautifier", "minifier"],
    searchTerms: ["readable", "pretty", "beautify", "minify", "validate", "lint", "indent", "format", "api", "response", "payload", "parse", "messy", "broken"],
    processingMode: "worker",
    status: "available",
    featured: true,
    relatedToolIds: ["DEV-04", "DEV-05", "DEV-02", "DAT-01", "DAT-05"],
    updatedAt: "2026-10-09",
    icon: "json",
  },
  {
    id: "DEV-04",
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    shortDescription: "Encode or decode Base64 text in your browser.",
    description: "Convert plain text to Base64 and decode Base64 without uploading your content.",
    categoryId: "developer",
    keywords: ["base64", "encode", "decode"],
    searchTerms: ["base64", "encode", "decode", "binary", "attachment", "string", "text", "convert", "ascii", "b64"],
    processingMode: "worker",
    status: "available",
    relatedToolIds: ["DEV-05", "DEV-01"],
    updatedAt: "2026-10-09",
    icon: "base64",
  },
  {
    id: "DEV-05",
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    shortDescription: "Safely encode and decode URL components.",
    description: "Prepare query values for URLs or turn encoded components back into readable text.",
    categoryId: "developer",
    keywords: ["url", "encode", "decode", "percent encoding"],
    searchTerms: ["url", "link", "percent", "query", "string", "encode", "decode", "escape", "slug", "uri", "address"],
    processingMode: "worker",
    status: "available",
    relatedToolIds: ["DEV-04", "DEV-01"],
    updatedAt: "2026-10-09",
    icon: "url",
  },
  {
    id: "DEV-03",
    slug: "uuid-generator",
    name: "UUID Generator",
    shortDescription: "Generate secure UUIDs directly on your device.",
    description: "Create one or more cryptographically secure UUIDs without a network request.",
    categoryId: "developer",
    keywords: ["uuid", "guid", "generator", "random"],
    searchTerms: ["uuid", "guid", "unique", "id", "identifier", "random", "database", "key", "generate", "v4"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-02", "DEV-01"],
    updatedAt: "2026-10-09",
    icon: "uuid",
  },
  {
    id: "DEV-02",
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortDescription: "Inspect JWT headers and payloads locally.",
    description:
      "Decode a JSON Web Token for inspection. Decoding does not verify its signature or authenticity.",
    categoryId: "developer",
    keywords: ["jwt", "token", "decoder", "header", "payload"],
    searchTerms: ["jwt", "token", "login", "auth", "authentication", "bearer", "access", "expiry", "expire", "claims", "payload", "debug", "session"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-01", "DEV-04", "DTM-08"],
    updatedAt: "2026-10-09",
    icon: "jwt",
  },
  {
    id: "DEV-08",
    slug: "hash-generator",
    name: "Hash Generator",
    shortDescription: "Generate SHA-256 and other hashes from text.",
    description:
      "Hash text with SHA-1, SHA-256, SHA-384, and SHA-512 on your device, add a secret key for HMAC, and check the result against a checksum you already have.",
    categoryId: "developer",
    keywords: ["hash generator", "sha256", "sha-256 hash", "sha512", "checksum", "sha1", "hmac sha256"],
    searchTerms: ["hash", "checksum", "sha", "md5", "sha1", "sha256", "sha512", "hmac", "digest", "fingerprint", "verify", "integrity", "encrypt"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-04", "DEV-03", "DEV-02"],
    updatedAt: "2026-10-09",
    icon: "hash",
  },
  {
    id: "CAL-01",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortDescription: "Percentages, percentage change, discounts, and margin and markup.",
    description:
      "Work out a percentage of a number, what percent one number is of another, the change between two numbers, a discount or sale price, and margin and markup, with the answer written out.",
    categoryId: "calculator",
    keywords: ["percentage calculator", "percent calculator", "percentage change", "percentage increase", "percentage decrease", "discount calculator", "sale price", "margin calculator", "markup calculator", "profit margin"],
    searchTerms: ["percent", "percentage", "discount", "sale", "off", "increase", "decrease", "change", "margin", "markup", "profit", "vat", "tax", "ratio"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-10", "CAL-05", "CAL-07"],
    updatedAt: "2026-10-09",
    icon: "percentage",
  },
  {
    id: "CAL-05",
    slug: "loan-calculator",
    name: "Loan Calculator",
    shortDescription: "Monthly payment, total interest, and a full repayment schedule.",
    description:
      "Find the monthly payment and total interest on a loan or mortgage, see the repayment schedule month by month, and see how much an extra monthly payment saves. Download the schedule as CSV.",
    categoryId: "calculator",
    keywords: ["loan calculator", "emi calculator", "mortgage calculator", "monthly payment calculator", "amortization schedule", "car loan calculator", "personal loan calculator", "loan repayment"],
    searchTerms: ["loan", "emi", "mortgage", "payment", "installment", "instalment", "repayment", "amortization", "borrow", "bank", "car", "home", "interest", "monthly"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-07", "CAL-01", "CAL-10"],
    updatedAt: "2026-10-09",
    icon: "loan",
  },
  {
    id: "CAL-07",
    slug: "interest-calculator",
    name: "Interest Calculator",
    shortDescription: "Simple and compound interest, with monthly additions.",
    description:
      "Calculate simple or compound interest, choose how often interest is added, include a monthly addition, and see the balance grow year by year. Download the table as CSV.",
    categoryId: "calculator",
    keywords: ["interest calculator", "compound interest calculator", "simple interest calculator", "savings calculator", "investment calculator", "compounding", "savings growth"],
    searchTerms: ["interest", "compound", "simple", "savings", "invest", "investment", "deposit", "growth", "return", "rate", "fixed", "bank", "profit"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-05", "CAL-01", "CAL-10"],
    updatedAt: "2026-10-09",
    icon: "interest",
  },
  {
    id: "CAL-04",
    slug: "bmi-calculator",
    name: "BMI Calculator",
    shortDescription: "Body mass index in metric or imperial, with the healthy weight range.",
    description:
      "Calculate body mass index from your height and weight in centimetres and kilograms, or feet, inches, and pounds, and see the standard range it falls in and the weight range that is healthy for your height. It is a screening figure, not a diagnosis.",
    categoryId: "calculator",
    keywords: ["bmi calculator", "body mass index", "healthy weight", "ideal weight", "bmi chart", "weight calculator", "height and weight"],
    searchTerms: ["bmi", "body", "mass", "weight", "height", "fat", "obese", "overweight", "underweight", "healthy", "diet", "fitness", "kg", "lb"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-01", "DTM-01"],
    updatedAt: "2026-10-09",
    icon: "bmi",
  },
  {
    id: "CAL-10",
    slug: "tip-and-bill-split-calculator",
    name: "Tip and Bill Split Calculator",
    shortDescription: "Add a tip to a bill and split it between people.",
    description:
      "Add a tip to a restaurant bill, split the total between any number of people, and round each share up to a whole number if you like.",
    categoryId: "calculator",
    keywords: ["tip calculator", "bill splitter", "split the bill", "restaurant bill calculator", "gratuity calculator", "dinner split"],
    searchTerms: ["tip", "bill", "split", "share", "restaurant", "dinner", "gratuity", "friends", "divide", "people", "each", "equal", "cafe"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-01", "CAL-05"],
    updatedAt: "2026-10-09",
    icon: "tip",
  },
  {
    id: "DAT-01",
    slug: "csv-json-converter",
    name: "CSV and JSON Converter",
    shortDescription: "Convert CSV or TSV to JSON and JSON to CSV, live as you type.",
    description:
      "Turn CSV or TSV into JSON and JSON back into CSV in your browser. Pick the separator or let it be detected, convert numbers and booleans, flatten nested objects into columns, and download the result.",
    categoryId: "developer",
    keywords: ["csv to json", "json to csv", "csv converter", "tsv to json", "csv to json converter", "convert csv to json online"],
    searchTerms: ["csv", "tsv", "json", "spreadsheet", "excel", "table", "rows", "columns", "delimiter", "convert", "import", "export", "comma", "semicolon"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-01", "DAT-05", "DAT-03"],
    updatedAt: "2026-10-09",
    icon: "csvJson",
  },
  {
    id: "DAT-05",
    slug: "json-yaml-converter",
    name: "JSON and YAML Converter",
    shortDescription: "Convert YAML to JSON and JSON to YAML, live as you type.",
    description:
      "Turn YAML into JSON and JSON into YAML in your browser. It follows YAML 1.2, fills in aliases, reads files with several documents, and says where a mistake is.",
    categoryId: "developer",
    keywords: ["yaml to json", "json to yaml", "yaml converter", "yml to json", "convert yaml online"],
    searchTerms: ["yaml", "yml", "json", "config", "kubernetes", "docker", "compose", "convert", "indent", "sort", "keys"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-01", "DAT-01", "DAT-03"],
    updatedAt: "2026-10-09",
    icon: "yaml",
  },
  {
    id: "DAT-03",
    slug: "xml-json-converter",
    name: "XML and JSON Converter",
    shortDescription: "Convert XML to JSON and JSON to XML, live as you type.",
    description:
      "Turn XML into JSON and JSON into XML in your browser. Attributes, repeated elements, and element text are kept, errors in the XML are reported, and nothing is uploaded.",
    categoryId: "developer",
    keywords: ["xml to json", "json to xml", "xml converter", "convert xml to json online"],
    searchTerms: ["xml", "json", "soap", "rss", "feed", "attributes", "convert", "api", "elements", "tags"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-01", "DAT-05", "DAT-01"],
    updatedAt: "2026-10-09",
    icon: "xml",
  },
  {
    id: "DAT-08",
    slug: "number-base-converter",
    name: "Number Base Converter",
    shortDescription: "Convert numbers between bases, text to bytes, and Roman numerals.",
    description:
      "Convert whole numbers between binary, octal, decimal, hexadecimal, and any base up to 36, write text as binary or hex bytes and read it back, and convert numbers to and from Roman numerals.",
    categoryId: "developer",
    keywords: ["number base converter", "binary to decimal", "decimal to binary", "hex to decimal", "text to binary", "binary to text", "hex to text", "roman numeral converter"],
    searchTerms: ["binary", "hex", "hexadecimal", "octal", "decimal", "base", "bits", "bytes", "ascii", "utf8", "roman", "numeral", "text", "convert"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-04", "DEV-08", "DAT-01"],
    updatedAt: "2026-10-09",
    icon: "numberBase",
  },
  {
    id: "DAT-12",
    slug: "unit-converter",
    name: "Unit Converter",
    shortDescription: "Convert length, weight, temperature, area, volume, speed, time, and data size.",
    description:
      "Convert between metric and imperial units of length, weight, temperature, area, volume, speed, and time, and between decimal and binary data sizes, with every other unit shown beside the answer.",
    categoryId: "calculator",
    keywords: ["unit converter", "metric to imperial", "cm to inches", "kg to lbs", "celsius to fahrenheit", "mb to gb", "miles to km"],
    searchTerms: ["unit", "convert", "metric", "imperial", "length", "weight", "mass", "temperature", "celsius", "fahrenheit", "kelvin", "miles", "km", "inches", "feet", "pounds", "kilograms", "litres", "gallons", "speed", "mph", "bytes", "gigabytes"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["CAL-01", "DAT-08", "DTM-08"],
    updatedAt: "2026-10-09",
    icon: "unitConvert",
  },
  {
    id: "SEO-01",
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    shortDescription: "Make meta tags, Open Graph tags, and live previews for any page.",
    description:
      "Write the title, description, canonical, Open Graph, and X card tags for a page, with a live preview of the search result and of a shared link, and advice on length and format.",
    categoryId: "seo",
    keywords: ["meta tag generator", "open graph generator", "og tags generator", "twitter card generator", "seo meta tags", "meta description generator", "serp preview", "social media preview"],
    searchTerms: ["meta", "tags", "title", "description", "open", "graph", "og", "twitter", "card", "preview", "snippet", "serp", "social", "share", "canonical", "noindex", "seo", "head", "html"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["SEO-05", "SEO-08", "SEO-07"],
    updatedAt: "2026-10-09",
    icon: "metaTags",
  },
  {
    id: "SEO-05",
    slug: "robots-txt-sitemap-generator",
    name: "robots.txt and Sitemap Generator",
    shortDescription: "Make a robots.txt file or an XML sitemap, with options to block AI crawlers.",
    description:
      "Build a robots.txt file with block and allow rules and optional blocks for AI crawlers, or turn a list of page addresses into an XML sitemap. Both are checked for common mistakes and ready to download.",
    categoryId: "seo",
    keywords: ["robots.txt generator", "sitemap generator", "xml sitemap generator", "create robots.txt", "block ai crawlers", "block gptbot", "robots.txt disallow"],
    searchTerms: ["robots", "txt", "sitemap", "xml", "crawler", "crawl", "bot", "spider", "disallow", "allow", "gptbot", "claudebot", "ai", "block", "index", "seo", "googlebot"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["SEO-01", "SEO-07", "SEO-08"],
    updatedAt: "2026-10-09",
    icon: "robotsSitemap",
  },
  {
    id: "SEO-07",
    slug: "utm-link-builder",
    name: "UTM Link Builder",
    shortDescription: "Add UTM campaign tags to a link, or take any link apart.",
    description:
      "Add source, medium, and campaign tags to a link for tracking in Google Analytics, with checks for the common mistakes. Or take any link apart to read its path and query.",
    categoryId: "seo",
    keywords: ["utm builder", "utm link generator", "campaign url builder", "utm parameters", "utm generator", "url parser", "query string parser"],
    searchTerms: ["utm", "campaign", "tracking", "analytics", "ga4", "source", "medium", "link", "url", "parameters", "query", "parse", "breakdown", "marketing", "newsletter", "social"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["SEO-01", "SEO-05", "DEV-05"],
    updatedAt: "2026-10-09",
    icon: "utm",
  },
  {
    id: "SEO-08",
    slug: "schema-markup-generator",
    name: "Schema Markup Generator",
    shortDescription: "Make JSON-LD structured data for FAQs, articles, products, and businesses.",
    description:
      "Fill in a form to make JSON-LD structured data for an FAQ, article, product, local business, organization, or breadcrumb trail, checked as you type and ready to paste into your page.",
    categoryId: "seo",
    keywords: ["schema markup generator", "json-ld generator", "structured data generator", "faq schema generator", "product schema generator", "local business schema", "breadcrumb schema"],
    searchTerms: ["schema", "jsonld", "json", "ld", "structured", "data", "rich", "results", "faq", "product", "article", "business", "breadcrumb", "organization", "seo", "markup"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["SEO-01", "DEV-01", "SEO-05"],
    updatedAt: "2026-10-09",
    icon: "schemaMarkup",
  },
  {
    id: "DTM-01",
    slug: "age-calculator",
    name: "Age Calculator",
    shortDescription: "Work out an exact age in years, months, and days.",
    description:
      "Find an exact age on any date, with total months, weeks, and days and the date of the next birthday.",
    categoryId: "datetime",
    keywords: ["age calculator", "how old", "date of birth", "birthday", "age in days"],
    searchTerms: ["age", "old", "birthday", "birth", "born", "dob", "years", "months", "days", "next"],
    processingMode: "browser",
    status: "available",
    featured: true,
    relatedToolIds: ["DTM-02", "DTM-04", "DTM-06"],
    updatedAt: "2026-10-09",
    icon: "age",
  },
  {
    id: "DTM-02",
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    shortDescription: "Find the time between two dates.",
    description:
      "Find the exact time between two dates as years, months, and days, and as a total number of days and weeks.",
    categoryId: "datetime",
    keywords: ["days between dates", "date difference", "date calculator", "duration between dates"],
    searchTerms: ["between", "days", "weeks", "months", "years", "gap", "duration", "countdown", "until", "since", "elapsed", "difference"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DTM-04", "DTM-01", "DTM-08"],
    updatedAt: "2026-10-09",
    icon: "dateDifference",
  },
  {
    id: "DTM-04",
    slug: "add-subtract-date",
    name: "Add or Subtract Date",
    shortDescription: "Add or subtract days, weeks, months, or years.",
    description:
      "Find the date that is a number of days, weeks, months, or years before or after any date.",
    categoryId: "datetime",
    keywords: ["add days to date", "subtract days from date", "date calculator", "date plus days"],
    searchTerms: ["add", "subtract", "plus", "minus", "deadline", "due", "later", "ago", "ahead", "forward", "back", "days", "weeks"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DTM-02", "DTM-01", "DTM-08"],
    updatedAt: "2026-10-09",
    icon: "dateMath",
  },
  {
    id: "DTM-06",
    slug: "hours-worked-calculator",
    name: "Hours Worked Calculator",
    shortDescription: "Calculate the hours worked in a shift, with breaks.",
    description:
      "Find the time worked between a start and an end time, including overnight shifts, with the break taken off.",
    categoryId: "datetime",
    keywords: ["hours worked", "time card calculator", "work hours", "shift length"],
    searchTerms: ["hours", "worked", "shift", "timesheet", "clock", "punch", "break", "overtime", "payroll", "minutes", "duration"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DTM-02", "DTM-04", "DTM-01"],
    updatedAt: "2026-10-09",
    icon: "hoursWorked",
  },
  {
    id: "DTM-08",
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    shortDescription: "Convert Unix timestamps to dates and back.",
    description:
      "Convert seconds or milliseconds since 1970 into a readable date in UTC and your own time zone, or turn a date into a timestamp.",
    categoryId: "developer",
    keywords: ["unix timestamp", "epoch converter", "timestamp to date", "epoch time"],
    searchTerms: ["unix", "timestamp", "epoch", "seconds", "milliseconds", "utc", "log", "time", "date"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DEV-02", "DTM-02", "DTM-04"],
    updatedAt: "2026-10-09",
    icon: "timestamp",
  },
  {
    id: "DTM-11",
    slug: "excel-date-converter",
    name: "Excel Date Converter",
    shortDescription: "Convert dates to Excel serial numbers and back.",
    description:
      "Turn a date and time into the number Excel stores, or turn an Excel serial number back into a date, in the Windows (1900) or Mac (1904) date system.",
    categoryId: "datetime",
    keywords: ["excel date converter", "excel serial number", "excel date to number", "convert number to date excel"],
    searchTerms: ["excel", "spreadsheet", "serial", "number", "sheets", "cell", "date", "numeric", "1900", "xlsx"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["DTM-08", "DTM-02", "DTM-04"],
    updatedAt: "2026-10-09",
    icon: "spreadsheet",
  },
  {
    id: "TXT-01",
    slug: "word-counter",
    name: "Word Counter",
    shortDescription: "Count words and find your most used words.",
    description:
      "Count words, characters, sentences, paragraphs, and lines as you write, then see your most used words, average word and sentence length, and estimated reading and speaking time.",
    categoryId: "text",
    keywords: ["word counter", "count words", "word count", "how many words", "sentence counter", "keyword density", "reading time"],
    searchTerms: ["word", "words", "count", "essay", "length", "limit", "reading", "paragraph", "sentence", "article"],
    processingMode: "browser",
    status: "available",
    featured: true,
    relatedToolIds: ["TXT-02", "TXT-03", "TXT-08"],
    updatedAt: "2026-10-09",
    icon: "wordCount",
  },
  {
    id: "TXT-02",
    slug: "character-counter",
    name: "Character Counter",
    shortDescription: "Count characters with or without spaces and check a limit.",
    description:
      "Count characters with and without spaces, break them down by letters, digits, spaces, and symbols, see the size in bytes, and check your text against a limit such as an X post, SMS, page title, or meta description.",
    categoryId: "text",
    keywords: ["character counter", "character count", "count characters", "characters with spaces", "length checker", "twitter character limit"],
    searchTerms: ["character", "characters", "letters", "count", "limit", "tweet", "bio", "caption", "sms", "length", "spaces"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["TXT-01", "TXT-03", "TXT-07"],
    updatedAt: "2026-10-09",
    icon: "characterCount",
  },
  {
    id: "TXT-03",
    slug: "case-converter",
    name: "Case Converter",
    shortDescription: "Change text to 16 styles, or see them all at once.",
    description:
      "Convert text to upper, lower, title, or sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, Train-Case, a URL slug, and more, and see every style at once with a copy button on each.",
    categoryId: "text",
    keywords: ["case converter", "uppercase to lowercase", "title case converter", "camelcase", "snake case", "capitalize text", "slug generator", "kebab case", "dot case"],
    searchTerms: ["case", "uppercase", "lowercase", "capital", "capitals", "title", "sentence", "camel", "snake", "kebab", "slug", "caps"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["TXT-01", "TXT-02", "TXT-07"],
    updatedAt: "2026-10-09",
    icon: "caseConverter",
  },
  {
    id: "TXT-07",
    slug: "sort-lines",
    name: "Sort Lines",
    shortDescription: "Sort a list A to Z, by length, or shuffle it.",
    description:
      "Put a list in order, one item per line: A to Z, Z to A, by line length, reversed, or shuffled, with options for case, numbers inside text, trimming, empty lines, and duplicates.",
    categoryId: "text",
    keywords: ["sort lines", "sort alphabetically", "alphabetize list", "sort text lines", "sort a list", "shuffle lines", "random order"],
    searchTerms: ["sort", "order", "alphabetical", "alphabetize", "arrange", "list", "lines", "shuffle", "reverse", "ascending", "descending"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["TXT-08", "TXT-03", "TXT-01"],
    updatedAt: "2026-10-09",
    icon: "sortLines",
  },
  {
    id: "TXT-08",
    slug: "remove-duplicate-lines",
    name: "Remove Duplicate Lines",
    shortDescription: "Remove repeated lines, or find which lines repeat.",
    description:
      "Clean up a list by removing repeated lines, or find them: keep only the unique lines, keep only the repeated ones, and see which lines repeat most, with options for case and spaces.",
    categoryId: "text",
    keywords: ["remove duplicate lines", "remove duplicates", "deduplicate list", "unique lines", "delete duplicate lines", "find duplicate lines"],
    searchTerms: ["duplicate", "duplicates", "repeated", "repeat", "unique", "dedupe", "clean", "list", "lines", "copies", "emails"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["TXT-07", "TXT-01", "TXT-03"],
    updatedAt: "2026-10-09",
    icon: "duplicateLines",
  },
  {
    id: "IMG-01",
    slug: "image-compressor-converter",
    name: "Image Compressor and Converter",
    shortDescription: "Compress images and convert between JPG, PNG, and WebP.",
    description:
      "Make images smaller and convert them between JPEG, PNG, and WebP, several at a time, with a quality slider, a maximum width, and the size before and after for each file. Download one image or all as a zip. Nothing is uploaded.",
    categoryId: "image",
    keywords: ["image compressor", "compress jpg", "compress png", "png to jpg", "jpg to png", "webp converter", "convert image format", "reduce image size"],
    searchTerms: ["image", "photo", "picture", "compress", "shrink", "smaller", "reduce", "size", "optimize", "upload", "big", "large", "huge", "jpg", "jpeg", "png", "webp", "convert", "lighter"],
    processingMode: "browser",
    status: "available",
    featured: true,
    relatedToolIds: ["IMG-02", "IMG-12", "DEV-04"],
    updatedAt: "2026-10-09",
    icon: "imageCompress",
  },
  {
    id: "IMG-02",
    slug: "image-resizer",
    name: "Image Resizer and Cropper",
    shortDescription: "Resize, crop, rotate, and flip an image.",
    description:
      "Resize an image by pixels or percent, crop it to an exact size from the part you choose, or use a common size for social posts, banners, and thumbnails. Rotate, flip, and preview the result before you download it. Nothing is uploaded.",
    categoryId: "image",
    keywords: ["image resizer", "resize image", "crop image", "rotate image", "flip image", "resize for instagram", "change image dimensions"],
    searchTerms: ["image", "photo", "picture", "resize", "crop", "rotate", "flip", "dimensions", "width", "height", "scale", "cut", "trim", "bigger", "instagram"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["IMG-01", "IMG-12", "TXT-02"],
    updatedAt: "2026-10-09",
    icon: "imageResize",
  },
  {
    id: "IMG-12",
    slug: "favicon-generator",
    name: "Favicon Generator",
    shortDescription: "Make a full favicon set and favicon.ico from one image.",
    description:
      "Turn one image into every favicon size browsers and phones need, a real favicon.ico, a web manifest, and the tags to paste into your page, ready to download as one zip. Nothing is uploaded.",
    categoryId: "image",
    keywords: ["favicon generator", "favicon.ico", "apple touch icon", "png to ico", "app icon generator", "website icon"],
    searchTerms: ["favicon", "icon", "ico", "website", "browser", "tab", "logo", "app", "touch", "apple"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["IMG-01", "IMG-02", "DEV-04"],
    updatedAt: "2026-10-09",
    icon: "favicon",
  },
  {
    id: "GEN-01",
    slug: "password-generator",
    name: "Password Generator",
    shortDescription: "Make strong passwords, passphrases, PINs, and tokens.",
    description:
      "Generate random passwords with the character kinds you choose, easy-to-remember passphrases, PINs, and keys for apps and APIs, with a strength estimate for each. Made on your device with your browser's secure random generator.",
    categoryId: "generator",
    keywords: ["password generator", "random password", "passphrase generator", "pin generator", "api key generator", "strong password", "random string generator"],
    searchTerms: ["password", "passphrase", "pin", "secure", "strong", "safe", "random", "secret", "generate", "key", "api"],
    processingMode: "browser",
    status: "available",
    featured: true,
    relatedToolIds: ["DEV-03", "DEV-08", "GEN-03"],
    updatedAt: "2026-10-09",
    icon: "password",
  },
  {
    id: "GEN-02",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription: "Make QR codes for links, Wi-Fi, contacts, and messages.",
    description:
      "Create QR codes for web addresses, text, Wi-Fi networks, contact cards, email, phone numbers, SMS, and WhatsApp, with error correction levels, colours, and a contrast check. Download PNG or SVG. Nothing is uploaded.",
    categoryId: "generator",
    keywords: ["qr code generator", "wifi qr code", "vcard qr code", "qr code maker", "whatsapp qr code", "url to qr code", "free qr code"],
    searchTerms: ["qr", "code", "barcode", "scan", "link", "wifi", "vcard", "contact", "menu", "poster", "whatsapp"],
    processingMode: "browser",
    status: "available",
    featured: true,
    relatedToolIds: ["IMG-12", "DEV-05", "GEN-01"],
    updatedAt: "2026-10-09",
    icon: "qrCode",
  },
  {
    id: "GEN-03",
    slug: "random-number-generator",
    name: "Random Number Generator",
    shortDescription: "Random numbers, dice, coin flips, and a list picker.",
    description:
      "Draw random numbers from any range with no repeats if you like, roll dice, flip coins, and pick winners, shuffle a list, or split people into fair teams. Drawn on your device with your browser's secure random generator.",
    categoryId: "generator",
    keywords: ["random number generator", "dice roller", "coin flip", "random picker", "team generator", "random name picker", "lottery number generator"],
    searchTerms: ["random", "number", "pick", "choose", "winner", "dice", "roll", "coin", "flip", "lottery", "team", "draw", "picker", "lucky"],
    processingMode: "browser",
    status: "available",
    relatedToolIds: ["GEN-01", "TXT-07", "TXT-08"],
    updatedAt: "2026-10-09",
    icon: "random",
  },
] as const satisfies readonly ToolDefinition[];

const categoryBySlug = new Map<string, ToolCategory>(
  TOOL_CATEGORIES.map((category) => [category.slug, category]),
);
const categoryById = new Map<string, ToolCategory>(
  TOOL_CATEGORIES.map((category) => [category.id, category]),
);
const toolBySlug = new Map<string, ToolDefinition>(
  TOOL_DEFINITIONS.map((tool) => [tool.slug, tool]),
);
const toolById = new Map<string, ToolDefinition>(TOOL_DEFINITIONS.map((tool) => [tool.id, tool]));

/**
 * Returns every registered tool category in display order.
 */
export function getToolCategories(): readonly ToolCategory[] {
  return TOOL_CATEGORIES;
}

/**
 * Returns the categories that currently contain at least one available tool.
 */
export function getAvailableToolCategories(): readonly ToolCategory[] {
  return TOOL_CATEGORIES.filter((category) => category.status === "available");
}

/**
 * Finds a category by its public URL slug.
 */
export function getToolCategoryBySlug(slug: string): ToolCategory | undefined {
  return categoryBySlug.get(slug);
}

/**
 * Finds a category by its internal registry identifier.
 */
export function getToolCategoryById(categoryId: string): ToolCategory | undefined {
  return categoryById.get(categoryId);
}

/**
 * Returns the available tools flagged as featured, in display order, for the homepage.
 */
export function getFeaturedTools(): readonly ToolDefinition[] {
  const tools: readonly ToolDefinition[] = TOOL_DEFINITIONS;

  return tools.filter((tool) => tool.status === "available" && tool.featured === true);
}

/**
 * Returns every tool, available or planned.
 */
export function getTools(): readonly ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

/**
 * Finds a tool by its public URL slug.
 */
export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolBySlug.get(slug);
}

/**
 * Returns the tools assigned to a category.
 */
export function getToolsByCategory(categoryId: string): readonly ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => tool.categoryId === categoryId);
}

/**
 * Resolves a tool's related-tool references while preserving registry order.
 */
export function getRelatedTools(tool: ToolDefinition): readonly ToolDefinition[] {
  return tool.relatedToolIds.flatMap((toolId) => {
    const relatedTool = toolById.get(toolId);
    return relatedTool ? [relatedTool] : [];
  });
}
