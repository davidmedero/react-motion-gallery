export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from "next/navigation";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { gridLazyLoad } from "react-motion-gallery/grid/lazy-load";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-lazy-load-demo.module.css";
import { gridLazyLoadSkeletonText } from "./grid-lazy-load.skeleton-text.generated";

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
    imageSrc: "https://picsum.photos/id/522/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/522/2400/3000",
    badge: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    imageSrc: "https://picsum.photos/id/523/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/523/2400/3000",
    badge: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    imageSrc: "https://picsum.photos/id/524/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/524/2400/3000",
    badge: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    imageSrc: "https://picsum.photos/id/525/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/525/2400/3000",
    badge: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    imageSrc: "https://picsum.photos/id/537/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/537/2400/3000",
    badge: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
  },
  {
    imageSrc: "https://picsum.photos/id/542/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/542/2400/3000",
    badge: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
  },
  {
    imageSrc: "https://picsum.photos/id/544/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/544/2400/3000",
    badge: "Nulla",
    title: "Neque porro quisquam est",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
  },
  {
    imageSrc: "https://picsum.photos/id/545/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/545/2400/3000",
    badge: "Tempus",
    title: "Temporibus autem quibusdam",
    body: "Et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
  },
];

const GRID_LAZY_LOAD_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "gridLazyLoadItem01Badge",
    title: "gridLazyLoadItem01Title",
    body: "gridLazyLoadItem01Body",
  },
  {
    badge: "gridLazyLoadItem02Badge",
    title: "gridLazyLoadItem02Title",
    body: "gridLazyLoadItem02Body",
  },
  {
    badge: "gridLazyLoadItem03Badge",
    title: "gridLazyLoadItem03Title",
    body: "gridLazyLoadItem03Body",
  },
  {
    badge: "gridLazyLoadItem04Badge",
    title: "gridLazyLoadItem04Title",
    body: "gridLazyLoadItem04Body",
  },
  {
    badge: "gridLazyLoadItem05Badge",
    title: "gridLazyLoadItem05Title",
    body: "gridLazyLoadItem05Body",
  },
  {
    badge: "gridLazyLoadItem06Badge",
    title: "gridLazyLoadItem06Title",
    body: "gridLazyLoadItem06Body",
  },
  {
    badge: "gridLazyLoadItem07Badge",
    title: "gridLazyLoadItem07Title",
    body: "gridLazyLoadItem07Body",
  },
  {
    badge: "gridLazyLoadItem08Badge",
    title: "gridLazyLoadItem08Title",
    body: "gridLazyLoadItem08Body",
  },
];

const GRID_LAZY_LOAD_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  GRID_LAZY_LOAD_TEXT_IDS.map((textIds) => ({
    badge: gridLazyLoadSkeletonText[textIds.badge]!,
    title: gridLazyLoadSkeletonText[textIds.title]!,
    body: gridLazyLoadSkeletonText[textIds.body]!,
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
    GRID_LAZY_LOAD_SKELETON_TEXT[index] ?? GRID_LAZY_LOAD_SKELETON_TEXT[0]!;

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
            lineHeight: 1.2,
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
    plugins: [fullscreenSlider(), fullscreenLazyLoad(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      lazyLoad: {
        images: {
          enabled: true,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridLazyLoadDemo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <GridSkeleton
        layout={CARD_SKELETON}
        ready={gridReady}
        enabled={!showMeasuredContent}
        timing={{ exitMs: 1200 }}
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
          plugins={[
            gridLazyLoad({
              enabled: !showMeasuredContent,
              spinner: true,
              spinnerClassName: styles.spinner,
            }),
          ]}
        >
          {ITEMS.map((item, index) => (
            <GridCard
              key={item.imageSrc}
              imageSrc={item.imageSrc}
              badge={item.badge}
              title={item.title}
              body={item.body}
              skeletonTextIds={GRID_LAZY_LOAD_TEXT_IDS[index]!}
            />
          ))}
        </Grid>
      </GridSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
`;
