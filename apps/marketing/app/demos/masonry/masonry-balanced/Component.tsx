/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Masonry,
  Video,
  toMediaItems,
  useMasonryReady,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { MasonrySkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-masonry";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenVideo } from "../../../../../../packages/react-motion-gallery/src/fullscreen-video";
import type {
  MasonrySkeletonSpec,
  SkeletonNode,
} from "../../../../../../packages/react-motion-gallery/src/skeleton-masonry";
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

const ITEMS = [
  {
    displayIndex: 1,
    kind: "image" as const,
    src: "https://picsum.photos/id/546/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/546/2400/3000",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
  {
    displayIndex: 2,
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 3,
    kind: "image" as const,
    src: "https://picsum.photos/id/547/1200/1440",
    fullscreenSrc: "https://picsum.photos/id/547/2400/2880",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
  {
    displayIndex: 6,
    kind: "image" as const,
    src: "https://picsum.photos/id/549/1200/1800",
    fullscreenSrc: "https://picsum.photos/id/549/2400/3600",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: CARD_MEDIA_RATIOS.large,
  },
  {
    displayIndex: 5,
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 4,
    kind: "image" as const,
    src: "https://picsum.photos/id/557/1200/1560",
    fullscreenSrc: "https://picsum.photos/id/557/2400/3120",
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

const BALANCED_SKELETON: MasonrySkeletonSpec = {
  radius: 18,
  className: styles.masonryRoot,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: "10px 10px 14px",
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createBalancedSkeletonItem({
      mediaRatio: ITEMS[0]!.ratio,
      skeletonText: MASONRY_BALANCED_SKELETON_TEXT[0]!,
    }),
    slots: BALANCED_SKELETON_SLOTS,
  },
};

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
  controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
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
          aria-label={`Item ${item.displayIndex}`}
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
              className={styles.masonryBalancedVideo}
              style={{ height: "100%" }}
              options={BALANCED_VIDEO_OPTIONS}
              alt={item.title}
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
        layout={BALANCED_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 2000 }}
        masonry={{
          count: ITEMS.length,
          columns: { 0: 1, 720: 2, 1140: 3 },
          gap: { 0: 12, 1140: 18 },
        }}
        // force={{
        //   enabled: true,
        //   showContent: true
        // }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 720: 2, 1140: 3 }}
          gap={{ 0: 12, 1140: 18 }}
        >
          {ITEMS.map((item, index) => (
          <MasonryBalancedCard
            key={item.kind === "image" ? item.src : item.poster}
            item={item}
            skeletonTextIds={
              MASONRY_BALANCED_TEXT_IDS[index] ?? MASONRY_BALANCED_TEXT_IDS[0]!
            }
          />
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonryBalancedFullscreenAddon />
    </GalleryCore>
  );
}
