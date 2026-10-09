// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildUtmUrl, parseUrl, tidyValue, UTM_PRESETS, type UtmInput, type UtmOptions } from "@/lib/tools/seo/utm";

const INPUT: UtmInput = { campaign: "spring sale", content: "", id: "", medium: "email", source: "newsletter", term: "", url: "example.com/offer" };
const OPTIONS: UtmOptions = { lowercase: true, spaces: "dash" };

const url = (input: Partial<UtmInput> = {}, options: Partial<UtmOptions> = {}): string => buildUtmUrl({ ...INPUT, ...input }, { ...OPTIONS, ...options }).url;
const messages = (input: Partial<UtmInput> = {}, options: Partial<UtmOptions> = {}): string[] =>
  buildUtmUrl({ ...INPUT, ...input }, { ...OPTIONS, ...options }).issues.map((issue) => issue.message);

describe("tidyValue", () => {
  it("replaces spaces and changes the letters as the options ask", () => {
    expect(tidyValue("  Spring  Sale ", { lowercase: true, spaces: "dash" })).toBe("spring-sale");
    expect(tidyValue("Spring Sale", { lowercase: false, spaces: "underscore" })).toBe("Spring_Sale");
    expect(tidyValue("Spring Sale", { lowercase: false, spaces: "keep" })).toBe("Spring Sale");
  });
});

describe("buildUtmUrl", () => {
  it("adds the tags and makes up the missing https://", () => {
    expect(url()).toBe("https://example.com/offer?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale");
  });

  it("includes the optional tags in a fixed order", () => {
    expect(url({ content: "banner", id: "123", term: "free tools" })).toBe(
      "https://example.com/offer?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale&utm_id=123&utm_term=free-tools&utm_content=banner",
    );
  });

  it("keeps an existing query and the part after #, and puts the tags between them", () => {
    expect(url({ url: "https://example.com/p?ref=abc&page=2#reviews" })).toBe(
      "https://example.com/p?ref=abc&page=2&utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale#reviews",
    );
  });

  it("replaces tags that were already in the link, and says so", () => {
    const result = buildUtmUrl({ ...INPUT, url: "https://example.com/p?utm_source=old&keep=1" }, OPTIONS);

    expect(result.url).toBe("https://example.com/p?keep=1&utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale");
    expect(result.issues.map((issue) => issue.message)).toContain("The link already had campaign tags. They were replaced with the ones you entered.");
  });

  it("encodes symbols so that they cannot break the link, with %20 for a space", () => {
    expect(url({ campaign: "50% off & more" }, { spaces: "keep" })).toContain("utm_campaign=50%25%20off%20%26%20more");
    expect(url({ campaign: "a/b?c=d" })).toContain("utm_campaign=a%2Fb%3Fc%3Dd");
  });

  it("asks for a source, a medium, and a campaign", () => {
    expect(messages({ source: "" })).toEqual(["Add the source. Google Analytics expects a source, a medium, and a campaign name."]);
    expect(url({ medium: "" })).toBe("");
    expect(messages({ campaign: "  " })[0]).toContain("Add the campaign");
  });

  it("asks for a web page, and refuses other kinds of link", () => {
    expect(messages({ url: "" })[0]).toContain("Enter the page");
    expect(messages({ url: "mailto://x" })[0]).toContain("web pages");
  });

  it("warns about capital letters and spaces when those options are off", () => {
    expect(messages({ source: "Newsletter" }, { lowercase: false })[0]).toContain("capital letters");
    expect(messages({ campaign: "spring sale" }, { lowercase: false, spaces: "keep" })[0]).toContain("has a space");
    expect(messages({ source: "Newsletter" })).toEqual([]);
  });

  it("has presets that name a real source and medium", () => {
    for (const preset of UTM_PRESETS) {
      expect(preset.source).toMatch(/^[a-z]+$/);
      expect(preset.medium).toMatch(/^[a-z]+$/);
    }
  });
});

describe("parseUrl", () => {
  it("breaks a link into its parts and decodes the query", () => {
    const result = parseUrl("https://user@www.example.com:8080/a%20b/c?x=1&y=hello%20world&z#frag");

    expect(result.ok && result.parts).toEqual({
      hash: "frag",
      host: "www.example.com",
      path: "/a b/c",
      port: "8080",
      protocol: "https",
      query: [
        { key: "x", value: "1" },
        { key: "y", value: "hello world" },
        { key: "z", value: "" },
      ],
      username: "user",
      utm: [],
    });
  });

  it("picks out the campaign tags", () => {
    const result = parseUrl("example.com/?utm_source=a&UTM_Medium=b&other=1");

    expect(result.ok && result.parts.utm).toEqual([
      { key: "utm_source", value: "a" },
      { key: "UTM_Medium", value: "b" },
    ]);
  });

  it("points out repeated query names, http, and a user name", () => {
    const result = parseUrl("http://user:pass@example.com/?a=1&a=2");

    expect(result.ok && result.issues.map((issue) => issue.message)).toEqual([
      "The query repeats a. Some sites read only the first or the last one.",
      "This link uses http, which is not secure. Most sites now use https.",
      "This link holds a user name. Do not share links that contain a password.",
    ]);
  });

  it("leaves text that is not valid encoding as it was", () => {
    const result = parseUrl("https://example.com/?x=%E0%A4%A");

    expect(result.ok && result.parts.query[0]?.value).toBe("%E0%A4%A");
  });

  it("explains an address that cannot be read", () => {
    expect(parseUrl("")).toEqual({ message: "Enter a web address to take apart.", ok: false });
    expect(parseUrl("http://")).toMatchObject({ ok: false });
  });

  it("round-trips: parsing a link built by the builder finds the same tags", () => {
    const built = buildUtmUrl(INPUT, OPTIONS).url;
    const parsed = parseUrl(built);

    expect(parsed.ok && parsed.parts.utm.map((pair) => `${pair.key}=${pair.value}`)).toEqual([
      "utm_source=newsletter",
      "utm_medium=email",
      "utm_campaign=spring-sale",
    ]);
  });
});
