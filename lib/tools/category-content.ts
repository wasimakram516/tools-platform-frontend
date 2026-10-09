/**
 * The words a category page adds for readers and for search engines.
 */
export interface CategoryContent {
  /** Shown at the top of the page, under the heading. Says what the tools in the category do. */
  intro: string;
  /** The page's description in search results. Kept under about 155 characters. */
  metaDescription: string;
}

/**
 * Content for each available category, keyed by the category's registry id. A test makes sure
 * that every available category has an entry, and that it describes tools that exist.
 */
export const CATEGORY_CONTENT: Readonly<Record<string, CategoryContent>> = {
  calculator: {
    intro:
      "Work out percentages, discounts, margin and markup, loan payments, simple and compound interest, BMI, and how to split a bill with a tip. Each calculator shows its answer as you type, with the working.",
    metaDescription:
      "Free online calculators: percentage, discount, margin, loan and mortgage payments, compound interest, BMI, and tip and bill split. Answers as you type.",
  },
  datetime: {
    intro:
      "Find an exact age, the days between two dates, a date after adding or subtracting time, and the hours worked in a shift. Convert Unix timestamps and Excel date numbers too.",
    metaDescription:
      "Free date and time tools: age calculator, days between dates, add or subtract days, hours worked, Unix timestamp converter, and Excel date converter.",
  },
  developer: {
    intro:
      "Everyday tools for developers: format and validate JSON, encode and decode Base64 and URLs, decode JWTs, generate UUIDs, and create SHA hashes and HMACs. They run in your browser, so what you paste stays on your device.",
    metaDescription:
      "Free developer tools: JSON formatter, Base64 and URL encoder, JWT decoder, UUID generator, and hash generator. They run in your browser.",
  },
  generator: {
    intro:
      "Generate strong passwords, passphrases, PINs, and tokens. Make QR codes for links, Wi-Fi, and contacts. Draw random numbers, roll dice, flip coins, pick winners, and split people into teams.",
    metaDescription:
      "Free generators: strong passwords, QR codes for links and Wi-Fi, random numbers, dice, coin flips, winner picker, and team maker. Made in your browser.",
  },
  image: {
    intro:
      "Compress and convert images between JPG, PNG, and WebP. Resize, crop, rotate, and flip pictures, and turn a logo into a complete favicon set. Images are processed in your browser and are not uploaded.",
    metaDescription:
      "Free image tools: compress and convert JPG, PNG, and WebP, resize and crop, and make favicons. Processed in your browser, so nothing is uploaded.",
  },
  text: {
    intro:
      "Count words and characters, change text case, sort lines, and remove duplicate lines. Handy for writing and editing, for lists, and for checking limits on social posts, page titles, and meta descriptions.",
    metaDescription:
      "Free text tools: word counter, character counter, case converter, sort lines, and remove duplicate lines. Your text stays in your browser.",
  },
};

/**
 * Finds the extra content for a category, if it has any.
 */
export function getCategoryContent(categoryId: string): CategoryContent | undefined {
  return CATEGORY_CONTENT[categoryId];
}
