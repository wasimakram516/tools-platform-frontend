import { Box, Container, Skeleton, Stack } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { CardGrid, type CardGridPreset } from "@/components/ui/card-grid";

const CARD_RADIUS = 10;

interface CardGridSkeletonProps {
  cardHeight: number;
  preset: CardGridPreset;
  count: number;
}

/**
 * Renders placeholder cards in the same grid the loaded page will use.
 */
function CardGridSkeleton({ cardHeight, preset, count }: CardGridSkeletonProps): ReactNode {
  return (
    <CardGrid preset={preset}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          animation="wave"
          height={cardHeight}
          key={index}
          sx={{ borderRadius: `${CARD_RADIUS}px` }}
          variant="rounded"
        />
      ))}
    </CardGrid>
  );
}

interface PageTitleSkeletonProps {
  withIcon?: boolean;
}

/**
 * Mirrors the breadcrumb row, optional icon tile, title, and description of PageTitle.
 */
function PageTitleSkeleton({ withIcon = false }: PageTitleSkeletonProps): ReactNode {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <Skeleton height={22} width={320} />
      <Stack direction="row" sx={{ alignItems: "flex-start", gap: 2.5 }}>
        {withIcon ? (
          <Skeleton height={64} sx={{ flexShrink: 0 }} variant="rounded" width={64} />
        ) : null}
        <Stack sx={{ flexGrow: 1, gap: 1.5 }}>
          <Skeleton height={52} width="min(520px, 80%)" />
          <Skeleton height={24} width="min(680px, 100%)" />
        </Stack>
      </Stack>
    </Stack>
  );
}

/**
 * Gives every loading state one polite status announcement inside the real page frame.
 */
function LoadingFrame({ children }: PropsWithChildren): ReactNode {
  return (
    <PageFrame>
      <Box aria-label="Loading page" role="status">
        {children}
      </Box>
    </PageFrame>
  );
}

/**
 * Loading shape for the home page: centered promise, then the tool grid.
 */
export function HomeLoading(): ReactNode {
  return (
    <LoadingFrame>
      <Container maxWidth="lg" sx={{ pb: 6, pt: { xs: 7, md: 11 } }}>
        <Stack sx={{ alignItems: "center", gap: 2 }}>
          <Skeleton height={64} width="min(680px, 90%)" />
          <Skeleton height={64} width="min(440px, 70%)" />
          <Skeleton height={28} sx={{ mt: 1 }} width="min(560px, 90%)" />
        </Stack>
      </Container>
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <CardGridSkeleton
          cardHeight={176}
          preset="tools"
          count={6}
        />
      </Container>
    </LoadingFrame>
  );
}

/**
 * Loading shape for the categories hub.
 */
export function CategoriesLoading(): ReactNode {
  return (
    <LoadingFrame>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitleSkeleton />
          <CardGridSkeleton
            cardHeight={210}
            preset="categories"
            count={8}
          />
        </Stack>
      </Container>
    </LoadingFrame>
  );
}

/**
 * Loading shape for a single category page.
 */
export function CategoryLoading(): ReactNode {
  return (
    <LoadingFrame>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: { xs: 4, md: 5 } }}>
          <PageTitleSkeleton withIcon />
          <CardGridSkeleton
            cardHeight={176}
            preset="catalog"
            count={5}
          />
        </Stack>
      </Container>
    </LoadingFrame>
  );
}

/**
 * Loading shape for a legal document: title block, then paragraphs of text.
 */
export function LegalLoading(): ReactNode {
  return (
    <LoadingFrame>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack sx={{ gap: 4 }}>
          <PageTitleSkeleton />
          {Array.from({ length: 4 }, (_, index) => (
            <Stack key={index} sx={{ gap: 1 }}>
              <Skeleton height={32} width="min(320px, 70%)" />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} width="80%" />
            </Stack>
          ))}
        </Stack>
      </Container>
    </LoadingFrame>
  );
}

/**
 * Loading shape for a tool page: title block, toolbar, and two editor panels.
 */
export function ToolLoading(): ReactNode {
  return (
    <LoadingFrame>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack sx={{ gap: { xs: 3, md: 4 } }}>
          <PageTitleSkeleton withIcon />
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: `${CARD_RADIUS}px`,
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              sx={{ borderBottom: "1px solid", borderColor: "divider", gap: 1.5, p: 2 }}
            >
              <Skeleton height={40} variant="rounded" width={150} />
              <Skeleton height={40} variant="rounded" width={170} />
            </Stack>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", xl: "repeat(2, 1fr)" },
                p: { xs: 2, md: 3 },
              }}
            >
              <Skeleton animation="wave" height={340} variant="rounded" />
              <Skeleton animation="wave" height={340} variant="rounded" />
            </Box>
          </Box>
        </Stack>
      </Container>
    </LoadingFrame>
  );
}
