/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Masonry,
  toMediaItems,
  useMasonryReady,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { MasonrySkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-masonry";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenLazyLoad } from "../../../../../../packages/react-motion-gallery/src/fullscreen-lazy-load";
import type {
  MasonrySkeletonSpec,
  SkeletonNode,
} from "../../../../../../packages/react-motion-gallery/src/skeleton-masonry";
import styles from "./masonry-lazy-load-demo.module.css";
import { masonryLazyLoadSkeletonText } from "./masonry-lazy-load.skeleton-text.generated";

type SkeletonTextIds = {
  badge: string;
  title: string;
  body: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
  responsiveBy?: "viewport" | "container";
};

type GeneratedSkeletonTextEntry = {
  badge: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

const ITEMS = [
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/603/1200/1680",
    fullscreenSrc: "https://picsum.photos/id/603/2400/3360",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "3 / 5",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/621/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/621/2400/3000",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "4 / 5",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/626/1200/1920",
    fullscreenSrc: "https://picsum.photos/id/626/2400/3840",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "5 / 4",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/629/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/629/2400/3000",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "3 / 5",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/630/1200/1600",
    fullscreenSrc: "https://picsum.photos/id/630/2400/3200",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: "4 / 5",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/638/1200/1380",
    fullscreenSrc: "https://picsum.photos/id/638/2400/2760",
    label: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: "5 / 4",
  },
];

const LAZY_CARD_METRICS = {
  cardGapPx: 12,
  cardPadding: "10px 10px 14px",
  cardRadiusPx: 22,
  mediaRadiusPx: 16,
  metaGapPx: 5,
  metaInlinePadding: "0 4px",
  badge: {
    barHeight: 11.84,
    lineHeight: 1.4,
  },
  title: {
    barHeight: 16.32,
    lineHeight: 1.2,
  },
  body: {
    barHeight: 14.72,
    lineHeight: 1.55,
  },
} as const;

const MASONRY_LAZY_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "masonryLazyItem01Badge",
    title: "masonryLazyItem01Title",
    body: "masonryLazyItem01Body",
  },
  {
    badge: "masonryLazyItem02Badge",
    title: "masonryLazyItem02Title",
    body: "masonryLazyItem02Body",
  },
  {
    badge: "masonryLazyItem03Badge",
    title: "masonryLazyItem03Title",
    body: "masonryLazyItem03Body",
  },
  {
    badge: "masonryLazyItem04Badge",
    title: "masonryLazyItem04Title",
    body: "masonryLazyItem04Body",
  },
  {
    badge: "masonryLazyItem05Badge",
    title: "masonryLazyItem05Title",
    body: "masonryLazyItem05Body",
  },
  {
    badge: "masonryLazyItem06Badge",
    title: "masonryLazyItem06Title",
    body: "masonryLazyItem06Body",
  },
];

const MASONRY_LAZY_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_LAZY_TEXT_IDS.map((textIds) => ({
    badge: masonryLazyLoadSkeletonText[textIds.badge]!,
    title: masonryLazyLoadSkeletonText[textIds.title]!,
    body: masonryLazyLoadSkeletonText[textIds.body]!,
  }));

function createLazySkeletonItem(args: {
  item: (typeof ITEMS)[number];
  skeletonText: GeneratedSkeletonTextEntry;
}): SkeletonNode {
  return {
    kind: "col",
    style: {
      gap: LAZY_CARD_METRICS.cardGapPx,
    },
    children: [
      {
        kind: "rect",
        style: {
          width: "100%",
          aspectRatio: args.item.ratio,
          borderRadius: LAZY_CARD_METRICS.mediaRadiusPx,
        },
      },
      {
        kind: "col",
        style: {
          gap: LAZY_CARD_METRICS.metaGapPx,
          padding: LAZY_CARD_METRICS.metaInlinePadding,
        },
        children: [
          {
            kind: "text",
            barHeight: LAZY_CARD_METRICS.badge.barHeight,
            lineHeight: LAZY_CARD_METRICS.badge.lineHeight,
            ...args.skeletonText.badge,
            style: {
              borderRadius: 999,
            },
          },
          {
            kind: "text",
            barHeight: LAZY_CARD_METRICS.title.barHeight,
            lineHeight: LAZY_CARD_METRICS.title.lineHeight,
            ...args.skeletonText.title,
            style: {
              width: "100%",
            },
          },
          {
            kind: "text",
            barHeight: LAZY_CARD_METRICS.body.barHeight,
            lineHeight: LAZY_CARD_METRICS.body.lineHeight,
            ...args.skeletonText.body,
            style: {
              width: "100%",
            },
          },
        ],
      },
    ],
  };
}

const LAZY_SKELETON: MasonrySkeletonSpec = {
  radius: 18,
  className: styles.masonryRoot,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: LAZY_CARD_METRICS.cardPadding,
      borderRadius: LAZY_CARD_METRICS.cardRadiusPx,
      border: "1px solid rgba(125, 211, 252, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createLazySkeletonItem({
      item: ITEMS[0]!,
      skeletonText: MASONRY_LAZY_SKELETON_TEXT[0]!,
    }),
    slots: ITEMS.map((item, index) => ({
      item: createLazySkeletonItem({
        item,
        skeletonText:
          MASONRY_LAZY_SKELETON_TEXT[index] ??
          MASONRY_LAZY_SKELETON_TEXT[0]!,
      }),
    })),
  },
};

function MasonryLazyCard(props: {
  item: (typeof ITEMS)[number];
  skeletonTextIds: SkeletonTextIds;
}) {
  const { item, skeletonTextIds } = props;

  return (
    <article className={styles.masonryLazyCard}>
      <div
        className={styles.masonryLazyMedia}
        style={{ aspectRatio: item.ratio }}
      >
        <img
          src={item.src}
          alt={item.title}
          className={styles.masonryLazyImage}
        />
      </div>
      <div className={styles.masonryLazyMeta}>
        <span
          className={styles.masonryLazyBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {item.label}
        </span>
        <strong
          className={styles.masonryLazyTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {item.title}
        </strong>
        <p
          className={styles.masonryLazyBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MasonryLazyFullscreenAddon() {
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

export function MasonryLazyLoadDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <MasonrySkeleton
        layout={LAZY_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 2000 }}
        masonry={{
          count: ITEMS.length,
          columns: { 0: 1, 720: 2, 1140: 3 },
          gap: { 0: 12, 1140: 18 },
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 720: 2, 1140: 3 }}
          gap={{ 0: 12, 1140: 18 }}
          lazyLoad={{
            enabled: true,
            spinner: true,
            spinnerClassName: styles.masonryLazySpinner,
          }}
        >
          {ITEMS.map((item, index) => (
          <MasonryLazyCard
            key={item.src}
            item={item}
            skeletonTextIds={
              MASONRY_LAZY_TEXT_IDS[index] ?? MASONRY_LAZY_TEXT_IDS[0]!
            }
          />
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonryLazyFullscreenAddon />
    </GalleryCore>
  );
}
