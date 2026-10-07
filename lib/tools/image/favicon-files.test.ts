// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildHtmlSnippet,
  buildManifest,
  FAVICON_FILES,
  ICO_SIZES,
  MAX_SITE_NAME_CHARACTERS,
} from "@/lib/tools/image/favicon-files";

describe("FAVICON_FILES", () => {
  it("names each icon by its size, and the sizes are unique", () => {
    expect(new Set(FAVICON_FILES.map((file) => file.fileName)).size).toBe(FAVICON_FILES.length);
    expect(new Set(FAVICON_FILES.map((file) => file.size)).size).toBe(FAVICON_FILES.length);

    for (const file of FAVICON_FILES.filter((entry) => entry.fileName !== "apple-touch-icon.png")) {
      expect(file.fileName).toContain(`${file.size}x${file.size}`);
    }
  });

  it("makes every size that goes into favicon.ico", () => {
    for (const size of ICO_SIZES) {
      expect(FAVICON_FILES.some((file) => file.size === size)).toBe(true);
    }
  });
});

describe("buildManifest", () => {
  it("lists the Android icons and the site details as valid JSON", () => {
    const manifest = JSON.parse(buildManifest("  QuicklySorted ", "#1b7f4b", "#ffffff"));

    expect(manifest).toEqual({
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        { sizes: "192x192", src: "/android-chrome-192x192.png", type: "image/png" },
        { sizes: "512x512", src: "/android-chrome-512x512.png", type: "image/png" },
      ],
      name: "QuicklySorted",
      short_name: "QuicklySorted",
      theme_color: "#1b7f4b",
    });
  });

  it("falls back to white for an invalid colour, and limits the name's length", () => {
    const manifest = JSON.parse(buildManifest("x".repeat(100), "green", "#12"));

    expect(manifest.theme_color).toBe("#ffffff");
    expect(manifest.background_color).toBe("#ffffff");
    expect(manifest.name).toHaveLength(MAX_SITE_NAME_CHARACTERS);
  });

  it("ends with a line break", () => {
    expect(buildManifest("a", "#000000", "#000000").endsWith("}\n")).toBe(true);
  });
});

describe("buildHtmlSnippet", () => {
  it("links every icon file and the manifest", () => {
    const snippet = buildHtmlSnippet();

    for (const fileName of ["favicon.ico", "favicon-32x32.png", "favicon-16x16.png", "apple-touch-icon.png", "site.webmanifest"]) {
      expect(snippet).toContain(`/${fileName}`);
    }

    expect(snippet.split("\n")).toHaveLength(5);
  });
});
