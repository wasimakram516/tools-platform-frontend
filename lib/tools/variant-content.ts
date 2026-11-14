import type { ToolContent } from "@/lib/tools/tool-content";

const IMAGES_STAY_ON_DEVICE = {
  answer: "No. The images are converted by your own browser on your device, so they are never sent anywhere.",
  question: "Are my images uploaded?",
};

/**
 * Search words for the pages made for one job with another tool, keyed by registry id. They are
 * merged into TOOL_CONTENT, so the same tests hold them to the same rules.
 */
export const VARIANT_CONTENT: Readonly<Record<string, ToolContent>> = {
  "IMG-16": {
    faqs: [
      {
        answer:
          "Drop the photo here. The tool saves it as a JPG at several qualities and keeps the highest one that comes in under 100 KB, then shows the new size. If a very large photo still does not fit, set a maximum width such as 1200 pixels, which makes the file much smaller too.",
        question: "How do I reduce a photo to under 100 KB?",
      },
      {
        answer:
          "Only as much as it must. Fitting under a size means lowering the JPG quality, and the tool stops at the highest quality that fits. For a large phone photo, reducing the width first usually keeps it sharper than squeezing the full size.",
        question: "Will the photo look worse?",
      },
      {
        answer:
          "Pick 200 KB or 500 KB, or type any size in kilobytes. Smaller targets need lower quality, so for a very small size such as 20 KB, reduce the width as well.",
        question: "Can I compress to 200 KB, 50 KB, or another size?",
      },
      {
        answer:
          "Not by quality, because PNG is lossless. This page saves as JPG, which suits photos, and fills any transparent areas with white or a colour you pick. To keep transparency, choose WebP instead, which can also be fitted to a size.",
        question: "Can a PNG be compressed to 100 KB?",
      },
      {
        answer: "No. The photo is compressed by your own browser on your device, so it never leaves it.",
        question: "Is my photo uploaded to a server?",
      },
    ],
    metaDescription:
      "Compress a photo to under 100 KB for an online form or upload limit, or to 200 KB, 500 KB or any size. Keeps the best quality that fits. No upload.",
    seoTitle: "Compress Image to 100KB Online, Free",
    steps: [
      "Drop your photos onto the page, or choose them from your device.",
      "The target is already set to 100 KB. Type another size, or pick 200 KB or 500 KB.",
      "Each image is saved at the highest quality that fits under the size.",
      "Download one image, or all of them as a zip.",
    ],
  },
  "IMG-06": {
    faqs: [
      {
        answer:
          "Drop the PNG files here. Each one is saved as a JPG at the quality you set, 80% to start with, and the size before and after is shown. Download them one by one, or all together as a zip.",
        question: "How do I convert PNG to JPG?",
      },
      {
        answer:
          "JPG cannot be transparent, so transparent areas are filled with a solid colour. It is white to start with, and you can choose any other colour before you download.",
        question: "What happens to a transparent background?",
      },
      {
        answer:
          "Photos and screenshots with lots of colour are usually much smaller as JPG, so they upload, send, and load faster. Keep PNG for logos, text, and anything that needs sharp edges or transparency.",
        question: "Why convert PNG to JPG?",
      },
      { answer: "Up to 50 at a time, each up to 50 MB.", question: "How many images can I convert at once?" },
      IMAGES_STAY_ON_DEVICE,
    ],
    metaDescription:
      "Convert PNG to JPG online for free, many images at once. Pick the quality and a fill colour for transparent areas. Runs in your browser, no upload.",
    seoTitle: "PNG to JPG Converter: Batch, No Upload",
    steps: [
      "Drop your PNG images onto the page, or choose them.",
      "JPG is already chosen as the output. Set the quality, or a target file size.",
      "If your images have transparent areas, pick the colour to fill them with.",
      "Download one image, or all of them as a zip.",
    ],
  },
  "IMG-05": {
    faqs: [
      {
        answer:
          "Drop the JPG files here. Each one is saved as a PNG straight away, and you can download them one at a time or together as a zip.",
        question: "How do I convert JPG to PNG?",
      },
      {
        answer:
          "PNG is lossless, so it stores every pixel exactly, while JPG leaves out detail you rarely notice. A photo is often several times larger as PNG. That is normal, and the picture does not get any sharper.",
        question: "Why is my PNG bigger than the JPG?",
      },
      {
        answer:
          "No. Detail that JPG compression removed cannot be brought back. Converting helps when an editor, a website, or a printer asks for PNG, or when you will edit the image many times and do not want it to lose more detail.",
        question: "Does converting to PNG improve the quality?",
      },
      {
        answer:
          "Not with this tool. A JPG has no transparency to keep, so the PNG has the same solid background as the photo.",
        question: "Can I make the background transparent?",
      },
      IMAGES_STAY_ON_DEVICE,
    ],
    metaDescription:
      "Convert JPG or JPEG to PNG online for free, many images at once, and download them singly or as a zip. Runs in your browser, so nothing is uploaded.",
    seoTitle: "JPG to PNG Converter: Batch, No Upload",
    steps: [
      "Drop your JPG images onto the page, or choose them.",
      "PNG is already chosen as the output.",
      "Check the size before and after on each image's card.",
      "Download one image, or all of them as a zip.",
    ],
  },
  "IMG-07": {
    faqs: [
      {
        answer:
          "Drop the WebP files here. Each one is saved as a JPG at the quality you set, and you can download them one by one or together as a zip.",
        question: "How do I convert WebP to JPG?",
      },
      {
        answer:
          "Many websites serve WebP because it is smaller than JPG for the same picture, so an image saved from the web often arrives as WebP. Some older apps, editors, and upload forms still do not accept it, which is when converting to JPG helps.",
        question: "Why do images from websites save as WebP?",
      },
      {
        answer:
          "WebP can be transparent but JPG cannot, so transparent areas are filled with white, or with a colour you choose.",
        question: "What happens to transparent areas?",
      },
      IMAGES_STAY_ON_DEVICE,
    ],
    metaDescription:
      "Convert WebP images to JPG online for free, so they open in any app or upload form. Many at once, with a quality setting. Runs in your browser.",
    seoTitle: "WebP to JPG Converter: Batch, No Upload",
    steps: [
      "Drop your WebP images onto the page, or choose them.",
      "JPG is already chosen as the output. Adjust the quality if you like.",
      "If an image has transparent areas, pick the colour to fill them with.",
      "Download one image, or all of them as a zip.",
    ],
  },
  "IMG-08": {
    faqs: [
      {
        answer:
          "Drop the JPG or PNG files here. Each one is saved as WebP at the quality you set, 80% to start with, and the saving is shown for each file.",
        question: "How do I convert JPG to WebP?",
      },
      {
        answer:
          "Usually. Google, which created WebP, reports lossy WebP files 25 to 34% smaller than JPG at similar quality. Results vary with the picture, so the tool shows the real size of each file before and after.",
        question: "Is WebP smaller than JPG?",
      },
      {
        answer: "Yes. Unlike JPG, WebP can be transparent, so a PNG logo with a transparent background stays transparent.",
        question: "Does WebP keep transparency?",
      },
      {
        answer:
          "Every current major browser shows WebP, including Safari since version 14. Some older desktop apps and upload forms still do not, so keep your originals.",
        question: "Can every browser show WebP?",
      },
      IMAGES_STAY_ON_DEVICE,
    ],
    metaDescription:
      "Convert JPG and PNG images to WebP online for a faster website. Many at once, with sizes before and after. Transparency is kept. Runs in your browser.",
    seoTitle: "JPG and PNG to WebP Converter, No Upload",
    steps: [
      "Drop your JPG or PNG images onto the page, or choose them.",
      "WebP is already chosen as the output. Set the quality, or a target file size.",
      "Compare the size before and after on each image's card.",
      "Download one image, or all of them as a zip.",
    ],
  },
  "CAL-02": {
    faqs: [
      {
        answer:
          "Multiply the price by the percentage and divide by 100 to get the amount off, then take that from the price. For 25% off 80, the amount off is 80 × 25 ÷ 100 = 20, so the sale price is 60.",
        question: "How do I calculate a discount?",
      },
      {
        answer:
          "Apply them one after the other, not added together. 20% off 100 is 80, and a further 10% off 80 is 72, which is 28% off in total, not 30%. Type the first sale price back in as the price for the second step.",
        question: "How do I work out two discounts, such as 20% off and then 10% more?",
      },
      {
        answer:
          "Divide the sale price by what is left after the discount. If something costs 60 after 25% off, 75% is left, so divide 60 by 0.75 to get 80.",
        question: "How do I find the original price from the sale price?",
      },
      {
        answer:
          "No. It works on whatever price you type. If tax is added after the discount, use the Percentage Calculator to increase the sale price by the tax rate.",
        question: "Does it include sales tax or VAT?",
      },
    ],
    metaDescription:
      "Work out the sale price after a percentage discount and how much you save. Type the price and the percent off, and the answer shows as you type.",
    seoTitle: "Discount Calculator: Sale Price and Savings",
    steps: [
      "Type the original price.",
      "Type the discount as a percentage, such as 25 for 25% off.",
      "Read the sale price and how much you save.",
    ],
  },
  "CAL-09": {
    faqs: [
      {
        answer:
          "Both use the same profit. Markup divides it by the cost, and margin divides it by the selling price. A cost of 40 sold at 50 makes a profit of 10, which is a 25% markup but a 20% margin. Margin is always the smaller of the two.",
        question: "What is the difference between margin and markup?",
      },
      {
        answer:
          "Take the cost from the selling price to get the profit, then divide the profit by the selling price and multiply by 100. Selling at 50 something that cost 40 gives 10 ÷ 50 × 100 = 20%.",
        question: "How do I calculate profit margin?",
      },
      {
        answer:
          "Divide the cost by 1 minus the margin as a decimal. For a cost of 70 and a 30% margin, the price is 70 ÷ 0.7 = 100. Choose I want a margin on the price to have it worked out for you.",
        question: "What price gives me a 30% margin?",
      },
      {
        answer:
          "Not a margin. A margin is a share of the price, so it is always below 100%. Markup has no upper limit: selling for 300 something that cost 100 is a 200% markup but a 66.67% margin.",
        question: "Can a margin be more than 100%?",
      },
    ],
    metaDescription:
      "Find profit margin and markup from cost and selling price, or the price to charge for the margin you want. Explains margin versus markup.",
    seoTitle: "Margin Calculator: Profit Margin and Markup",
    steps: [
      "Choose what you know: the cost and the price, the markup you want, or the margin you want.",
      "Type the two numbers.",
      "Read the margin, the markup, the profit, and the selling price.",
    ],
  },
  "CAL-16": {
    faqs: [
      {
        answer:
          "Take the old number from the new one, divide by the old number, and multiply by 100. From 1,200 to 1,500 the change is 300 ÷ 1,200 × 100 = 25%, an increase.",
        question: "How do I calculate percentage change?",
      },
      {
        answer:
          "Because each percentage is of a different starting number. 50 down 20% is 40, but 40 up 20% is only 48. Getting back from 40 to 50 needs a 25% increase.",
        question: "Why does a 20% rise not undo a 20% fall?",
      },
      {
        answer:
          "Percentage change has a direction: it measures from an old value to a new one. Percentage difference compares two values with neither as the start, dividing the gap by their average. This calculator gives percentage change.",
        question: "Is percentage change the same as percentage difference?",
      },
      {
        answer:
          "A change from zero has no percentage, because it would mean dividing by zero. The calculator says so instead of showing a wrong figure.",
        question: "What if the old number is zero?",
      },
      {
        answer:
          "If a rate goes from 4% to 5%, it rose by 1 percentage point, but by 25 percent. Type 4 and 5 here to see the 25%.",
        question: "What is the difference between percent and percentage points?",
      },
    ],
    metaDescription:
      "Find the percentage increase or decrease from one number to another, with the difference and the working. Type the old and new values to see it.",
    seoTitle: "Percentage Increase and Decrease Calculator",
    steps: [
      "Type the old number, the one you start from.",
      "Type the new number.",
      "Read the percentage increase or decrease, and the difference.",
    ],
  },
  "CAL-08": {
    faqs: [
      {
        answer:
          "Interest = principal × rate × time, with the rate as a decimal and the time in years. 10,000 at 5% for 3 years earns 10,000 × 0.05 × 3 = 1,500, for a final balance of 11,500.",
        question: "What is the simple interest formula?",
      },
      {
        answer:
          "Simple interest is paid only on the amount you started with, so it is the same every year. Compound interest is also paid on interest already added, so it grows faster. 10,000 at 5% for 3 years earns 1,500 simple, or 1,576.25 compounded yearly.",
        question: "What is the difference between simple and compound interest?",
      },
      {
        answer:
          "Use the months box, on its own or with years. Eighteen months can be typed as 1 year and 6 months, or as 18 months, and the interest is worked out for one and a half years either way.",
        question: "How do I enter a term in months?",
      },
    ],
    metaDescription:
      "Calculate simple interest from the amount, the yearly rate, and the time, and see the balance each year. Compare with compound interest in one click.",
    seoTitle: "Simple Interest Calculator with Formula",
    steps: [
      "Type the starting amount and the yearly interest rate.",
      "Type the term in years, months, or both.",
      "Read the interest and the final balance, with a row for each year.",
      "Switch to Compound to see how much more compounding would earn.",
    ],
  },
  "DAT-02": {
    faqs: [
      {
        answer:
          "Paste a JSON list of objects. Each object becomes a row, and the keys become the column names in the first row. The CSV appears as you type, ready to copy or download.",
        question: "How do I convert JSON to CSV?",
      },
      {
        answer:
          "With Flatten nested objects on, an object inside an object becomes a column named with dots, such as address.city. Lists are written into one cell as JSON text, because CSV has no way to nest.",
        question: "What happens to nested objects?",
      },
      {
        answer:
          "Every key becomes a column, in the order it first appears, and a row that lacks a key gets an empty cell. Nothing is dropped.",
        question: "What if the objects have different keys?",
      },
      {
        answer:
          "A cell that starts with =, +, -, or @ can run as a formula when the file is opened in a spreadsheet. Protect from formulas puts a quote mark in front of such text so it shows as text. Turn it on for data from outside sources.",
        question: "What does Protect from formulas do?",
      },
    ],
    metaDescription:
      "Convert JSON to CSV online for Excel or Google Sheets. Nested objects become columns, quoted fields are handled, and nothing is uploaded.",
    seoTitle: "JSON to CSV Converter: Flatten Nested Data",
    steps: [
      "Paste a JSON list of objects, or load the example.",
      "Choose the separator and whether to include a header row.",
      "Copy the CSV, or download it to open in a spreadsheet.",
    ],
  },
  "DAT-06": {
    faqs: [
      {
        answer:
          "Paste the JSON and the YAML appears as you type. Objects become indented keys, and lists become lines that start with a dash.",
        question: "How do I convert JSON to YAML?",
      },
      {
        answer:
          "Older YAML readers, which many tools still use, read words such as yes, no, on, and off as true and false. The converter puts them in quotes, so they stay text wherever the file is read.",
        question: "Why are some words put in quotes?",
      },
      {
        answer:
          "JSON has no comments, so there are none to carry over. You can add comments to the YAML afterwards, on lines that start with #.",
        question: "Can I keep comments?",
      },
    ],
    metaDescription:
      "Convert JSON to YAML online for config files, Kubernetes, and CI pipelines. Pick the indentation, sort keys if you like, and copy the result.",
    seoTitle: "JSON to YAML Converter Online",
    steps: [
      "Paste your JSON, or load the example.",
      "Choose the indentation, and whether to sort the keys.",
      "Copy the YAML, or download it as a .yaml file.",
    ],
  },
  "DAT-04": {
    faqs: [
      {
        answer: "Paste the JSON and the XML appears as you type. Each key becomes an element with its value inside.",
        question: "How do I convert JSON to XML?",
      },
      {
        answer:
          "Each item in a list becomes its own element with the list's name, so roles with two values becomes two roles elements, one after the other.",
        question: "What happens to lists?",
      },
      {
        answer:
          "An XML document has exactly one element around everything else. When the JSON has a single key at the top, that key becomes it. Otherwise everything is wrapped in an element called root, or the name you choose.",
        question: "What is the root element?",
      },
      {
        answer:
          "Start the key with @, such as \"@id\": 7, and it is written as an attribute of its element. A #text key becomes the element's own text.",
        question: "Can I make attributes?",
      },
    ],
    metaDescription:
      "Convert JSON to well formed XML online. Choose the root element name and add an XML declaration. Lists become repeated elements. No upload.",
    seoTitle: "JSON to XML Converter Online",
    steps: [
      "Paste your JSON, or load the example.",
      "Set the root element name, and turn on the XML declaration if you need one.",
      "Copy the XML, or download it as a file.",
    ],
  },
  "DEV-16": {
    faqs: [
      {
        answer:
          "A hash function from the SHA-2 family. It turns any input into a 256 bit value, written as 64 hexadecimal characters. The same input always gives the same hash, and changing one character changes it completely.",
        question: "What is SHA-256?",
      },
      {
        answer:
          "No. A hash is not encryption, and there is no key that reverses it. The only way back is to guess inputs and compare hashes, which is why short or common passwords can still be found from their hashes.",
        question: "Can a SHA-256 hash be decrypted?",
      },
      {
        answer:
          "A SHA-256 hash mixed with a secret key. Only someone with the key can make the same value, so services use it to sign webhooks and API requests. Type the key in the secret key box to get it.",
        question: "What is HMAC-SHA256?",
      },
      {
        answer:
          "Usually the text differs in a way you cannot see, such as a line break at the end, an extra space, or another character encoding. This tool hashes the text as UTF-8, exactly as typed.",
        question: "Why does my hash not match another tool's?",
      },
    ],
    metaDescription:
      "Generate a SHA-256 hash of any text, or an HMAC-SHA256 with a secret key, and check it against a checksum. Made on your device, nothing is sent.",
    seoTitle: "SHA-256 Hash Generator and HMAC Online",
    steps: [
      "Type or paste your text. The SHA-256 hash appears as you type.",
      "Add a secret key to get an HMAC-SHA256 instead.",
      "Paste a hash you already have to check whether it matches.",
      "Copy the hash, in lower or upper case.",
    ],
  },
  "GEN-16": {
    faqs: [
      {
        answer:
          "It can be, and it is easier to type and remember. What matters is how it is chosen: words picked at random from a long list are strong, while a phrase you think up, such as a song lyric, is not.",
        question: "Is a passphrase safer than a password?",
      },
      {
        answer:
          "Each word comes from a list of 1,296, so each adds about 10.3 bits of strength. Five words give about 52 bits and six about 62. Use six or more for anything important, such as a password manager's main password.",
        question: "How many words should a passphrase have?",
      },
      {
        answer:
          "From the EFF short word list, made by the Electronic Frontier Foundation for passphrases. Its words are common, easy to spell, and hard to confuse. It is used under the Creative Commons Attribution 3.0 licence.",
        question: "Where do the words come from?",
      },
      {
        answer:
          "No. It is made by your browser's secure random generator on your device, and it is not saved, sent, or logged.",
        question: "Is my passphrase sent or saved anywhere?",
      },
    ],
    metaDescription:
      "Make random word passphrases that are easy to type and hard to guess. Choose the word count, separator, capitals, and a number. Made on your device.",
    seoTitle: "Passphrase Generator: Random Word Passwords",
    steps: [
      "Choose how many words, five to start with.",
      "Pick a separator, and add capitals or a number if a site asks for them.",
      "Copy the passphrase you like. A new set is made each time you change a setting.",
    ],
  },
  "GEN-17": {
    faqs: [
      {
        answer:
          "Type the network name and password, and choose the security, which is WPA for almost every home router. The code appears as you type. Scanning it with a phone camera offers to join the network.",
        question: "How do I make a QR code for my Wi-Fi?",
      },
      {
        answer:
          "The camera app on iPhones since iOS 11 can join Wi-Fi from a QR code, and so can most Android phones since Android 10, from the camera or the Wi-Fi settings. On an older phone, a QR scanner app does the same.",
        question: "Which phones can scan a Wi-Fi QR code?",
      },
      {
        answer:
          "No. The code is made in your browser, so your network name and password never leave your device. Anyone who scans the printed code can read the password, so put it where only guests you trust will see it.",
        question: "Is my Wi-Fi password sent anywhere?",
      },
      {
        answer:
          "Turn on the hidden network option, so the phone looks for the network by name even though the router does not announce it.",
        question: "What if my network is hidden?",
      },
      {
        answer: "The password is stored in the code itself, so print a new code after you change it.",
        question: "What happens when I change my Wi-Fi password?",
      },
    ],
    metaDescription:
      "Make a Wi-Fi QR code that guests scan to join without typing the password. Download PNG or SVG to print. Your password stays on your device.",
    seoTitle: "Wi-Fi QR Code Generator: Share Your Password",
    steps: [
      "Type your network name, exactly as it shows on your devices.",
      "Choose the security type and type the password.",
      "Scan the code with your phone to check that it joins.",
      "Download it as PNG or SVG, and print it.",
    ],
  },
  "GEN-18": {
    faqs: [
      {
        answer:
          "Yes. Each name is drawn with your browser's secure random generator, so every entry is equally likely, and the result cannot be predicted or steered.",
        question: "Is the name picker fair?",
      },
      {
        answer:
          "No. When you pick several winners, each entry can be drawn only once. A name that is on the list twice has two chances, unless you turn on Ignore repeated names.",
        question: "Can the same name win twice?",
      },
      {
        answer:
          "It suits social media giveaways, raffles among friends, and classroom picks. It is not a certified draw, so for a prize draw with legal rules, check what your local rules require.",
        question: "Can I use it for a giveaway?",
      },
      { answer: "Up to 5,000 entries at a time, one per line.", question: "How many names can I add?" },
    ],
    metaDescription:
      "Paste a list of names and pick one or more random winners, with no entry drawn twice. Fair for giveaways and classrooms. Made on your device.",
    seoTitle: "Random Name Picker: Pick a Winner",
    steps: [
      "Paste or type the names, one per line.",
      "Say how many winners to pick.",
      "Press Pick to draw, and Again for a new draw.",
    ],
  },
  "GEN-19": {
    faqs: [
      {
        answer:
          "The list is shuffled with your browser's secure random generator, then dealt out like cards, so team sizes never differ by more than one person.",
        question: "How are the teams kept fair?",
      },
      {
        answer: "Some teams get one extra person. Ten people in three teams makes teams of 4, 3, and 3.",
        question: "What if the names do not divide evenly?",
      },
      {
        answer:
          "Use the number of teams when you know how many groups you need, such as four tables. Use the team size when each group should be a certain size, such as pairs, and the tool makes as many teams as it needs.",
        question: "Should I split by the number of teams or the team size?",
      },
      {
        answer:
          "No, the split is purely random. For balanced teams, make a few mixes and keep one that looks fair, or split strong players into their own list first.",
        question: "Can it balance teams by skill?",
      },
    ],
    metaDescription:
      "Paste a list of names and split them into random, fair teams by the number of teams or the team size. Team sizes differ by one at most.",
    seoTitle: "Random Team Generator: Split Into Groups",
    steps: [
      "Paste or type the names, one per line.",
      "Choose to split by the number of teams or the team size, and type the number.",
      "Press Make teams, and Again for a new mix.",
    ],
  },
  "GEN-20": {
    faqs: [
      {
        answer:
          "Yes. Each roll uses your browser's secure random generator, scaled without bias, so every face is equally likely.",
        question: "Is this dice roller fair?",
      },
      {
        answer:
          "Yes. Set the number of sides to 4, 6, 8, 10, 12, 20, or anything up to 1,000, roll up to 100 dice at once, and add a modifier such as +3.",
        question: "Can I roll a d20 or other dice for games?",
      },
      {
        answer: "Use the coin section to flip one coin, or up to 1,000 at once, and see how many came up heads and tails.",
        question: "How do I flip a coin?",
      },
      {
        answer:
          "It is more even. Real dice can be slightly unbalanced by their shape and how they are thrown. Here, each face has exactly the same chance.",
        question: "Is a virtual dice roll as random as a real one?",
      },
    ],
    metaDescription:
      "Roll one or many dice, from a d4 to a d20 or up to 1,000 sides, or flip coins, and see each result and the total. Fair, secure random rolls.",
    seoTitle: "Dice Roller and Coin Flip: Roll Any Dice",
    steps: [
      "Choose how many dice and how many sides each has.",
      "Roll to see each die and the total.",
      "Use the coin section to flip one coin or many.",
    ],
  },
};
