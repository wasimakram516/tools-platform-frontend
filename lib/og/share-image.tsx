import { ImageResponse } from "next/og";
import { BRAND_DOMAIN, BRAND_NAME, BRAND_TAGLINE } from "@/lib/site-config";

/** The size social networks and chat apps show a link preview at. */
export const SHARE_IMAGE_SIZE = { height: 630, width: 1200 } as const;
export const SHARE_IMAGE_TYPE = "image/png";

const BACKGROUND = "#123D2F";
const BRAND_GREEN = "#4FC08D";
const TEXT = "#F2F8F5";
const MUTED = "#C9DDD3";
const PADDING = 80;

interface ShareImageContent {
  /** A short label above the title, such as a category name. */
  eyebrow: string;
  /** What the page is, in a few words. */
  subtitle: string;
  title: string;
}

/**
 * Draws the brand mark: three tiles and a tick, the same shapes as the logo.
 */
function BrandMark({ size }: { size: number }) {
  return (
    <svg height={size} viewBox="0 0 64 64" width={size}>
      <g fill={BRAND_GREEN}>
        <rect height="22" rx="7" width="22" x="4" y="6" />
        <rect height="22" rx="7" width="22" x="4" y="36" />
        <rect height="22" rx="7" width="22" x="34" y="36" />
      </g>
      <path d="M35.5 18 L43.5 26 L60 6.5" fill="none" stroke={BRAND_GREEN} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5" />
    </svg>
  );
}

/**
 * Picks a title size that keeps a long name on two lines.
 */
function titleSize(title: string): number {
  return title.length > 34 ? 64 : title.length > 22 ? 76 : 88;
}

/**
 * Makes the preview picture shown when a page is shared: the brand, what the page is, and the
 * tagline, on the brand's deep green. Used for the home page and for every tool.
 */
export function renderShareImage({ eyebrow, subtitle, title }: ShareImageContent): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, ${BACKGROUND} 0%, #0B2B20 100%)`,
          color: TEXT,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: PADDING,
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
          <BrandMark size={72} />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{BRAND_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: BRAND_GREEN, display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: titleSize(title), fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
          <div style={{ color: MUTED, display: "flex", fontSize: 34, lineHeight: 1.3, maxWidth: 940 }}>{subtitle}</div>
        </div>

        <div style={{ alignItems: "center", color: MUTED, display: "flex", fontSize: 28, justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>{BRAND_TAGLINE}</div>
          <div style={{ display: "flex" }}>{BRAND_DOMAIN}</div>
        </div>
      </div>
    ),
    { ...SHARE_IMAGE_SIZE },
  );
}
