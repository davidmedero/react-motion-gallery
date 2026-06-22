export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-min-column-width-demo.module.css";
import { gridMinColumnWidthSkeletonText } from "./grid-min-column-width.skeleton-text.generated";

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
    imageSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&h=3000&q=80",
    badge: "Nulla",
    title: "Neque porro quisquam est",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&h=3000&q=80",
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
        <p
          className={styles.gridBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
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
            barHeight: 11.84,
            lineHeight: 1.5,
            ...skeletonText.badge,
          },
          {
            kind: "text" as const,
            barHeight: 16.8,
            lineHeight: 1.2,
            ...skeletonText.title,
          },
          {
            kind: "text" as const,
            barHeight: 14.72,
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

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        minColumnWidth={220}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        loading={{
          skeleton: CARD_SKELETON,
          timing: { exitMs: 1600 },
        }}
        plugins={[gridFullscreen()]}
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
      <FullscreenAddon />
    </GalleryCore>
  );
}
`;
