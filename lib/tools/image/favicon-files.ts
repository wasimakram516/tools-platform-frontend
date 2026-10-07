export interface FaviconFile {
  /** What the file is for, in plain words. */
  description: string;
  fileName: string;
  size: number;
}

/** The PNG icons to make, with the file names browsers and phones look for. */
export const FAVICON_FILES: readonly FaviconFile[] = [
  { description: "Browser tab, small", fileName: "favicon-16x16.png", size: 16 },
  { description: "Browser tab, sharp screens", fileName: "favicon-32x32.png", size: 32 },
  { description: "Windows shortcuts and search results", fileName: "favicon-48x48.png", size: 48 },
  { description: "iPhone and iPad home screen", fileName: "apple-touch-icon.png", size: 180 },
  { description: "Android home screen", fileName: "android-chrome-192x192.png", size: 192 },
  { description: "Android splash and app stores", fileName: "android-chrome-512x512.png", size: 512 },
];

/** The sizes packed into favicon.ico, which older browsers and some tools still request. */
export const ICO_SIZES = [16, 32, 48] as const;

export const MANIFEST_FILE_NAME = "site.webmanifest";
export const ICO_FILE_NAME = "favicon.ico";
export const MAX_SITE_NAME_CHARACTERS = 45;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Builds the web app manifest that points at the Android icons. The colours fall back to white
 * when they are not a valid six-digit hex value.
 */
export function buildManifest(siteName: string, themeColor: string, backgroundColor: string): string {
  const name = siteName.trim().slice(0, MAX_SITE_NAME_CHARACTERS);

  return `${JSON.stringify(
    {
      background_color: HEX_COLOR.test(backgroundColor) ? backgroundColor : "#ffffff",
      display: "standalone",
      icons: [
        { sizes: "192x192", src: "/android-chrome-192x192.png", type: "image/png" },
        { sizes: "512x512", src: "/android-chrome-512x512.png", type: "image/png" },
      ],
      name,
      short_name: name,
      theme_color: HEX_COLOR.test(themeColor) ? themeColor : "#ffffff",
    },
    null,
    2,
  )}\n`;
}

/**
 * Builds the tags to paste into a page's head so browsers find the icons.
 */
export function buildHtmlSnippet(): string {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="48x48">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    `<link rel="manifest" href="/${MANIFEST_FILE_NAME}">`,
  ].join("\n");
}
