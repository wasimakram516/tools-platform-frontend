// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  buildRequests,
  DEFAULT_SITE,
  describeStatus,
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  isAccepted,
  MAX_URLS_PER_REQUEST,
  parseArgs,
  parseSite,
  sitemapUrls,
  submitSitemap,
} from "./indexnow";

const SITE = new URL("https://www.quicklysorted.com");
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.quicklysorted.com/</loc></url>
  <url><loc> https://www.quicklysorted.com/tools/json-formatter </loc></url>
  <url><loc>https://www.quicklysorted.com/tools/json-formatter</loc></url>
  <url><loc>https://www.quicklysorted.com/search?a=1&amp;b=2</loc></url>
  <url><loc>https://quicklysorted.com/elsewhere</loc></url>
  <url><loc>not a url</loc></url>
</urlset>`;

/**
 * A fake fetch that answers the sitemap, the key file, and IndexNow, and records what was sent.
 */
function fakeFetch({ keyBody = INDEXNOW_KEY, sitemapStatus = 200, indexNowStatus = 200, sitemap = SITEMAP } = {}) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith("/sitemap.xml")) {
      return new Response(sitemap, { status: sitemapStatus });
    }

    if (url.endsWith(`/${INDEXNOW_KEY}.txt`)) {
      return new Response(keyBody, { status: keyBody ? 200 : 404 });
    }

    if (url === INDEXNOW_ENDPOINT && init?.method === "POST") {
      return new Response(null, { status: indexNowStatus });
    }

    throw new Error(`Unexpected request to ${url}`);
  });
}

describe("IndexNow key file", () => {
  it("is served from public/ with the same value the script sends", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, "utf8").trim()).toBe(INDEXNOW_KEY);
  });
});

describe("parseSite", () => {
  it("accepts a public https address and keeps only its origin", () => {
    expect(parseSite("https://www.quicklysorted.com/some/page").data?.href).toBe("https://www.quicklysorted.com/");
  });

  it.each(["nonsense", "http://www.quicklysorted.com", "https://localhost:3000", "https://127.0.0.1"])("refuses %s", (site) => {
    const result = parseSite(site);

    expect(result.status).toBe("error");
    expect(result.error?.code).toBe("INVALID_SITE");
  });
});

describe("sitemapUrls", () => {
  it("reads every address on the host once, trimmed and decoded", () => {
    expect(sitemapUrls(SITEMAP, SITE.host)).toEqual([
      "https://www.quicklysorted.com/",
      "https://www.quicklysorted.com/tools/json-formatter",
      "https://www.quicklysorted.com/search?a=1&b=2",
    ]);
  });
});

describe("buildRequests", () => {
  it("names the host and the key file, and splits large lists", () => {
    const urls = Array.from({ length: MAX_URLS_PER_REQUEST + 1 }, (_, index) => `https://www.quicklysorted.com/p${index}`);
    const requests = buildRequests(SITE, urls);

    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({
      host: "www.quicklysorted.com",
      key: INDEXNOW_KEY,
      keyLocation: `https://www.quicklysorted.com/${INDEXNOW_KEY}.txt`,
    });
    expect(requests[0]?.urlList).toHaveLength(MAX_URLS_PER_REQUEST);
    expect(requests[1]?.urlList).toEqual([urls.at(-1)]);
  });
});

describe("response codes", () => {
  it("accepts 200 and 202 only, and explains each code", () => {
    expect([200, 202].every(isAccepted)).toBe(true);
    expect([400, 403, 422, 429, 500].some(isAccepted)).toBe(false);
    expect(describeStatus(403)).toMatch(/key/);
    expect(describeStatus(418)).toBe("Unexpected response 418.");
  });
});

describe("parseArgs", () => {
  it("defaults to the live site and reads --dry-run and --site", () => {
    expect(parseArgs([])).toEqual({ dryRun: false, site: DEFAULT_SITE });
    expect(parseArgs(["--dry-run", "--site=https://example.com"])).toEqual({ dryRun: true, site: "https://example.com" });
  });
});

describe("submitSitemap", () => {
  const quiet = (): void => undefined;

  it("submits every address on the site in one request", async () => {
    const fetcher = fakeFetch();
    const result = await submitSitemap("https://www.quicklysorted.com", { fetcher, log: quiet });

    expect(result).toMatchObject({ data: { submitted: 3 }, status: "success" });

    const [, init] = fetcher.mock.calls.at(-1) ?? [];
    const body = JSON.parse(String(init?.body)) as { host: string; urlList: string[] };

    expect(body.host).toBe("www.quicklysorted.com");
    expect(body.urlList).toHaveLength(3);
  });

  it("sends nothing on a dry run", async () => {
    const fetcher = fakeFetch();
    const result = await submitSitemap("https://www.quicklysorted.com", { dryRun: true, fetcher, log: quiet });

    expect(result).toMatchObject({ data: { submitted: 0 }, status: "success" });
    expect(fetcher.mock.calls.some(([url]) => String(url) === INDEXNOW_ENDPOINT)).toBe(false);
  });

  it.each([
    ["an invalid site", "http://localhost", {}, "INVALID_SITE"],
    ["a missing sitemap", "https://www.quicklysorted.com", { sitemapStatus: 404 }, "SITEMAP_UNAVAILABLE"],
    ["an empty sitemap", "https://www.quicklysorted.com", { sitemap: "<urlset></urlset>" }, "SITEMAP_EMPTY"],
    ["a key file that is not live", "https://www.quicklysorted.com", { keyBody: "" }, "KEY_FILE_MISSING"],
    ["a key file with the wrong key", "https://www.quicklysorted.com", { keyBody: "other" }, "KEY_FILE_MISSING"],
    ["a refusal from IndexNow", "https://www.quicklysorted.com", { indexNowStatus: 422 }, "INDEXNOW_REJECTED"],
  ])("reports %s", async (_name, site, options, code) => {
    const result = await submitSitemap(site, { fetcher: fakeFetch(options), log: quiet });

    expect(result.status).toBe("error");
    expect(result.error?.code).toBe(code);
  });

  it("reports a network failure instead of throwing", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("offline");
    });
    const result = await submitSitemap("https://www.quicklysorted.com", { fetcher, log: quiet });

    expect(result.error).toEqual({ code: "NETWORK_ERROR", details: "offline" });
  });
});
