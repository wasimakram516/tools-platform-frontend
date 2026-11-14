/**
 * Tells IndexNow (Bing, Yandex, Seznam, Naver, and others) about every address in the live
 * sitemap, so new and changed pages are crawled soon instead of whenever the crawler next calls.
 *
 * Run it after a deploy is live:
 *   npm run indexnow             submit every sitemap address
 *   npm run indexnow -- --dry-run  list what would be sent, send nothing
 *   npm run indexnow -- --site=https://www.example.com
 *
 * The key is public by design: IndexNow checks it by reading /<key>.txt on the site, which holds
 * the same value, so a submission can only come from someone who controls the site.
 *
 * It uses Node's own type stripping, so it imports nothing from the app and needs no build step.
 */

import { pathToFileURL } from "node:url";

export const INDEXNOW_KEY = "6623e3ec66438a5e122c35b874f07d5d";
export const DEFAULT_SITE = "https://www.quicklysorted.com";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
/** IndexNow accepts at most this many addresses in one request. */
export const MAX_URLS_PER_REQUEST = 10_000;

export interface IndexNowRequest {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface Result<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
  error?: { code: string; details?: unknown };
}

/** What IndexNow's response codes mean, from its documentation. */
const STATUS_MEANINGS: Readonly<Record<number, string>> = {
  200: "Accepted.",
  202: "Accepted; the key will be checked later.",
  400: "Bad request: the request was not in the expected format.",
  403: "Forbidden: the key file was not found on the site or does not match the key.",
  422: "Unprocessable: some addresses do not belong to the host, or the key does not match.",
  429: "Too many requests: wait before submitting again.",
};

/**
 * Checks that the site is a public https address and returns its origin, such as
 * https://www.quicklysorted.com. Submitting a local or plain http address would be refused.
 */
export function parseSite(site: string): Result<URL> {
  let url: URL;

  try {
    url = new URL(site);
  } catch {
    return { data: null, error: { code: "INVALID_SITE" }, message: `"${site}" is not a web address.`, status: "error" };
  }

  if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
    return { data: null, error: { code: "INVALID_SITE" }, message: `"${site}" must be a public https address.`, status: "error" };
  }

  return { data: new URL(url.origin), message: "Site is valid.", status: "success" };
}

/**
 * Reads every <loc> address from a sitemap, decoding the few XML entities a sitemap may use,
 * keeping only addresses on the given host, without repeats.
 */
export function sitemapUrls(xml: string, host: string): string[] {
  const decode = (text: string): string =>
    text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decode(match[1] ?? ""));

  return [...new Set(urls)].filter((url) => {
    try {
      return new URL(url).host === host;
    } catch {
      return false;
    }
  });
}

/**
 * Splits the addresses into IndexNow requests of at most MAX_URLS_PER_REQUEST each.
 */
export function buildRequests(site: URL, urls: readonly string[], key: string = INDEXNOW_KEY): IndexNowRequest[] {
  const requests: IndexNowRequest[] = [];

  for (let start = 0; start < urls.length; start += MAX_URLS_PER_REQUEST) {
    requests.push({
      host: site.host,
      key,
      keyLocation: `${site.origin}/${key}.txt`,
      urlList: urls.slice(start, start + MAX_URLS_PER_REQUEST),
    });
  }

  return requests;
}

/**
 * Explains an IndexNow response code in words.
 */
export function describeStatus(code: number): string {
  return STATUS_MEANINGS[code] ?? `Unexpected response ${code}.`;
}

/**
 * Tells whether IndexNow accepted a request.
 */
export function isAccepted(code: number): boolean {
  return code === 200 || code === 202;
}

/**
 * Fetches the sitemap, checks the key file is live, and submits every address. Returns how many
 * addresses were sent, or what went wrong. With dryRun it stops before sending anything.
 */
export async function submitSitemap(
  siteText: string,
  { dryRun = false, fetcher = fetch, log = console.log }: { dryRun?: boolean; fetcher?: typeof fetch; log?: (line: string) => void } = {},
): Promise<Result<{ submitted: number }>> {
  const site = parseSite(siteText);

  if (!site.data) {
    return { ...site, data: null };
  }

  try {
    const sitemap = await fetcher(`${site.data.origin}/sitemap.xml`);

    if (!sitemap.ok) {
      return { data: null, error: { code: "SITEMAP_UNAVAILABLE", details: sitemap.status }, message: `The sitemap returned ${sitemap.status}.`, status: "error" };
    }

    const urls = sitemapUrls(await sitemap.text(), site.data.host);

    if (urls.length === 0) {
      return { data: null, error: { code: "SITEMAP_EMPTY" }, message: "The sitemap lists no addresses on this site.", status: "error" };
    }

    const keyFile = await fetcher(`${site.data.origin}/${INDEXNOW_KEY}.txt`);

    if (!keyFile.ok || (await keyFile.text()).trim() !== INDEXNOW_KEY) {
      return {
        data: null,
        error: { code: "KEY_FILE_MISSING" },
        message: `The key file /${INDEXNOW_KEY}.txt is not live yet. Wait for the deploy to finish, then run this again.`,
        status: "error",
      };
    }

    const requests = buildRequests(site.data, urls);

    log(`${urls.length} addresses from ${site.data.origin}/sitemap.xml, in ${requests.length} request(s).`);

    if (dryRun) {
      urls.forEach((url) => log(`  ${url}`));

      return { data: { submitted: 0 }, message: "Dry run: nothing was sent.", status: "success" };
    }

    for (const request of requests) {
      const response = await fetcher(INDEXNOW_ENDPOINT, {
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
      });

      if (!isAccepted(response.status)) {
        return {
          data: null,
          error: { code: "INDEXNOW_REJECTED", details: response.status },
          message: describeStatus(response.status),
          status: "error",
        };
      }

      log(`IndexNow ${response.status}: ${describeStatus(response.status)}`);
    }

    return { data: { submitted: urls.length }, message: `Submitted ${urls.length} addresses.`, status: "success" };
  } catch (error) {
    return {
      data: null,
      error: { code: "NETWORK_ERROR", details: error instanceof Error ? error.message : String(error) },
      message: "Could not reach the site or IndexNow.",
      status: "error",
    };
  }
}

/**
 * Reads the command line options: --dry-run and --site=<address>.
 */
export function parseArgs(argv: readonly string[]): { dryRun: boolean; site: string } {
  const siteArg = argv.find((arg) => arg.startsWith("--site="));

  return { dryRun: argv.includes("--dry-run"), site: siteArg ? siteArg.slice("--site=".length) : DEFAULT_SITE };
}

// Runs only from the command line, not when a test imports the functions above.
const isEntryPoint = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryPoint) {
  const { dryRun, site } = parseArgs(process.argv.slice(2));
  const result = await submitSitemap(site, { dryRun });

  console.log(result.message);
  process.exitCode = result.status === "success" ? 0 : 1;
}
