import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import type { ReactNode } from "react";
import { LinkChipRow } from "@/components/ui/link-chip-row";
import { guidePath } from "@/lib/guides/guides";
import type { Guide } from "@/lib/guides/guide-types";

interface GuideLinksProps {
  guides: readonly Pick<Guide, "name" | "slug">[];
}

/**
 * A quiet line of links to the guides that explain what a tool does, in the same style as the
 * related tools line.
 */
export function GuideLinks({ guides }: GuideLinksProps): ReactNode {
  return (
    <LinkChipRow
      heading="Guides"
      headingId="tool-guides-heading"
      links={guides.map((guide) => ({ href: guidePath(guide), icon: <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />, label: guide.name }))}
    />
  );
}
