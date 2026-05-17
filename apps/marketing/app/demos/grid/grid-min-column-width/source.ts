export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-min-column-width-demo.module.css";
import { gridMinColumnWidthSkeletonText } from "./grid-min-column-width.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type SkeletonTextIds = {
  badge: string;
  title: string;
  body: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
};

type GeneratedSkeletonTextEntry = {
  badge: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

const ITEMS = [
  {
    imageSrc: "https://picsum.photos/id/510/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/510/2400/3000",
    badge: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    imageSrc: "https://picsum.photos/id/511/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/511/2400/3000",
    badge: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    imageSrc: "https://picsum.photos/id/516/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/516/2400/3000",
    badge: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    imageSrc: "https://picsum.photos/id/517/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/517/2400/3000",
    badge: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    imageSrc: "https://picsum.photos/id/518/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/518/2400/3000",
    badge: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
  },
  {
    imageSrc: "https://picsum.photos/id/519/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/519/2400/3000",
    badge: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
  },
  {
    imageSrc: "https://picsum.photos/id/520/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/520/2400/3000",
    badge: "Nulla",
    title: "Neque porro quisquam est",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
  },
  {
    imageSrc: "https://picsum.photos/id/521/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/521/2400/3000",
    badge: "Tempus",
    title: "Temporibus autem quibusdam",
    body: "Et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
  },
];

const GRID_MIN_COLUMN_WIDTH_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "gridMinColumnWidthItem01Badge",
    title: "gridMinColumnWidthItem01Title",
    body: "gridMinColumnWidthItem01Body",
  },
  {
    badge: "gridMinColumnWidthItem02Badge",
    title: "gridMinColumnWidthItem02Title",
    body: "gridMinColumnWidthItem02Body",
  },
  {
    badge: "gridMinColumnWidthItem03Badge",
    title: "gridMinColumnWidthItem03Title",
    body: "gridMinColumnWidthItem03Body",
  },
  {
    badge: "gridMinColumnWidthItem04Badge",
    title: "gridMinColumnWidthItem04Title",
    body: "gridMinColumnWidthItem04Body",
  },
  {
    badge: "gridMinColumnWidthItem05Badge",
    title: "gridMinColumnWidthItem05Title",
    body: "gridMinColumnWidthItem05Body",
  },
  {
    badge: "gridMinColumnWidthItem06Badge",
    title: "gridMinColumnWidthItem06Title",
    body: "gridMinColumnWidthItem06Body",
  },
  {
    badge: "gridMinColumnWidthItem07Badge",
    title: "gridMinColumnWidthItem07Title",
    body: "gridMinColumnWidthItem07Body",
  },
  {
    badge: "gridMinColumnWidthItem08Badge",
    title: "gridMinColumnWidthItem08Title",
    body: "gridMinColumnWidthItem08Body",
  },
];

const GRID_MIN_COLUMN_WIDTH_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  GRID_MIN_COLUMN_WIDTH_TEXT_IDS.map((textIds) => ({
    badge: gridMinColumnWidthSkeletonText[textIds.badge]!,
    title: gridMinColumnWidthSkeletonText[textIds.title]!,
    body: gridMinColumnWidthSkeletonText[textIds.body]!,
  }));

function GridCard(props: {
  imageSrc: string;
  badge: string;
  title: string;
  body: string;
  skeletonTextIds: SkeletonTextIds;
}) {
  const { imageSrc, badge, title, body, skeletonTextIds } = props;

  return (
    <article className={styles.gridCard}>
      <img src={imageSrc} alt={title} className={styles.gridImage} />
      <div className={styles.gridCopy}>
        <span
          className={styles.gridBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {badge}
        </span>
        <strong
          className={styles.gridTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {title}
        </strong>
        <p className={styles.gridBody} data-skeleton-text-id={skeletonTextIds.body}>
          {body}
        </p>
      </div>
    </article>
  );
}

function createCardSkeletonItem(index: number) {
  const skeletonText =
    GRID_MIN_COLUMN_WIDTH_SKELETON_TEXT[index] ??
    GRID_MIN_COLUMN_WIDTH_SKELETON_TEXT[0]!;

  return {
    kind: "col" as const,
    style: {
      gap: 12,
    },
    children: [
      {
        kind: "rect" as const,
        style: {
          width: "100%",
          aspectRatio: "4 / 5",
          borderRadius: 12,
        },
      },
      {
        kind: "col" as const,
        style: {
          gap: 5,
        },
        children: [
          {
            kind: "text" as const,
            barHeight: 13,
            lineHeight: 1.25,
            ...skeletonText.badge,
          },
          {
            kind: "text" as const,
            barHeight: 17,
            lineHeight: 1.22,
            ...skeletonText.title,
          },
          {
            kind: "text" as const,
            barHeight: 15,
            lineHeight: 1.5,
            ...skeletonText.body,
          },
        ],
      },
    ],
  };
}

const CARD_SKELETON: GridSkeletonSpec = {
  radius: 12,
  layout: {
    kind: "grid",
    item: createCardSkeletonItem(0),
    slots: ITEMS.map((_, index) => ({
      item: createCardSkeletonItem(index),
    })),
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridMinColumnWidthDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <GridSkeleton
        cache={demoSkeletonCache("grid-min-column-width")}
        layout={CARD_SKELETON}
        ready={gridReady}
        timing={{ exitMs: 1600 }}
        grid={{
          count: ITEMS.length,
          minColumnWidth: 220,
          gap: { 0: 12, 900: 18 },
        }}
      >
        <Grid
          ref={gridRef}
          minColumnWidth={220}
          gap={{ 0: 12, 900: 18 }}
          fullscreenTrigger="item"
        >
          {ITEMS.map((item, index) => (
            <GridCard
              key={item.imageSrc}
              imageSrc={item.imageSrc}
              badge={item.badge}
              title={item.title}
              body={item.body}
              skeletonTextIds={
                GRID_MIN_COLUMN_WIDTH_TEXT_IDS[index] ??
                GRID_MIN_COLUMN_WIDTH_TEXT_IDS[0]!
              }
            />
          ))}
        </Grid>
      </GridSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
