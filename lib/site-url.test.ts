// @vitest-environment node
import { describe, expect, it } from "vitest";
import { assertPublicSiteUrl, isIndexableDeployment, isLocalSiteUrl } from "@/lib/site-url";

describe("isLocalSiteUrl", () => {
  it("recognises addresses that only work on one computer", () => {
    for (const url of ["http://localhost:3000", "http://127.0.0.1:4000", "http://0.0.0.0", "http://[::1]:3000", "http://app.localhost"]) {
      expect(isLocalSiteUrl(url), url).toBe(true);
    }
  });

  it("accepts a public address", () => {
    expect(isLocalSiteUrl("https://www.quicklysorted.com")).toBe(false);
    expect(isLocalSiteUrl("https://localhost.example.com")).toBe(false);
  });

  it("does not treat something that is not a web address as local", () => {
    expect(isLocalSiteUrl("not a url")).toBe(false);
  });
});

describe("assertPublicSiteUrl", () => {
  it("stops a production deployment that has a local address", () => {
    expect(() => assertPublicSiteUrl("http://localhost:3000", { deployment: "production" })).toThrow(/local address/);
  });

  it("allows a local address everywhere else, so local work and builds keep working", () => {
    expect(() => assertPublicSiteUrl("http://localhost:3000", { deployment: undefined })).not.toThrow();
    expect(() => assertPublicSiteUrl("http://localhost:3000", { deployment: "preview" })).not.toThrow();
    expect(() => assertPublicSiteUrl("http://localhost:3000", { deployment: "development" })).not.toThrow();
  });

  it("allows a public address in production", () => {
    expect(() => assertPublicSiteUrl("https://www.quicklysorted.com", { deployment: "production" })).not.toThrow();
  });
});

describe("isIndexableDeployment", () => {
  it("allows indexing in production and on ordinary hosting", () => {
    expect(isIndexableDeployment({ deployment: "production" })).toBe(true);
    expect(isIndexableDeployment({ deployment: undefined })).toBe(true);
  });

  it("keeps preview and development deployments out of search results", () => {
    expect(isIndexableDeployment({ deployment: "preview" })).toBe(false);
    expect(isIndexableDeployment({ deployment: "development" })).toBe(false);
  });
});
