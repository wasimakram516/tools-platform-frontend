import { Alert, Stack } from "@mui/material";
import type { ReactNode } from "react";
import type { MetaTagIssue } from "@/lib/tools/seo/meta-tags";

interface IssueListProps {
  issues: readonly MetaTagIssue[];
}

/**
 * Shows the problems and tips that a generator found, with problems first. Changes are
 * announced politely, so someone using a screen reader hears them as they type.
 */
export function IssueList({ issues }: IssueListProps): ReactNode {
  const ordered = [...issues].sort((first, second) => Number(second.level === "error") - Number(first.level === "error"));

  return (
    <Stack aria-live="polite" role="status" sx={{ gap: 1 }}>
      {ordered.map((issue) => (
        <Alert key={`${issue.level}-${issue.message}`} severity={issue.level === "error" ? "error" : "warning"} variant="outlined">
          {issue.message}
        </Alert>
      ))}
    </Stack>
  );
}
