// @vitest-environment node
import { describe, expect, it } from "vitest";
import OpenGraphImage, { alt, contentType, size } from "@/app/opengraph-image";
import ToolOpenGraphImage, { generateStaticParams, size as toolSize } from "@/app/tools/[toolSlug]/opengraph-image";
import { SHARE_IMAGE_SIZE, SHARE_IMAGE_TYPE } from "@/lib/og/share-image";
import { getTools } from "@/lib/tools/tool-registry";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

/**
 * Reads the first bytes and the size of a rendered picture.
 */
async function inspect(response: Response): Promise<{ bytes: number; start: number[] }> {
  const data = new Uint8Array(await response.arrayBuffer());

  return { bytes: data.length, start: [...data.slice(0, 4)] };
}

describe("share pictures", () => {
  it("describes the home page picture at the size link previews use", () => {
    expect(size).toEqual({ height: 630, width: 1200 });
    expect(contentType).toBe("image/png");
    // The exports are literal, so check that they agree with what the picture is drawn at.
    expect(size).toEqual(SHARE_IMAGE_SIZE);
    expect(toolSize).toEqual(SHARE_IMAGE_SIZE);
    expect(contentType).toBe(SHARE_IMAGE_TYPE);
    expect(alt).toContain("QuicklySorted");
  });

  it("draws the home page picture as a real PNG", async () => {
    const response = OpenGraphImage();

    expect(response.headers.get("content-type")).toContain("image/png");

    const picture = await inspect(response);

    expect(picture.start).toEqual(PNG_SIGNATURE);
    expect(picture.bytes).toBeGreaterThan(5_000);
  }, 60_000);

  it("draws a picture for a tool, with its own name", async () => {
    const response = await ToolOpenGraphImage({ params: Promise.resolve({ toolSlug: "loan-calculator" }) });
    const picture = await inspect(response);

    expect(picture.start).toEqual(PNG_SIGNATURE);
    expect(picture.bytes).toBeGreaterThan(5_000);
  }, 60_000);

  it("still draws a picture for an address that is not a tool, rather than failing", async () => {
    const response = await ToolOpenGraphImage({ params: Promise.resolve({ toolSlug: "nothing-here" }) });

    expect((await inspect(response)).start).toEqual(PNG_SIGNATURE);
  }, 60_000);

  it("prebuilds one picture for every available tool", () => {
    expect(generateStaticParams().map((entry) => entry.toolSlug).sort()).toEqual(
      getTools()
        .filter((tool) => tool.status === "available")
        .map((tool) => tool.slug)
        .sort(),
    );
  });
});
