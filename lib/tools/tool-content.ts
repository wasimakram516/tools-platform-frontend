import type { FaqEntry } from "@/lib/seo";

/**
 * The words a tool page adds for readers and for search engines, beyond the tool itself.
 */
export interface ToolContent {
  /** Answers to questions people search for about this tool. */
  faqs: readonly FaqEntry[];
  /** The page's description in search results. Kept under about 155 characters. */
  metaDescription: string;
  /** The page's title in search results, without the site name, which is added after it. */
  seoTitle: string;
  /** How to use the tool, as a few short steps. */
  steps: readonly string[];
}

/**
 * Content for every available tool, keyed by the tool's registry id. A test makes sure that
 * every available tool has an entry, with the right shape and length.
 */
export const TOOL_CONTENT: Readonly<Record<string, ToolContent>> = {
  "DAT-01": {
    faqs: [
      {
        answer:
          "Paste the CSV into the CSV box, or type it, and the JSON appears as you type. With First row is the header on, each row becomes an object keyed by the column names. Turn it off to get a list of lists.",
        question: "How do I convert a CSV file to JSON?",
      },
      {
        answer:
          "Yes. It follows the standard CSV rules: a field in double quotes can hold separators and line breaks, and two quotes in a row stand for one quote.",
        question: "Does it handle commas and line breaks inside quoted fields?",
      },
      {
        answer:
          "With Convert types on, numbers, true, false, and null become JSON values. Values with leading zeros, such as the ZIP code 02134, and numbers with more than 15 digits stay as text, so nothing is changed by accident.",
        question: "Why are some numbers kept as text?",
      },
      {
        answer:
          "Yes. Choose Tab, Semicolon, or Pipe as the separator, or leave it on Detect it and the tool works it out from your data.",
        question: "Can I convert a TSV, or a file that uses semicolons?",
      },
      {
        answer:
          "Leave Flatten nested objects on. An object inside an object becomes a column named with dots, such as address.city. Lists are written into the cell as JSON text.",
        question: "How do I turn nested JSON into CSV?",
      },
    ],
    metaDescription:
      "Convert CSV or TSV to JSON and JSON to CSV online for free. Detects the separator, handles quoted fields, and flattens nested data. Runs in your browser.",
    seoTitle: "CSV to JSON and JSON to CSV Converter",
    steps: [
      "Choose CSV to JSON or JSON to CSV.",
      "Paste your data, or load the example.",
      "Adjust the options, such as the separator, whether the first row is the header, or whether to convert numbers.",
      "Copy the result, or download it as a file.",
    ],
  },
  "DAT-05": {
    faqs: [
      {
        answer:
          "Paste the YAML into the YAML box and the JSON appears as you type. Choose the indentation you want, and copy or download the result.",
        question: "How do I convert YAML to JSON?",
      },
      {
        answer:
          "The tool says what is wrong and the line and column where it was found. It also rejects a key that appears twice in the same map, instead of quietly keeping one.",
        question: "What happens if my YAML has a mistake?",
      },
      {
        answer:
          "It follows YAML 1.2. That means words such as yes, no, on, and off stay text, instead of turning into true and false as they do in older YAML 1.1 readers.",
        question: "Does it follow YAML 1.2 or 1.1?",
      },
      {
        answer:
          "A YAML file can hold several documents separated by three dashes. They become a JSON list, with one item for each document.",
        question: "What about a file with several documents?",
      },
    ],
    metaDescription:
      "Convert YAML to JSON and JSON to YAML online for free. Follows YAML 1.2, shows where a mistake is, and runs in your browser, so nothing is uploaded.",
    seoTitle: "YAML to JSON and JSON to YAML Converter",
    steps: [
      "Choose YAML to JSON or JSON to YAML.",
      "Paste your data, or load the example.",
      "Pick the indentation, and for JSON to YAML choose whether to sort the keys.",
      "Copy the result, or download it as a file.",
    ],
  },
  "DAT-03": {
    faqs: [
      {
        answer:
          "Attributes become keys that start with @, for example @id. Text that sits beside attributes or child elements goes under the key #text. Turn off Keep attributes to leave attributes out.",
        question: "How are XML attributes shown in JSON?",
      },
      {
        answer:
          "Elements with the same name inside one parent become a JSON list, so three item elements become an item list with three entries.",
        question: "What happens to repeated elements?",
      },
      {
        answer:
          "Use keys that start with @ for attributes and #text for an element's own text. If the JSON has a single top-level key, it becomes the root element. Otherwise it is wrapped in the root element name you choose.",
        question: "How do I turn JSON into XML with attributes?",
      },
      {
        answer:
          "Comments and processing instructions are not kept, and an empty element becomes null. If the XML is not well formed, the tool says what is wrong.",
        question: "What does the converter leave out?",
      },
    ],
    metaDescription:
      "Convert XML to JSON and JSON to XML online for free. Keeps attributes and repeated elements, reports errors, and runs in your browser.",
    seoTitle: "XML to JSON and JSON to XML Converter",
    steps: [
      "Choose XML to JSON or JSON to XML.",
      "Paste your data, or load the example.",
      "Choose the indentation, and whether to keep attributes. For JSON to XML, set the root element.",
      "Copy the result, or download it as a file.",
    ],
  },
  "DAT-08": {
    faqs: [
      {
        answer:
          "Choose Number bases, set From base to Binary, and type the binary number. The decimal value appears beside binary, octal, and hexadecimal, and you can pick one more base to show.",
        question: "How do I convert binary to decimal?",
      },
      {
        answer:
          "Yes. Numbers are worked out exactly, however large, up to 10,000 digits, so there is no rounding as with ordinary calculator numbers.",
        question: "Can it handle very large numbers?",
      },
      {
        answer:
          "Text is written as the bytes it is stored as, using UTF-8. A basic letter such as A is one byte, 01000001 in binary or 41 in hex, and a symbol such as the euro sign is three bytes.",
        question: "How is text turned into binary or hex?",
      },
      {
        answer:
          "Whole numbers from 1 to 3999 in the standard form. Forms that are not standard, such as IIII, are rejected instead of guessed at.",
        question: "Which Roman numerals does it support?",
      },
    ],
    metaDescription:
      "Convert numbers between binary, octal, decimal, hexadecimal and any base to 36, text to binary or hex, and Roman numerals. Free, in your browser.",
    seoTitle: "Number Base Converter: Binary, Hex, Decimal",
    steps: [
      "Choose Number bases, Text and bytes, or Roman numerals.",
      "For numbers, type the number and choose the base it is written in.",
      "For text, choose Text to bytes or Bytes to text, and the base to use.",
      "Copy the result you need.",
    ],
  },
  "DAT-12": {
    faqs: [
      {
        answer:
          "Pick the category, then choose a metric unit on one side and an imperial unit on the other. The factors are exact: an inch is 25.4 millimetres, and a pound is 0.45359237 kilograms.",
        question: "How do I convert between metric and imperial units?",
      },
      {
        answer:
          "MB counts in thousands, so 1 MB is 1,000,000 bytes, as drives are sold. MiB counts in 1,024s, so 1 MiB is 1,048,576 bytes, as operating systems often show. The data category has both.",
        question: "What is the difference between MB and MiB?",
      },
      {
        answer:
          "Gallons, quarts, pints, cups, and fluid ounces are US measures, and the imperial gallon is listed separately.",
        question: "Are the gallons US or imperial?",
      },
      {
        answer:
          "Yes, down to absolute zero. Anything colder than minus 273.15 degrees Celsius is not possible, so the tool says so.",
        question: "Can it convert temperatures below zero?",
      },
    ],
    metaDescription:
      "Free unit converter for length, weight, temperature, area, volume, speed, time and data size. Metric and imperial, with every unit shown at once.",
    seoTitle: "Unit Converter: Length, Weight, Temperature",
    steps: [
      "Choose a category, such as Length or Temperature.",
      "Type the value, and choose the unit it is in and the unit you want.",
      "Read the answer, and the value in every other unit in the list below it.",
    ],
  },
  "SEO-01": {
    faqs: [
      {
        answer:
          "Meta tags are lines in the head of a page that tell search engines and social sites how to show it: the title and description in search results, and the title, text, and picture on a shared link.",
        question: "What are meta tags?",
      },
      {
        answer:
          "Search results show about 60 characters of a title and about 160 of a description, cut by width, so the end of a longer one may be cut off. The tool counts for you and warns when one is too long or too short.",
        question: "How long should a title and description be?",
      },
      {
        answer:
          "Open Graph tags, which start with og:, control how a link looks when it is shared on Facebook, LinkedIn, WhatsApp, and many chat apps. X also reads them, so the tool adds only the card type and your handle for X.",
        question: "What are Open Graph tags?",
      },
      {
        answer:
          "The noindex tag asks search engines to keep a page out of their results. Use it for pages such as thank-you pages or drafts. The tool leaves it off by default.",
        question: "What does noindex do?",
      },
    ],
    metaDescription:
      "Free meta tag generator: title, description, canonical, Open Graph and X card tags, with a live search and share preview. Runs in your browser.",
    seoTitle: "Meta Tag Generator with Social Preview",
    steps: [
      "Fill in the page title, the description, and the page address.",
      "Add a share image and your X handle if you have them.",
      "Check the previews and the tips, and fix anything marked in red.",
      "Copy the tags into the head of your page.",
    ],
  },
  "SEO-05": {
    faqs: [
      {
        answer:
          "At the top of your site, so that it opens at yoursite.com/robots.txt. Crawlers look for it there, and only there.",
        question: "Where do I put a robots.txt file?",
      },
      {
        answer:
          "It asks them not to. Well-behaved crawlers such as GPTBot and ClaudeBot follow it, but robots.txt is a request and not a lock, and companies rename their crawlers. The tool can add blocks for the common ones.",
        question: "Does robots.txt stop AI companies using my pages?",
      },
      {
        answer:
          "Not always. robots.txt stops a page being crawled, but Google can still list a blocked address it finds elsewhere. To keep a page out of results, use a noindex tag on a page that crawlers are allowed to reach.",
        question: "Does blocking a page in robots.txt remove it from Google?",
      },
      {
        answer:
          "Up to 50,000 addresses in one sitemap file. For more, split them into several sitemaps and list those in a sitemap index.",
        question: "How many addresses can one sitemap hold?",
      },
    ],
    metaDescription:
      "Free robots.txt generator and XML sitemap maker. Block paths or AI crawlers, list your pages, and download the file. Runs in your browser.",
    seoTitle: "robots.txt and Sitemap Generator",
    steps: [
      "Choose robots.txt or XML sitemap.",
      "For robots.txt, list the paths to block and allow, and any sitemap addresses.",
      "For a sitemap, paste your page addresses, one on each line.",
      "Check the tips, then copy or download the file.",
    ],
  },
  "SEO-07": {
    faqs: [
      {
        answer:
          "A UTM link is an ordinary link with tags added to the end, such as utm_source and utm_medium. Analytics tools read them to show which campaign, email, or post sent each visit.",
        question: "What is a UTM link?",
      },
      {
        answer:
          "Google Analytics expects a source, a medium, and a campaign name. The campaign id, term, and content are optional extras.",
        question: "Which UTM tags are required?",
      },
      {
        answer:
          "Analytics treats Email and email as different values, so reports split in two. Writing everything in lower case, with dashes for spaces, keeps them together.",
        question: "Why should UTM values be in lower case?",
      },
      {
        answer:
          "No. Tags on links inside your own site can reset where a visit is said to come from. Use them on links that bring people to your site from outside, such as emails, ads, and social posts.",
        question: "Should I put UTM tags on links inside my own site?",
      },
    ],
    metaDescription:
      "Free UTM link builder: add source, medium and campaign tags to a link for Google Analytics, with checks for mistakes. Also takes any link apart.",
    seoTitle: "UTM Link Builder and URL Parser",
    steps: [
      "Choose Build a link.",
      "Enter the page address, then a source, a medium, and a campaign name.",
      "Check the tips, then copy the finished link.",
      "To read a link instead, choose Take a link apart and paste it.",
    ],
  },
  "SEO-08": {
    faqs: [
      {
        answer:
          "Schema markup is data in a standard format, called JSON-LD, that describes a page to search engines, such as the questions on it or the price of a product. It can make a result richer.",
        question: "What is schema markup?",
      },
      {
        answer:
          "Paste the whole script tag into the head or the body of the page it describes. Visitors do not see it.",
        question: "Where do I put the JSON-LD?",
      },
      {
        answer:
          "For most sites, no. Since 2023 Google shows FAQ results only for well-known government and health websites. The markup is still valid, and the questions must also be on the page.",
        question: "Will FAQ markup give me rich results?",
      },
      {
        answer:
          "This tool does not add them, on purpose. Ratings and reviews must come from real customers, and marking up ones that are not real breaks Google's rules.",
        question: "Can I add ratings and reviews?",
      },
    ],
    metaDescription:
      "Free schema markup generator: make JSON-LD for FAQ, article, product, local business, organization and breadcrumbs, checked as you type.",
    seoTitle: "Schema Markup Generator (JSON-LD)",
    steps: [
      "Choose the type of markup.",
      "Fill in the form. The tips tell you what is needed.",
      "Fix anything shown in red.",
      "Copy the script tag into the page it describes.",
    ],
  },
  "DEV-01": {
    faqs: [
      {
        answer:
          "Paste it into the input box and choose Format JSON. The tool checks the JSON, then lays it out with indentation you pick, so it is easy to read. If something is wrong, it tells you what and where.",
        question: "How do I make JSON readable?",
      },
      {
        answer:
          "Choose Minify. It removes spaces and line breaks so the JSON is as small as possible, which is useful for sending it or storing it.",
        question: "How do I make JSON smaller?",
      },
      {
        answer:
          "No. Formatting runs in your browser, in a background worker, so your JSON is not uploaded. You can also load an example to see how it works.",
        question: "Is my JSON sent to a server?",
      },
    ],
    metaDescription:
      "Format, minify, and validate JSON online for free. Paste your JSON, pick an indent, and copy a clean result. It runs in your browser, so nothing is uploaded.",
    seoTitle: "JSON Formatter and Validator Online",
    steps: [
      "Paste your JSON into the Input box, or load the example.",
      "Pick how many spaces to indent with.",
      "Choose Format JSON to lay it out, or Minify to make it as small as possible.",
      "Read the Output, then choose Copy result.",
    ],
  },
  "DEV-04": {
    faqs: [
      {
        answer:
          "Base64 is a way of writing any data using only letters, digits, and a few symbols, so it can travel safely through systems built for plain text, such as email and web addresses.",
        question: "What is Base64?",
      },
      {
        answer:
          "Choose Decode, paste the Base64 text, and choose Decode Base64. The result appears as text. If the data is not valid Base64, or does not decode to text, the tool says so.",
        question: "How do I decode a Base64 string?",
      },
      {
        answer:
          "Base64 is an encoding, not encryption. Anyone can decode it, so never use it to protect a secret.",
        question: "Is Base64 secure?",
      },
    ],
    metaDescription:
      "Encode text to Base64 or decode Base64 back to text online for free. It handles Unicode text and runs in your browser, so nothing is uploaded.",
    seoTitle: "Base64 Encoder and Decoder Online",
    steps: [
      "Choose Encode to turn text into Base64, or Decode to turn Base64 back into text.",
      "Type or paste your text into the input box.",
      "Choose Encode text or Decode Base64.",
      "Copy the result.",
    ],
  },
  "DEV-05": {
    faqs: [
      {
        answer:
          "URL encoding, also called percent encoding, replaces characters that are not safe in a web address, such as spaces and symbols, with a percent sign and two digits, so a space becomes %20.",
        question: "What is URL encoding?",
      },
      {
        answer:
          "This tool encodes a URL component, such as a query value or a path segment. That is the part you put inside a link, not the whole link, so characters like slashes and question marks are encoded too.",
        question: "Does it encode a whole URL or just a part?",
      },
      {
        answer: "Choose Decode, paste the encoded text, and choose Decode component. Percent codes turn back into normal characters.",
        question: "How do I decode a URL?",
      },
    ],
    metaDescription:
      "Encode or decode a URL component online for free. Turn spaces and symbols into percent codes, or turn them back. It runs in your browser.",
    seoTitle: "URL Encoder and Decoder Online",
    steps: [
      "Choose Encode or Decode.",
      "Enter the query value, path segment, or encoded text.",
      "Choose Encode component or Decode component.",
      "Copy the result.",
    ],
  },
  "DEV-03": {
    faqs: [
      {
        answer:
          "A UUID is a 128-bit identifier written as 32 hexadecimal digits in groups, such as 123e4567-e89b-42d3-a456-426614174000. They are used as unique IDs for database rows, files, and requests.",
        question: "What is a UUID?",
      },
      {
        answer:
          "They are version 4 UUIDs, which are random. They come from your browser's secure random number generator.",
        question: "Which type of UUID does it make?",
      },
      {
        answer: "You can make up to 100 at once, in lower or upper case, and copy them all in one go.",
        question: "How many UUIDs can I generate at once?",
      },
    ],
    metaDescription:
      "Generate random UUIDs (version 4) online for free. Make up to 100 at a time, in lower or upper case, and copy them in one click.",
    seoTitle: "UUID Generator (v4) Online",
    steps: [
      "Set the Quantity, from 1 to 100.",
      "Turn on Uppercase if you want capital letters.",
      "Generate the UUIDs.",
      "Copy one, or copy them all.",
    ],
  },
  "DEV-02": {
    faqs: [
      {
        answer:
          "A JSON Web Token is a signed string used to prove who someone is. It has three parts separated by dots: a header, a payload with the claims, and a signature.",
        question: "What is a JWT?",
      },
      {
        answer:
          "No. This tool only decodes and shows the header and payload. It does not check the signature, so a decoded token is not proof that the token is genuine. Verify tokens in your own server code.",
        question: "Does the decoder verify the signature?",
      },
      {
        answer:
          "Decoding happens in your browser, so the token is not sent anywhere. Even so, treat live tokens like passwords and avoid pasting ones that grant real access.",
        question: "Is it safe to paste a token here?",
      },
    ],
    metaDescription:
      "Decode a JWT online for free and read its header and payload. It runs in your browser and does not send your token anywhere. It does not verify signatures.",
    seoTitle: "JWT Decoder Online",
    steps: [
      "Paste the whole token, with its three dot-separated parts, into the JWT input.",
      "Read the decoded header, which says how the token was signed.",
      "Read the decoded payload, which holds the claims such as who the token is for and when it expires.",
    ],
  },
  "DEV-08": {
    faqs: [
      {
        answer:
          "A hash is a fixed-length fingerprint made from some data. The same text always gives the same hash, and even a tiny change gives a completely different one, so hashes are used to check that data has not changed.",
        question: "What is a hash?",
      },
      {
        answer:
          "It shows SHA-1, SHA-256, SHA-384, and SHA-512 together. Add an optional secret key to get an HMAC for each one instead.",
        question: "Which hash algorithms does it support?",
      },
      {
        answer:
          "Paste the checksum you were given into Hash to check. The tool tells you which algorithm it matches, ignoring upper and lower case.",
        question: "How do I check a hash I was given?",
      },
    ],
    metaDescription:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes online for free, with optional HMAC, and compare a checksum. It runs in your browser.",
    seoTitle: "Hash Generator: SHA-256, SHA-512 and HMAC",
    steps: [
      "Type or paste your text into Text to hash.",
      "Optionally add a Secret key to make HMACs.",
      "Read the SHA-1, SHA-256, SHA-384, and SHA-512 results, and copy the one you need.",
      "To check a checksum, paste it into Hash to check.",
    ],
  },
  "CAL-01": {
    faqs: [
      {
        answer:
          "Multiply the number by the percentage and divide by 100. For example, 15% of 200 is 200 × 15 ÷ 100, which is 30. Choose the first mode in the calculator and it does this for you.",
        question: "How do I calculate a percentage of a number?",
      },
      {
        answer:
          "Subtract the old value from the new one, divide by the old value, and multiply by 100. Going from 50 to 75 is a 50% increase. Going back from 75 to 50 is a 33.33% decrease, because the change is measured against the starting value.",
        question: "How do I calculate percentage change?",
      },
      {
        answer:
          "Markup is profit as a share of the cost, and margin is profit as a share of the selling price. Something that costs 60 and sells for 100 has a markup of 66.67% and a margin of 40%.",
        question: "What is the difference between margin and markup?",
      },
    ],
    metaDescription:
      "Free percentage calculator: percent of a number, percent change, increase or decrease, discounts and sale price, and margin and markup, with the working shown.",
    seoTitle: "Percentage Calculator",
    steps: [
      "Choose what you want to work out, such as a percentage of a number or a discount.",
      "Enter the two numbers.",
      "Read the answer, which is written out in a sentence, and copy it if you like.",
    ],
  },
  "CAL-05": {
    faqs: [
      {
        answer:
          "Enter the loan amount, the yearly interest rate, and the term. The calculator uses the standard payment formula and shows the monthly payment, the total interest, and the total you pay back.",
        question: "How do I calculate a monthly loan payment?",
      },
      {
        answer:
          "Enter an amount in Extra payment each month. The calculator shows how much interest you save and how much sooner the loan is paid off.",
        question: "How much does paying extra save?",
      },
      {
        answer:
          "Yes. The repayment schedule lists each month's payment, how much goes to principal and interest, and the balance left. You can download the whole schedule as a CSV file.",
        question: "Can I see an amortization schedule?",
      },
    ],
    metaDescription:
      "Free loan calculator: monthly payment, total interest, and a month-by-month repayment schedule you can download as CSV. Works for mortgages and car loans.",
    seoTitle: "Loan Calculator with Repayment Schedule",
    steps: [
      "Enter the Loan amount and the Interest rate per year.",
      "Enter the term in years and months.",
      "Optionally add an Extra payment each month.",
      "Read the monthly payment and totals, and open the repayment schedule.",
    ],
  },
  "CAL-07": {
    faqs: [
      {
        answer:
          "Simple interest is earned only on the starting amount. Compound interest is also earned on the interest already added, so the balance grows faster the longer it runs.",
        question: "What is the difference between simple and compound interest?",
      },
      {
        answer:
          "The more often interest is added, the slightly more you earn. Choose yearly, half-yearly, quarterly, monthly, or daily to see the difference.",
        question: "Does how often interest is added matter?",
      },
      {
        answer:
          "Yes. Enter a Monthly addition and it is added at the end of every month. The table shows your balance year by year, and you can download it as CSV.",
        question: "Can I add money every month?",
      },
    ],
    metaDescription:
      "Free simple and compound interest calculator with monthly additions. See your balance grow year by year and download the table as CSV.",
    seoTitle: "Compound and Simple Interest Calculator",
    steps: [
      "Choose Compound or Simple.",
      "Enter the Starting amount, the yearly rate, and the time.",
      "For compound interest, choose how often interest is added, and add a Monthly addition if you like.",
      "Read the final balance and the year-by-year table.",
    ],
  },
  "CAL-04": {
    faqs: [
      {
        answer:
          "Divide your weight in kilograms by your height in metres, squared. A person who is 1.75 m tall and weighs 70 kg has a BMI of 22.9. The calculator does this for you in kilograms, pounds, or stone, and in centimetres, metres, inches, or feet and inches.",
        question: "How is BMI calculated?",
      },
      {
        answer:
          "The World Health Organization groups adult BMI as underweight below 18.5, healthy from 18.5 to 24.9, overweight from 25 to 29.9, and obesity from 30.",
        question: "What is a healthy BMI?",
      },
      {
        answer:
          "No. BMI is a rough screening number. It does not account for muscle, bone, age, or where weight is carried. For advice about your health, speak to a doctor or dietitian.",
        question: "Is BMI a diagnosis?",
      },
    ],
    metaDescription:
      "Free BMI calculator in kg, lb, or stone, and cm, m, inches, or feet. See your range and the healthy weight for your height. A screening figure, not a diagnosis.",
    seoTitle: "BMI Calculator (kg, lb, cm, ft)",
    steps: [
      "Pick the unit for your height and enter it. For feet and inches, fill in both boxes.",
      "Pick the unit for your weight and enter it.",
      "Read your BMI and the range it falls in, and the healthy weight range for your height.",
    ],
  },
  "CAL-10": {
    faqs: [
      {
        answer:
          "Multiply the bill by the tip percentage, add it to the bill, and divide by the number of people. The calculator does all three steps and shows what each person pays.",
        question: "How do I split a bill with a tip?",
      },
      {
        answer:
          "Turn on Round each share up. Each person's share goes up to the next whole number, and the extra becomes part of the tip. The result shows the tip as a share of the bill so you can see how much it grew.",
        question: "Can I round the amount each person pays?",
      },
      {
        answer: "It has one-tap choices for common tips, and you can type any percentage from 0 to 100.",
        question: "What tip percentage should I use?",
      },
    ],
    metaDescription:
      "Free tip and bill split calculator. Add a tip, divide the total between people, and round each share up to a whole number if you like.",
    seoTitle: "Tip and Bill Split Calculator",
    steps: [
      "Enter the Bill.",
      "Choose a tip with one tap, or type your own.",
      "Enter how many People are sharing.",
      "Read what each person pays, and turn on rounding up if you like.",
    ],
  },
  "DTM-01": {
    faqs: [
      {
        answer:
          "Enter your date of birth. The calculator shows your exact age in years, months, and days, as well as the total months, weeks, and days you have lived.",
        question: "How do I calculate my exact age?",
      },
      {
        answer:
          "Yes. Use Age at date to find someone's age on a past or future date, or leave it empty to use today.",
        question: "Can I find an age on a different date?",
      },
      {
        answer:
          "It shows your next birthday, the weekday it falls on, and how many days remain. Someone born on 29 February has their birthday on 28 February in years that are not leap years.",
        question: "Does it show my next birthday?",
      },
    ],
    metaDescription:
      "Free age calculator: exact age in years, months, and days, plus total days lived and your next birthday. Works for any date of birth.",
    seoTitle: "Age Calculator: Years, Months and Days",
    steps: [
      "Enter the Date of birth.",
      "Optionally enter Age at date to see the age on a different day.",
      "Read the exact age, the totals, and the next birthday.",
    ],
  },
  "DTM-02": {
    faqs: [
      {
        answer:
          "Enter a start date and an end date. The calculator shows the gap in years, months, and days, and also as a total number of days and weeks.",
        question: "How many days are there between two dates?",
      },
      {
        answer:
          "Turn on Include the end date to count both the first and the last day. Leave it off to count the days in between.",
        question: "Should the end date be counted?",
      },
      {
        answer: "Yes. If the start date is after the end date, the tool still gives the gap between them.",
        question: "Does the order of the dates matter?",
      },
    ],
    metaDescription:
      "Free date difference calculator: days between two dates, plus years, months, and weeks. Choose whether to include the end date.",
    seoTitle: "Days Between Dates Calculator",
    steps: [
      "Pick the Start date and the End date.",
      "Choose whether to include the end date.",
      "Read the difference in years, months, and days, and the total days and weeks.",
    ],
  },
  "DTM-04": {
    faqs: [
      {
        answer:
          "Choose Add, pick a start date, and enter the number of days. You can also add weeks, months, and years, in any mix.",
        question: "How do I add days to a date?",
      },
      {
        answer: "Choose Subtract and enter how much to take away. It works the same way, counting backwards.",
        question: "How do I subtract days from a date?",
      },
      {
        answer: "Leave the start date empty and the calculator uses today.",
        question: "Can I start from today?",
      },
    ],
    metaDescription:
      "Add or subtract days, weeks, months, and years from any date online for free. Find a deadline or a date in the past in seconds.",
    seoTitle: "Add or Subtract Days from a Date",
    steps: [
      "Choose Add or Subtract.",
      "Pick the Start date, or leave it empty for today.",
      "Enter the years, months, weeks, and days.",
      "Read the resulting date.",
    ],
  },
  "DTM-06": {
    faqs: [
      {
        answer:
          "Enter the start and end times of the shift and the break in minutes. The calculator subtracts the break and shows the hours and minutes worked, and the same figure as decimal hours.",
        question: "How do I calculate hours worked?",
      },
      {
        answer:
          "Yes. If the end time is earlier than the start time, the tool treats the shift as running past midnight.",
        question: "Does it work for night shifts?",
      },
      {
        answer: "It shows decimal hours, such as 7.5, which many payroll systems ask for.",
        question: "Can I get the hours as a decimal?",
      },
      {
        answer:
          "Yes. Work out each shift, press Add shift to week, and the tool keeps a running total. You can copy the list as text or download it as a CSV for a spreadsheet or timesheet.",
        question: "Can I add up a week of shifts?",
      },
    ],
    metaDescription:
      "Free hours worked calculator: get hours and minutes plus decimal hours for a shift, handle overnight shifts, and total a week. Copy or download a CSV.",
    seoTitle: "Hours Worked Calculator",
    steps: [
      "Enter the Start time and End time.",
      "Enter the Break in minutes.",
      "Read the time worked, and the decimal hours.",
      "To total a week, press Add shift to week for each shift, then copy or download the list.",
    ],
  },
  "DTM-08": {
    faqs: [
      {
        answer:
          "A Unix timestamp is the number of seconds that have passed since 1 January 1970 at 00:00 UTC. Programmers use it to store a moment in time as a single number.",
        question: "What is a Unix timestamp?",
      },
      {
        answer:
          "Choose Timestamp to date, paste the number, and read the date and time. Pick UTC or your own time zone to see it in the zone you need.",
        question: "How do I convert a timestamp to a date?",
      },
      {
        answer:
          "Choose Date to timestamp, enter a date and time, and choose the time zone that date is in. The tool gives the timestamp.",
        question: "How do I convert a date to a timestamp?",
      },
    ],
    metaDescription:
      "Convert Unix timestamps to dates and dates to timestamps online for free, in UTC or your own time zone. It runs in your browser.",
    seoTitle: "Unix Timestamp Converter",
    steps: [
      "Choose Date to timestamp or Timestamp to date.",
      "Enter the timestamp, or pick the date and time and its time zone.",
      "Read and copy the result.",
    ],
  },
  "DTM-11": {
    faqs: [
      {
        answer:
          "Excel stores dates as serial numbers, counting days from 1 January 1900 in its Windows system. A cell shows a number when it is not formatted as a date, and this tool turns that number into a date.",
        question: "Why does Excel show a number instead of a date?",
      },
      {
        answer:
          "Choose Excel number to date and enter the serial number. Choose Windows (1900) or Mac (1904) to match the file, since the two systems count from different start dates.",
        question: "How do I convert an Excel serial number to a date?",
      },
      {
        answer:
          "Choose Date to Excel number and pick the date. Add a time if you want, and it is added as a fraction of a day.",
        question: "How do I convert a date to an Excel number?",
      },
    ],
    metaDescription:
      "Convert Excel serial numbers to dates and dates to Excel numbers online for free. Supports the Windows 1900 and Mac 1904 date systems.",
    seoTitle: "Excel Date Converter: Serial Number to Date",
    steps: [
      "Choose Excel number to date or Date to Excel number.",
      "Pick the Excel date system, Windows (1900) or Mac (1904).",
      "Enter the serial number, or the date and optional time.",
      "Copy the result.",
    ],
  },
  "TXT-01": {
    faqs: [
      {
        answer:
          "Paste or type your text and the word count updates as you go, along with characters, sentences, paragraphs, and an estimate of reading and speaking time.",
        question: "How do I count the words in my text?",
      },
      {
        answer:
          "The most used words table lists the words you repeat most. Turn on the option to ignore common words such as the, and, and of to see the meaningful ones.",
        question: "Can I see which words I use most?",
      },
      {
        answer:
          "Yes. The count happens in your browser as you type, so your text is not uploaded or stored.",
        question: "Is my text kept private?",
      },
    ],
    metaDescription:
      "Free word counter: count words, characters, sentences, and paragraphs, see reading time, and find your most used words. Your text stays in your browser.",
    seoTitle: "Word Counter: Words, Characters, Reading Time",
    steps: [
      "Type or paste your text into the box.",
      "Read the counts, which update as you type.",
      "Check the most used words, and turn on the option to leave out common words.",
    ],
  },
  "TXT-02": {
    faqs: [
      {
        answer:
          "Paste your text and read the Characters figure, which includes spaces. A separate figure shows the count without spaces.",
        question: "How do I count characters with and without spaces?",
      },
      {
        answer:
          "Choose a Character limit, such as X post, SMS, Instagram caption, LinkedIn post, YouTube title, page title, or meta description. A bar shows how much of the limit you have used.",
        question: "Can I check a platform's character limit?",
      },
      {
        answer:
          "It also shows the size in UTF-8 bytes, which differs from the character count when you use emoji or non-English letters.",
        question: "Why is the byte size different from the character count?",
      },
    ],
    metaDescription:
      "Free character counter with and without spaces. Check limits for X, SMS, Instagram, LinkedIn, YouTube titles, page titles, and meta descriptions.",
    seoTitle: "Character Counter with Platform Limits",
    steps: [
      "Type or paste your text.",
      "Read the character count, with and without spaces.",
      "Choose a Character limit to see how much room is left.",
    ],
  },
  "TXT-03": {
    faqs: [
      {
        answer:
          "Paste your text, then pick a style from Convert to, such as UPPERCASE, lowercase, Title Case, or Sentence case. The result is ready to copy.",
        question: "How do I change text to uppercase or lowercase?",
      },
      {
        answer:
          "It also makes programming styles such as camelCase, snake_case, kebab-case, and dot.case, and a web-friendly slug.",
        question: "Does it make camelCase and snake_case?",
      },
      {
        answer: "No. Everything runs in your browser, so your text is not uploaded.",
        question: "Is my text sent anywhere?",
      },
    ],
    metaDescription:
      "Free case converter: change text to uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, or a URL slug.",
    seoTitle: "Case Converter: Uppercase, Lowercase, Title",
    steps: [
      "Type or paste your text.",
      "Choose a style from Convert to.",
      "Copy the converted text.",
    ],
  },
  "TXT-07": {
    faqs: [
      {
        answer:
          "Put one item on each line, paste the list, and choose A to Z. Choose Z to A to reverse it.",
        question: "How do I sort a list alphabetically?",
      },
      {
        answer:
          "Choose Sort by length to put the shortest or longest line first. Turn on Numbers in order so that item 2 comes before item 10.",
        question: "Can I sort by length or put numbers in order?",
      },
      {
        answer:
          "Yes. Turn on Remove duplicates and Remove empty lines to tidy the list while you sort it.",
        question: "Can it remove duplicates while sorting?",
      },
    ],
    metaDescription:
      "Sort a list of lines A to Z, Z to A, by length, or shuffle it. Remove duplicates and empty lines, and sort numbers in order. Free and in your browser.",
    seoTitle: "Sort Lines: Alphabetize a List Online",
    steps: [
      "Paste your list with one item per line.",
      "Choose how to sort, such as A to Z or by length.",
      "Turn on the options you want, such as removing duplicates or empty lines.",
      "Copy the sorted list.",
    ],
  },
  "TXT-08": {
    faqs: [
      {
        answer:
          "Paste your list with one item per line and choose Remove duplicates. Only the first copy of each line is kept, in the original order.",
        question: "How do I remove duplicate lines?",
      },
      {
        answer:
          "Choose Keep only unique lines to drop anything that repeats, or Keep only repeated lines to find the duplicates.",
        question: "Can I find which lines are duplicated?",
      },
      {
        answer:
          "Turn off Match case to treat Apple and apple as one line, and turn on Ignore spaces at the ends so a stray space does not make two lines look different.",
        question: "Does case and spacing matter?",
      },
    ],
    metaDescription:
      "Remove duplicate lines from a list online for free. Keep unique lines, find repeats, and ignore case and extra spaces. Runs in your browser.",
    seoTitle: "Remove Duplicate Lines from Text",
    steps: [
      "Paste your list with one item per line.",
      "Choose what to keep: remove duplicates, only unique lines, or only repeated lines.",
      "Set whether case and spaces at the ends should matter.",
      "Copy the cleaned list.",
    ],
  },
  "IMG-01": {
    faqs: [
      {
        answer:
          "Choose your images, pick an output format, and lower the quality slider. The tool shows the size before and after for each file, and you can download one image or all of them as a zip.",
        question: "How do I make an image smaller?",
      },
      {
        answer:
          "Switch Make files smaller by to Target size, enter the size in KB, and choose WebP or JPEG. Each image is saved at the highest quality that stays under that size, and the card says which quality was used.",
        question: "How do I compress an image to a specific file size, like 200 KB?",
      },
      {
        answer:
          "Yes. Pick PNG, JPEG, or WebP as the Output format and the images are converted. For transparent areas going to JPEG, you choose the colour to fill them with.",
        question: "Can I convert PNG to JPG, or to WebP?",
      },
      {
        answer:
          "No. The images are processed in your browser and never leave your device.",
        question: "Are my images uploaded?",
      },
    ],
    metaDescription:
      "Compress images and convert between JPG, PNG, and WebP online for free. Set a quality or fit a target size in KB. Nothing is uploaded.",
    seoTitle: "Image Compressor: JPG, PNG, WebP Converter",
    steps: [
      "Choose images, or drop them anywhere on the page.",
      "Pick the Output format, WebP or JPEG for the smallest files.",
      "Set the quality, or switch to Target size and enter the size you need in KB.",
      "Optionally set a Maximum width.",
      "Check the sizes, then download one image or all as a zip.",
    ],
  },
  "IMG-02": {
    faqs: [
      {
        answer:
          "Choose an image, then resize by Pixels or Percent. Keep proportions on so the height changes when you change the width.",
        question: "How do I resize an image?",
      },
      {
        answer:
          "Turn on Crop the image and drag the box, or enter the exact crop size. You can pick a shape such as square, or crop freely.",
        question: "How do I crop an image?",
      },
      {
        answer:
          "Yes. Rotate left or right, flip horizontally or vertically, or choose from common sizes for social media and screens.",
        question: "Can I rotate or flip it too?",
      },
    ],
    metaDescription:
      "Resize, crop, rotate, and flip images online for free. Set exact pixels or a percentage, choose common sizes, and save as JPG, PNG, or WebP.",
    seoTitle: "Image Resizer and Cropper Online",
    steps: [
      "Choose an image.",
      "Pick Resize by Pixels or Percent, or choose a common size.",
      "Optionally turn on Crop the image, rotate, or flip.",
      "Choose the format in Save as, and download.",
    ],
  },
  "IMG-12": {
    faqs: [
      {
        answer:
          "A favicon is the small icon shown in a browser tab, in bookmarks, and in search results. It helps people spot your site.",
        question: "What is a favicon?",
      },
      {
        answer:
          "Choose your logo or any image. The tool makes a real favicon.ico, the PNG sizes browsers and phones ask for (from 16 to 512 pixels, including the Apple touch icon), a web manifest, and the tags to paste into your page, all in one zip.",
        question: "Which files does it make?",
      },
      {
        answer:
          "Choose Crop to square to fill the icon, or Fit whole picture to keep all of it with space around it. You can also set a background colour.",
        question: "How do I make a non-square logo fit?",
      },
    ],
    metaDescription:
      "Make a favicon.ico, app icons, and the HTML tags from any image online for free. Includes an Apple touch icon and a web manifest, as one zip.",
    seoTitle: "Favicon Generator: favicon.ico and App Icons",
    steps: [
      "Choose your logo or image.",
      "Pick how it fits: crop to square or fit the whole picture.",
      "Set a background and a site name if you like.",
      "Download the zip, and paste the tags into your page.",
    ],
  },
  "GEN-01": {
    faqs: [
      {
        answer:
          "Choose what to generate, set the length, and pick which kinds of characters to use. The tool makes the password in your browser using its secure random number generator.",
        question: "How do I generate a strong password?",
      },
      {
        answer:
          "A passphrase joins random words, which are easier to remember and still strong. A password is a random mix of characters, which is shorter for the same strength.",
        question: "What is the difference between a password and a passphrase?",
      },
      {
        answer:
          "Yes. It runs in your browser and nothing is sent anywhere. Keep what you generate in a password manager.",
        question: "Is the generated password private?",
      },
    ],
    metaDescription:
      "Generate strong random passwords, passphrases, PINs, and tokens online for free. You control length and characters, and nothing leaves your browser.",
    seoTitle: "Strong Password Generator",
    steps: [
      "Choose what to generate: a password, passphrase, PIN, or token.",
      "Set the length and the kinds of characters.",
      "Generate, then copy the result into your password manager.",
    ],
  },
  "GEN-02": {
    faqs: [
      {
        answer:
          "Choose Web address, paste your link, and the code appears as you type. You can change its colours and download it as a PNG or an SVG.",
        question: "How do I make a QR code for a link?",
      },
      {
        answer:
          "Choose Wi-Fi network, enter the network name, the password, and the security type. Anyone who scans the code can join without typing the password.",
        question: "How do I make a Wi-Fi QR code?",
      },
      {
        answer:
          "Besides links and Wi-Fi, it makes codes for text, email, phone numbers, text messages, WhatsApp messages, and contact cards.",
        question: "What else can I put in a QR code?",
      },
    ],
    metaDescription:
      "Make QR codes for links, Wi-Fi, contact cards, email, phone, SMS, and WhatsApp online for free. Choose colours and download. Made in your browser.",
    seoTitle: "QR Code Generator: Link, Wi-Fi, Contact",
    steps: [
      "Choose what the code is for, such as a web address or a Wi-Fi network.",
      "Fill in the details.",
      "Pick colours and an error correction level if you like.",
      "Download the QR code as a PNG or SVG.",
    ],
  },
  "GEN-03": {
    faqs: [
      {
        answer:
          "Choose Numbers, set the smallest and largest, and how many you want. Turn on No repeats to draw each number at most once.",
        question: "How do I pick random numbers?",
      },
      {
        answer:
          "Choose Dice and coin to roll dice, with the number of sides you set, or flip coins. Choose List picker to pick winners from a list of names.",
        question: "Can it roll dice, flip a coin, or pick a winner?",
      },
      {
        answer:
          "Yes. In List picker choose Make teams, then set the number of teams or the team size.",
        question: "Can it split people into teams?",
      },
    ],
    metaDescription:
      "Random number generator, dice roller, coin flip, list picker, and team maker online for free. Pick winners and split groups fairly in your browser.",
    seoTitle: "Random Number Generator, Dice and Picker",
    steps: [
      "Choose Numbers, Dice and coin, or List picker.",
      "Set the options, such as the range, the number of dice, or your list of names.",
      "Generate the result, and copy it.",
    ],
  },
};

/**
 * Finds the extra content for a tool, if it has any.
 */
export function getToolContent(toolId: string): ToolContent | undefined {
  return TOOL_CONTENT[toolId];
}
