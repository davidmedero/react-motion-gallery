export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Masonry } from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/masonry";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type {
  MasonrySkeletonSpec,
  SkeletonNode,
} from "react-motion-gallery/skeleton/masonry";
import styles from "./masonry-round-robin-demo.module.css";
import { masonryRoundRobinSkeletonText } from "./masonry-round-robin.skeleton-text.generated";

const CARD_MEDIA_RATIOS = {
  small: "5 / 4",
  medium: "4 / 5",
  large: "3 / 5",
} as const;

const ITEMS = [
  {
    displayIndex: 1,
    kind: "image" as const,
    src: "https://picsum.photos/id/583/1200/1440",
    fullscreenSrc: "https://picsum.photos/id/583/2400/2880",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
  {
    displayIndex: 2,
    kind: "video" as const,
    src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps-0.jpg",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 3,
    kind: "image" as const,
    src: "https://picsum.photos/id/588/1200/1620",
    fullscreenSrc: "https://picsum.photos/id/588/2400/3240",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
  {
    displayIndex: 4,
    kind: "image" as const,
    src: "https://picsum.photos/id/591/1200/1320",
    fullscreenSrc: "https://picsum.photos/id/591/2400/2640",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
  {
    displayIndex: 5,
    kind: "video" as const,
    src: "https://cdn.react-motion-gallery.com/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html/7677513-hd_1920_1080_25fps-0.jpg",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 6,
    kind: "image" as const,
    src: "https://picsum.photos/id/599/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/599/2400/3000",
    label: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
];

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

const MASONRY_ROUND_ROBIN_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "masonryRoundRobinItem01Badge",
    title: "masonryRoundRobinItem01Title",
    body: "masonryRoundRobinItem01Body",
  },
  {
    badge: "masonryRoundRobinItem02Badge",
    title: "masonryRoundRobinItem02Title",
    body: "masonryRoundRobinItem02Body",
  },
  {
    badge: "masonryRoundRobinItem03Badge",
    title: "masonryRoundRobinItem03Title",
    body: "masonryRoundRobinItem03Body",
  },
  {
    badge: "masonryRoundRobinItem04Badge",
    title: "masonryRoundRobinItem04Title",
    body: "masonryRoundRobinItem04Body",
  },
  {
    badge: "masonryRoundRobinItem05Badge",
    title: "masonryRoundRobinItem05Title",
    body: "masonryRoundRobinItem05Body",
  },
  {
    badge: "masonryRoundRobinItem06Badge",
    title: "masonryRoundRobinItem06Title",
    body: "masonryRoundRobinItem06Body",
  },
];

const MASONRY_ROUND_ROBIN_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_ROUND_ROBIN_TEXT_IDS.map((textIds) => ({
    badge: masonryRoundRobinSkeletonText[textIds.badge]!,
    title: masonryRoundRobinSkeletonText[textIds.title]!,
    body: masonryRoundRobinSkeletonText[textIds.body]!,
  }));

function createRoundRobinSkeletonItem(args: {
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

const ROUND_ROBIN_SKELETON_SLOTS = ITEMS.map((item, index) => ({
  item: createRoundRobinSkeletonItem({
    mediaRatio: item.ratio,
    skeletonText:
      MASONRY_ROUND_ROBIN_SKELETON_TEXT[index] ??
      MASONRY_ROUND_ROBIN_SKELETON_TEXT[0]!,
  }),
}));

const ROUND_ROBIN_SKELETON: MasonrySkeletonSpec = {
  radius: 18,
  className: styles.masonryRoot,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: "10px 10px 14px",
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
      height: "100%"
    },
    item: createRoundRobinSkeletonItem({
      mediaRatio: ITEMS[0]!.ratio,
      skeletonText: MASONRY_ROUND_ROBIN_SKELETON_TEXT[0]!,
    }),
    slots: ROUND_ROBIN_SKELETON_SLOTS,
  },
};

const ROUND_ROBIN_VIDEO_OPTIONS = {
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

const ROUND_ROBIN_FULLSCREEN_VIDEO_OPTIONS = {
  controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
};

function MasonryRoundRobinCard(props: {
  item: (typeof ITEMS)[number];
  skeletonTextIds: SkeletonTextIds;
}) {
  const { item, skeletonTextIds } = props;

  return (
    <article className={styles.masonryRoundRobinCard}>
      <div
        className={styles.masonryRoundRobinMedia}
        style={{ aspectRatio: item.ratio }}
      >
        <span
          className={styles.masonryRoundRobinIndex}
          aria-label={\`Item \${item.displayIndex}\`}
        >
          {item.displayIndex}
        </span>
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryRoundRobinImage}
          />
        ) : (
          <>
            <img
              src="/open-fullscreen.png"
              alt="Open fullscreen"
              width="24"
              height="24"
              className={styles.open_fullscreen_icon}
            />
            <Video
              src={item.src}
              poster={item.poster}
              className={styles.masonryRoundRobinVideo}
              style={{ height: "100%" }}
              options={ROUND_ROBIN_VIDEO_OPTIONS}
              alt={item.title}
            />
          </>
        )}
      </div>
      <div className={styles.masonryRoundRobinMeta}>
        <span
          className={styles.masonryRoundRobinBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {item.label}
        </span>
        <strong
          className={styles.masonryRoundRobinTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {item.title}
        </strong>
        <p
          className={styles.masonryRoundRobinBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MasonryRoundRobinFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        playOnOpen: true,
        options: ROUND_ROBIN_FULLSCREEN_VIDEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryRoundRobinDemo() {
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc
        : {
            kind: "video" as const,
            src: item.src,
            poster: item.poster,
          }
    )
  );

  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <MasonrySkeleton
        layout={ROUND_ROBIN_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 1200 }}
        masonry={{
          count: ITEMS.length,
          columns: { 0: 1, 720: 2, 1140: 3 },
          gap: { 0: 12, 1140: 18 },
          placement: "roundRobin",
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 720: 2, 1140: 3 }}
          gap={{ 0: 12, 1140: 18 }}
          placement="roundRobin"
        >
          {ITEMS.map((item, index) => (
          <MasonryRoundRobinCard
            key={item.kind === "image" ? item.src : item.poster}
            item={item}
            skeletonTextIds={
              MASONRY_ROUND_ROBIN_TEXT_IDS[index] ??
              MASONRY_ROUND_ROBIN_TEXT_IDS[0]!
            }
          />
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonryRoundRobinFullscreenAddon />
    </GalleryCore>
  );
}`;
