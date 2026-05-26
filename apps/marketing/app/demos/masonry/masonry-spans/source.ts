export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import {
  Masonry,
  type ResponsiveMasonrySpan,
} from "react-motion-gallery/masonry/measured";
import { useMasonryReady } from "react-motion-gallery/masonry/measured/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/cache/masonry/structured";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type {
  MasonrySkeletonSpec,
  SkeletonNode,
} from "react-motion-gallery/skeleton/cache/masonry/structured";
import type { SkeletonCacheOptions } from "react-motion-gallery/skeleton/cache";
import styles from "./masonry-spans-demo.module.css";
import { masonrySpansSkeletonText } from "./masonry-spans.skeleton-text.generated";
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
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
  responsiveBy?: "viewport" | "container";
};

type GeneratedSkeletonTextEntry = {
  badge: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

type MasonrySpansDemoProps = {
  cache?: SkeletonCacheOptions;
};

const SPANS_CARD_METRICS = {
  cardGapPx: 12,
  cardPadding: "10px 10px 14px",
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

const ITEMS: DemoItem[] = [
  {
    displayIndex: 1,
    kind: "image",
    src: "https://picsum.photos/id/558/1600/1100",
    fullscreenSrc: "https://picsum.photos/id/558/3200/2200",
    label: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "16 / 11",
    span: { 0: 1, 760: 2, 1160: 2 },
  },
  {
    displayIndex: 2,
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "3 / 5",
  },
  {
    displayIndex: 3,
    kind: "image",
    src: "https://picsum.photos/id/560/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/560/2400/3000",
    label: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "3 / 5",
  },
  {
    displayIndex: 4,
    kind: "image",
    src: "https://picsum.photos/id/563/1600/1200",
    fullscreenSrc: "https://picsum.photos/id/563/3200/2400",
    label: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "4 / 3",
    span: { 0: 1, 1160: 2 },
  },
  {
    displayIndex: 5,
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    label: "Elit",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: "16 / 12",
    span: { 0: 1, 760: 2, 1160: 2 },
  },
  {
    displayIndex: 6,
    kind: "image",
    src: "https://picsum.photos/id/564/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/564/2400/2400",
    label: "Magna",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: "1 / 1",
  },
  {
    displayIndex: 7,
    kind: "image",
    src: "https://picsum.photos/id/566/1200/1800",
    fullscreenSrc: "https://picsum.photos/id/566/2400/3600",
    label: "Nulla",
    title: "Neque porro quisquam est",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
    ratio: "2 / 3",
  },
  {
    displayIndex: 8,
    kind: "image",
    src: "https://picsum.photos/id/568/1600/1100",
    fullscreenSrc: "https://picsum.photos/id/568/3200/2200",
    label: "Tempus",
    title: "Temporibus autem quibusdam",
    body: "Et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
    ratio: "16 / 11",
    span: { 0: 1, 1160: 2 },
  },
];

const MASONRY_SPANS_COLUMNS = { 0: 1, 760: 2, 1160: 4 };
const MASONRY_SPANS_GAP = { 0: 12, 1160: 18 };

const MASONRY_SPANS_TEXT_IDS: SkeletonTextIds[] = [
  {
    badge: "masonrySpansItem01Badge",
    title: "masonrySpansItem01Title",
    body: "masonrySpansItem01Body",
  },
  {
    badge: "masonrySpansItem02Badge",
    title: "masonrySpansItem02Title",
    body: "masonrySpansItem02Body",
  },
  {
    badge: "masonrySpansItem03Badge",
    title: "masonrySpansItem03Title",
    body: "masonrySpansItem03Body",
  },
  {
    badge: "masonrySpansItem04Badge",
    title: "masonrySpansItem04Title",
    body: "masonrySpansItem04Body",
  },
  {
    badge: "masonrySpansItem05Badge",
    title: "masonrySpansItem05Title",
    body: "masonrySpansItem05Body",
  },
  {
    badge: "masonrySpansItem06Badge",
    title: "masonrySpansItem06Title",
    body: "masonrySpansItem06Body",
  },
  {
    badge: "masonrySpansItem07Badge",
    title: "masonrySpansItem07Title",
    body: "masonrySpansItem07Body",
  },
  {
    badge: "masonrySpansItem08Badge",
    title: "masonrySpansItem08Title",
    body: "masonrySpansItem08Body",
  },
];

const MASONRY_SPANS_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_SPANS_TEXT_IDS.map((textIds) => ({
    badge: masonrySpansSkeletonText[textIds.badge]!,
    title: masonrySpansSkeletonText[textIds.title]!,
    body: masonrySpansSkeletonText[textIds.body]!,
  }));

function createSpansSkeletonItem(args: {
  item: DemoItem;
  skeletonText: GeneratedSkeletonTextEntry;
}): SkeletonNode {
  return {
    kind: "col",
    style: {
      gap: SPANS_CARD_METRICS.cardGapPx,
    },
    children: [
      {
        kind: "rect",
        style: {
          width: "100%",
          aspectRatio: args.item.ratio,
          borderRadius: SPANS_CARD_METRICS.mediaRadiusPx,
        },
      },
      {
        kind: "col",
        style: {
          gap: SPANS_CARD_METRICS.metaGapPx,
          padding: SPANS_CARD_METRICS.metaInlinePadding,
        },
        children: [
          {
            kind: "text",
            barHeight: SPANS_CARD_METRICS.badge.barHeight,
            lineHeight: SPANS_CARD_METRICS.badge.lineHeight,
            ...args.skeletonText.badge,
            style: {
              borderRadius: 999,
            },
          },
          {
            kind: "text",
            barHeight: SPANS_CARD_METRICS.title.barHeight,
            lineHeight: SPANS_CARD_METRICS.title.lineHeight,
            ...args.skeletonText.title,
            style: {
              width: "100%",
            },
          },
          {
            kind: "text",
            barHeight: SPANS_CARD_METRICS.body.barHeight,
            lineHeight: SPANS_CARD_METRICS.body.lineHeight,
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

const SPANS_SKELETON: MasonrySkeletonSpec = {
  radius: 20,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: SPANS_CARD_METRICS.cardPadding,
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createSpansSkeletonItem({
      item: ITEMS[0]!,
      skeletonText: MASONRY_SPANS_SKELETON_TEXT[0]!,
    }),
    slots: ITEMS.map((item, index) => ({
      span: item.span,
      item: createSpansSkeletonItem({
        item,
        skeletonText:
          MASONRY_SPANS_SKELETON_TEXT[index] ?? MASONRY_SPANS_SKELETON_TEXT[0]!,
      }),
    })),
  },
};

const SPANS_VIDEO_OPTIONS = {
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

const SPANS_FULLSCREEN_VIDEO_OPTIONS = {
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

function MasonrySpansCard(props: {
  item: DemoItem;
  skeletonTextIds: SkeletonTextIds;
}) {
  const { item, skeletonTextIds } = props;

  return (
    <article className={styles.masonrySpansCard}>
      <div
        className={styles.masonrySpansMedia}
        style={{ aspectRatio: item.ratio }}
      >
        <span
          className={styles.masonrySpansIndex}
          aria-label={\`Item \${item.displayIndex}\`}
        >
          {item.displayIndex}
        </span>
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonrySpansImage}
          />
        ) : (
          <>
            <Video
              src={item.src}
              poster={item.poster}
              className={styles.masonrySpansVideo}
              style={{ height: "100%" }}
              options={SPANS_VIDEO_OPTIONS}
              alt={item.title}
            />
            <button
              type="button"
              className={styles.fullscreen_trigger}
              aria-label="Open fullscreen"
              data-rmg-fullscreen-trigger
            />
          </>
        )}
      </div>
      <div className={styles.masonrySpansMeta}>
        <span
          className={styles.masonrySpansBadge}
          data-skeleton-text-id={skeletonTextIds.badge}
        >
          {item.label}
        </span>
        <strong
          className={styles.masonrySpansTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {item.title}
        </strong>
        <p
          className={styles.masonrySpansBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MasonrySpansFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        playOnOpen: true,
        options: SPANS_FULLSCREEN_VIDEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonrySpansDemo(props: MasonrySpansDemoProps = {}) {
  const skeletonCache = props.cache ?? demoSkeletonCache("masonry-spans");
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc!
        : {
            kind: "video" as const,
            src: item.src,
            poster: item.poster,
          },
    ),
  );

  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <MasonrySkeleton
        cache={skeletonCache}
        layout={SPANS_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 1200 }}
        masonry={{
          count: ITEMS.length,
          columns: MASONRY_SPANS_COLUMNS,
          gap: MASONRY_SPANS_GAP,
          placement: "balanced",
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={MASONRY_SPANS_COLUMNS}
          gap={MASONRY_SPANS_GAP}
          placement="balanced"
        >
          {ITEMS.map((item) => (
            <Masonry.Item
              key={item.kind === "image" ? item.src : item.poster}
              span={item.span}
            >
              <MasonrySpansCard
                item={item}
                skeletonTextIds={
                  MASONRY_SPANS_TEXT_IDS[item.displayIndex - 1] ??
                  MASONRY_SPANS_TEXT_IDS[0]!
                }
              />
            </Masonry.Item>
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonrySpansFullscreenAddon />
    </GalleryCore>
  );
}
`;
