export const source = String.raw`/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Masonry } from "react-motion-gallery/masonry";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { Skeleton, type SkeletonNode } from "react-motion-gallery/skeleton/base";
import {
  createMasonryTextWrapSkeletonLayout,
  useMasonryTextWrapLayout,
} from "react-motion-gallery/masonry/text-wrap";
import styles from "./masonry-balanced-demo.module.css";
import { masonryBalancedSkeletonText } from "./masonry-balanced.skeleton-text.generated";

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

const CARD_MEDIA_RATIOS = {
  small: "5 / 4",
  medium: "4 / 5",
  large: "3 / 5",
} as const;

const MASONRY_BALANCED_COLUMNS = { 0: 1, 720: 2, 1140: 3 };
const MASONRY_BALANCED_GAP = { 0: 12, 1140: 18 };

const BALANCED_CARD_METRICS = {
  cardPaddingBlockPx: 24,
  cardPaddingInlinePx: 20,
  cardGapPx: 12,
  metaGapPx: 5,
  metaPaddingInlinePx: 8,
} as const;

const BALANCED_SKELETON_WRAP_STYLE = {
  padding: "10px 10px 14px",
  borderRadius: 22,
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
};

const ITEMS = [
  {
    displayIndex: 1,
    kind: "image" as const,
    src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=3000&q=80",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
  {
    displayIndex: 2,
    kind: "video" as const,
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 3,
    kind: "image" as const,
    src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&h=1440&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=2400&h=2880&q=80",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
  {
    displayIndex: 6,
    kind: "image" as const,
    src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=1800&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&h=3600&q=80",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
  {
    displayIndex: 5,
    kind: "video" as const,
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 4,
    kind: "image" as const,
    src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&h=1560&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=3120&q=80",
    label: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
];

const MASONRY_BALANCED_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "masonryBalancedItem01Badge",
    title: "masonryBalancedItem01Title",
    body: "masonryBalancedItem01Body",
  },
  {
    badge: "masonryBalancedItem02Badge",
    title: "masonryBalancedItem02Title",
    body: "masonryBalancedItem02Body",
  },
  {
    badge: "masonryBalancedItem03Badge",
    title: "masonryBalancedItem03Title",
    body: "masonryBalancedItem03Body",
  },
  {
    badge: "masonryBalancedItem04Badge",
    title: "masonryBalancedItem04Title",
    body: "masonryBalancedItem04Body",
  },
  {
    badge: "masonryBalancedItem05Badge",
    title: "masonryBalancedItem05Title",
    body: "masonryBalancedItem05Body",
  },
  {
    badge: "masonryBalancedItem06Badge",
    title: "masonryBalancedItem06Title",
    body: "masonryBalancedItem06Body",
  },
];

const MASONRY_BALANCED_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_BALANCED_TEXT_IDS.map((textIds) => ({
    badge: masonryBalancedSkeletonText[textIds.badge]!,
    title: masonryBalancedSkeletonText[textIds.title]!,
    body: masonryBalancedSkeletonText[textIds.body]!,
  }));

function createBalancedSkeletonItem(args: {
  mediaRatio: string;
  skeletonText: GeneratedSkeletonTextEntry;
}): SkeletonNode {
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
          aspectRatio: args.mediaRatio,
          borderRadius: 16,
        },
      },
      {
        kind: "col" as const,
        style: {
          gap: 5,
          padding: "0 4px",
        },
        children: [
          {
            kind: "text" as const,
            barHeight: 11.84,
            lineHeight: 1.4,
            ...args.skeletonText.badge,
            style: {
              borderRadius: 999,
            },
          },
          {
            kind: "text" as const,
            barHeight: 16.32,
            lineHeight: 1.2,
            ...args.skeletonText.title,
            style: {
              width: "100%",
            },
          },
          {
            kind: "text" as const,
            barHeight: 14.72,
            lineHeight: 1.55,
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

const BALANCED_SKELETON_SLOTS = [
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[0]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[0]!,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[1]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[1]!,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[2]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[2]!,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[3]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[3]!,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[4]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[4]!,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[5]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[5]!,
    }),
  },
];

function renderBalancedSkeleton(index: number) {
  const slot = BALANCED_SKELETON_SLOTS[index] ?? BALANCED_SKELETON_SLOTS[0]!;

  return (
    <Skeleton
      layout={createMasonryTextWrapSkeletonLayout({
        item: slot.item,
        itemWrapStyle: BALANCED_SKELETON_WRAP_STYLE,
      })}
    />
  );
}

const BALANCED_VIDEO_OPTIONS = {
  autoplay: true,
  preload: "auto",
  muted: true,
  playsinline: true,
  controls: [] as string[],
  fullscreen: {
    enabled: false,
  },
  loop: {
    active: true,
  },
};

const BALANCED_FULLSCREEN_VIDEO_OPTIONS = {
  controls: [
    "play-large",
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "fullscreen",
  ],
};

function MasonryBalancedCard(props: {
  item: (typeof ITEMS)[number];
  skeletonTextIds: SkeletonTextIds;
}) {
  const { item, skeletonTextIds } = props;

  return (
    <article className={styles.masonryBalancedCard}>
      <div
        className={styles.masonryBalancedMedia}
        style={{ aspectRatio: item.ratio }}
      >
        <span
          className={styles.masonryBalancedIndex}
          aria-label={\`Item \${item.displayIndex}\`}
        >
          {item.displayIndex}
        </span>
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryBalancedImage}
          />
        ) : (
          <>
            <Video
              src={item.src}
              poster={item.poster}
              className={styles.masonryBalancedVideo}
              style={{ height: "100%" }}
              options={BALANCED_VIDEO_OPTIONS}
              alt={item.title}
            />
            <button
              type="button"
              className={styles.fullscreen_trigger}
              aria-label={\`Open \${item.title} fullscreen\`}
              data-rmg-fullscreen-trigger
            />
          </>
        )}
      </div>
      <div className={styles.masonryBalancedMeta}>
        <span
          className={styles.masonryBalancedBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {item.label}
        </span>
        <strong
          className={styles.masonryBalancedTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {item.title}
        </strong>
        <p
          className={styles.masonryBalancedBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MasonryBalancedFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        playOnOpen: true,
        options: BALANCED_FULLSCREEN_VIDEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryBalancedDemo() {
  const masonryLayout = useMasonryTextWrapLayout({
    columns: MASONRY_BALANCED_COLUMNS,
    gap: MASONRY_BALANCED_GAP,
    metrics: BALANCED_CARD_METRICS,
  });
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc
        : {
            kind: "video" as const,
            src: item.src,
            poster: item.poster,
          },
    ),
  );

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <Masonry
        rootRef={masonryLayout.rootRef}
        columns={MASONRY_BALANCED_COLUMNS}
        gap={MASONRY_BALANCED_GAP}
        plugins={[masonryFullscreen()]}
        loading={{
          count: ITEMS.length,
          skeleton: ({ index }) => renderBalancedSkeleton(index),
          timing: { exitMs: 1200 },
        }}
      >
        {ITEMS.map((item, index) => {
          const skeletonText =
            MASONRY_BALANCED_SKELETON_TEXT[index] ??
            MASONRY_BALANCED_SKELETON_TEXT[0]!;
          const skeletonTextIds =
            MASONRY_BALANCED_TEXT_IDS[index] ?? MASONRY_BALANCED_TEXT_IDS[0]!;
          const geometry = masonryLayout.getItemGeometry({
            ratio: item.ratio,
            skeletonText,
          });
          const key = item.kind === "image" ? item.src : item.poster;

          return (
            <Masonry.Item
              key={key}
              revealKey={key}
              width={geometry.width}
              height={geometry.height}
              heightOffsetPx={geometry.heightOffsetPx}
            >
              <MasonryBalancedCard
                item={item}
                skeletonTextIds={skeletonTextIds}
              />
            </Masonry.Item>
          );
        })}
      </Masonry>
      <MasonryBalancedFullscreenAddon />
    </GalleryCore>
  );
}
`;
