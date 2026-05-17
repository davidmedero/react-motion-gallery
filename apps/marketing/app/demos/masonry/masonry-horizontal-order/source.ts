export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Masonry, type ResponsiveMasonrySpan } from "react-motion-gallery/masonry";
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
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import styles from "./masonry-horizontal-order-demo.module.css";
import { masonryHorizontalOrderSkeletonText } from "./masonry-horizontal-order.skeleton-text.generated";
import {
  MASONRY_HORIZONTAL_ORDER_SKELETON_CACHE_KEY,
  MASONRY_HORIZONTAL_ORDER_SKELETON_ROUTE_KEY,
} from "./cache";

const CARD_MEDIA_RATIOS = {
  shallow: "16 / 10",
  small: "5 / 4",
  medium: "4 / 5",
  large: "3 / 5",
  square: "1 / 1",
} as const;

type DemoItem = {
  displayIndex: number;
  kind: "image" | "video";
  src: string;
  fullscreenSrc?: string;
  poster?: string;
  label: string;
  title: string;
  body: string;
  ratio: string;
  span?: ResponsiveMasonrySpan;
};

const WIDE_ORDER_SPAN = { 0: 1, 720: 2, 1140: 2 } as const;

const ITEMS: DemoItem[] = [
  {
    displayIndex: 1,
    kind: "image",
    src: "https://picsum.photos/id/569/1600/2000",
    fullscreenSrc: "https://picsum.photos/id/569/3200/4000",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: CARD_MEDIA_RATIOS.medium,
    span: WIDE_ORDER_SPAN,
  },
  {
    displayIndex: 2,
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: CARD_MEDIA_RATIOS.small,
  },
  {
    displayIndex: 3,
    kind: "image",
    src: "https://picsum.photos/id/573/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/573/2400/2400",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: CARD_MEDIA_RATIOS.square,
  },
  {
    displayIndex: 4,
    kind: "image",
    src: "https://picsum.photos/id/574/1600/1000",
    fullscreenSrc: "https://picsum.photos/id/574/3200/2000",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: CARD_MEDIA_RATIOS.shallow,
    span: WIDE_ORDER_SPAN,
  },
  {
    displayIndex: 5,
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/7677513-hd_1920_1080_25fps-0.jpg",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: CARD_MEDIA_RATIOS.medium,
  },
  {
    displayIndex: 6,
    kind: "image",
    src: "https://picsum.photos/id/575/1200/1800",
    fullscreenSrc: "https://picsum.photos/id/575/2400/3600",
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
  textId?: string;
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

const MASONRY_HORIZONTAL_ORDER_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "masonryHorizontalOrderItem01Badge",
    title: "masonryHorizontalOrderItem01Title",
    body: "masonryHorizontalOrderItem01Body",
  },
  {
    badge: "masonryHorizontalOrderItem02Badge",
    title: "masonryHorizontalOrderItem02Title",
    body: "masonryHorizontalOrderItem02Body",
  },
  {
    badge: "masonryHorizontalOrderItem03Badge",
    title: "masonryHorizontalOrderItem03Title",
    body: "masonryHorizontalOrderItem03Body",
  },
  {
    badge: "masonryHorizontalOrderItem04Badge",
    title: "masonryHorizontalOrderItem04Title",
    body: "masonryHorizontalOrderItem04Body",
  },
  {
    badge: "masonryHorizontalOrderItem05Badge",
    title: "masonryHorizontalOrderItem05Title",
    body: "masonryHorizontalOrderItem05Body",
  },
  {
    badge: "masonryHorizontalOrderItem06Badge",
    title: "masonryHorizontalOrderItem06Title",
    body: "masonryHorizontalOrderItem06Body",
  },
];

const MASONRY_HORIZONTAL_ORDER_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_HORIZONTAL_ORDER_TEXT_IDS.map((textIds) => ({
    badge: {
      ...masonryHorizontalOrderSkeletonText[textIds.badge]!,
      textId: textIds.badge,
    },
    title: {
      ...masonryHorizontalOrderSkeletonText[textIds.title]!,
      textId: textIds.title,
    },
    body: {
      ...masonryHorizontalOrderSkeletonText[textIds.body]!,
      textId: textIds.body,
    },
  }));

function createHorizontalOrderSkeletonItem(args: {
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

const HORIZONTAL_ORDER_SKELETON_SLOTS = ITEMS.map((item, index) => ({
  span: item.span,
  item: createHorizontalOrderSkeletonItem({
    mediaRatio: item.ratio,
    skeletonText:
      MASONRY_HORIZONTAL_ORDER_SKELETON_TEXT[index] ??
      MASONRY_HORIZONTAL_ORDER_SKELETON_TEXT[0]!,
  }),
}));

const HORIZONTAL_ORDER_SKELETON: MasonrySkeletonSpec = {
  radius: 18,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: "10px 10px 14px",
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createHorizontalOrderSkeletonItem({
      mediaRatio: ITEMS[0]!.ratio,
      skeletonText: MASONRY_HORIZONTAL_ORDER_SKELETON_TEXT[0]!,
    }),
    slots: HORIZONTAL_ORDER_SKELETON_SLOTS,
  },
};

const HORIZONTAL_ORDER_VIDEO_OPTIONS = {
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

const HORIZONTAL_ORDER_FULLSCREEN_VIDEO_OPTIONS = {
  controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
};

function MasonryHorizontalOrderCard(props: {
  item: DemoItem;
  skeletonTextIds: SkeletonTextIds;
}) {
  const { item, skeletonTextIds } = props;

  return (
    <article className={styles.masonryHorizontalCard}>
      <div
        className={styles.masonryHorizontalMedia}
        style={{ aspectRatio: item.ratio }}
      >
        <span
          className={styles.masonryHorizontalIndex}
          aria-label={\`Item \${item.displayIndex}\`}
        >
          {item.displayIndex}
        </span>
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryHorizontalImage}
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
              className={styles.masonryHorizontalVideo}
              style={{ height: "100%" }}
              options={HORIZONTAL_ORDER_VIDEO_OPTIONS}
              alt={item.title}
            />
          </>
        )}
      </div>
      <div className={styles.masonryHorizontalMeta}>
        <span
          className={styles.masonryHorizontalBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {item.label}
        </span>
        <strong
          className={styles.masonryHorizontalTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {item.title}
        </strong>
        <p
          className={styles.masonryHorizontalBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MasonryHorizontalOrderFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        playOnOpen: true,
        options: HORIZONTAL_ORDER_FULLSCREEN_VIDEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryHorizontalOrderDemo(props: {
  horizontalOrderSkeletonCacheSnapshot?: SkeletonCacheSnapshot | null;
}) {
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc!
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
        layout={HORIZONTAL_ORDER_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 1200 }}
        cache={{
          key: MASONRY_HORIZONTAL_ORDER_SKELETON_CACHE_KEY,
          routeKey: MASONRY_HORIZONTAL_ORDER_SKELETON_ROUTE_KEY,
          snapshot: props.horizontalOrderSkeletonCacheSnapshot,
        }}
        masonry={{
          count: ITEMS.length,
          columns: { 0: 1, 720: 2, 1140: 4 },
          gap: { 0: 12, 1140: 18 },
          placement: "horizontalOrder",
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 720: 2, 1140: 4 }}
          gap={{ 0: 12, 1140: 18 }}
          placement="horizontalOrder"
        >
          {ITEMS.map((item, index) => (
          <Masonry.Item
            key={item.kind === "image" ? item.src : item.poster}
            span={item.span}
          >
            <MasonryHorizontalOrderCard
              item={item}
              skeletonTextIds={
                MASONRY_HORIZONTAL_ORDER_TEXT_IDS[index] ??
                MASONRY_HORIZONTAL_ORDER_TEXT_IDS[0]!
              }
            />
          </Masonry.Item>
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonryHorizontalOrderFullscreenAddon />
    </GalleryCore>
  );
}`;
