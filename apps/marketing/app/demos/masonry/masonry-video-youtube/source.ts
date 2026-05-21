export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { type MediaItem, toMediaItems } from "react-motion-gallery/media";
import { Masonry } from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/cache/masonry";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type {
  MasonrySkeletonSpec,
  SkeletonNode,
} from "react-motion-gallery/skeleton/cache/masonry";
import styles from "./masonry-video-youtube-demo.module.css";
import { masonryVideoHtml5SkeletonText } from "../masonry-video-html5/masonry-video-html5.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type SkeletonTextIds = {
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
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

type MasonryVideoItem = {
  kind: "video";
  src: string;
  poster: string;
  title: string;
  body: string;
  ratio: string;
  span: number | Record<string, number>;
};

const ITEMS: MasonryVideoItem[] = [
  {
    kind: "video" as const,
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "16 / 10",
    span: { 0: 1, 1280: 2 },
  },
  {
    kind: "video" as const,
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "21 / 10",
    span: { 0: 1, 1280: 2 },
  },
  {
    kind: "video" as const,
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "16 / 10",
    span: { 0: 1, 1280: 2 },
  },
  {
    kind: "video" as const,
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "16 / 10",
    span: { 0: 1, 1280: 2 },
  },
  {
    kind: "video" as const,
    src: "IxF55qB4CuQ",
    poster: "https://i.ytimg.com/vi/IxF55qB4CuQ/hqdefault.jpg",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    ratio: "16 / 10",
    span: { 0: 1, 1280: 2 },
  },
  {
    kind: "video" as const,
    src: "IGOaJnvQdng",
    poster: "https://i.ytimg.com/vi/IGOaJnvQdng/hqdefault.jpg",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
    ratio: "21 / 10",
    span: { 0: 1, 1280: 2 },
  },
];

const VIDEO_CARD_METRICS = {
  cardGapPx: 14,
  cardPadding: "12px 12px 14px",
  cardRadiusPx: 22,
  frameRadiusPx: 18,
  metaGapPx: 6,
  title: {
    barHeight: 16.64,
    lineHeight: 1.2,
  },
  body: {
    barHeight: 14.72,
    lineHeight: 1.6,
  },
} as const;

const MASONRY_VIDEO_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "masonryVideoHtml5Item01Title",
    body: "masonryVideoHtml5Item01Body",
  },
  {
    title: "masonryVideoHtml5Item02Title",
    body: "masonryVideoHtml5Item02Body",
  },
  {
    title: "masonryVideoHtml5Item03Title",
    body: "masonryVideoHtml5Item03Body",
  },
  {
    title: "masonryVideoHtml5Item04Title",
    body: "masonryVideoHtml5Item04Body",
  },
  {
    title: "masonryVideoHtml5Item05Title",
    body: "masonryVideoHtml5Item05Body",
  },
  {
    title: "masonryVideoHtml5Item06Title",
    body: "masonryVideoHtml5Item06Body",
  },
];

const MASONRY_VIDEO_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  MASONRY_VIDEO_TEXT_IDS.map((textIds) => ({
    title: masonryVideoHtml5SkeletonText[textIds.title]!,
    body: masonryVideoHtml5SkeletonText[textIds.body]!,
  }));

function createVideoSkeletonItem(args: {
  item: MasonryVideoItem;
  skeletonText: GeneratedSkeletonTextEntry;
}): SkeletonNode {
  return {
    kind: "col",
    style: {
      gap: VIDEO_CARD_METRICS.cardGapPx,
    },
    children: [
      {
        kind: "rect",
        style: {
          width: "100%",
          aspectRatio: args.item.ratio,
          borderRadius: VIDEO_CARD_METRICS.frameRadiusPx,
        },
      },
      {
        kind: "col",
        style: {
          gap: VIDEO_CARD_METRICS.metaGapPx,
        },
        children: [
          {
            kind: "text",
            barHeight: VIDEO_CARD_METRICS.title.barHeight,
            lineHeight: VIDEO_CARD_METRICS.title.lineHeight,
            ...args.skeletonText.title,
            style: {
              width: "100%",
            },
          },
          {
            kind: "text",
            barHeight: VIDEO_CARD_METRICS.body.barHeight,
            lineHeight: VIDEO_CARD_METRICS.body.lineHeight,
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

const YOUTUBE_SKELETON: MasonrySkeletonSpec = {
  radius: 18,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: VIDEO_CARD_METRICS.cardPadding,
      borderRadius: VIDEO_CARD_METRICS.cardRadiusPx,
      border: "1px solid rgba(15, 23, 42, 0.08)",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createVideoSkeletonItem({
      item: ITEMS[0]!,
      skeletonText: MASONRY_VIDEO_SKELETON_TEXT[0]!,
    }),
    slots: ITEMS.map((item, index) => ({
      span: item.span,
      item: createVideoSkeletonItem({
        item,
        skeletonText:
          MASONRY_VIDEO_SKELETON_TEXT[index] ??
          MASONRY_VIDEO_SKELETON_TEXT[0]!,
      }),
    })),
  },
};

function buildMasonryYoutubeSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ src, provider: "youtube" as const }],
  };
}

const MASONRY_YOUTUBE_OPTIONS = {
  controls: [] as string[],
  youtube: {
    customControls: false,
  },
};

function buildMasonryYoutubeFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildMasonryYoutubeSource("");
  }

  return buildMasonryYoutubeSource(item.src, item.poster);
}

function MasonryYoutubeCard(props: {
  src: string;
  poster?: string;
  title: string;
  body: string;
  ratio: string;
  skeletonTextIds: SkeletonTextIds;
}) {
  const { src, poster, title, body, ratio, skeletonTextIds } = props;

  return (
    <article className={styles.masonryYoutubeCard}>
      <div className={styles.masonryYoutubeFrame} style={{ aspectRatio: ratio }}>
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fullscreen_icon}
        />
        <Video
          src={src}
          poster={poster}
          source={buildMasonryYoutubeSource(src, poster)}
          options={MASONRY_YOUTUBE_OPTIONS}
          className={styles.masonryYoutubeVideo}
          style={{ height: "100%" }}
          alt={title}
        />
      </div>
      <div className={styles.masonryYoutubeMeta}>
        <strong
          className={styles.masonryYoutubeTitle}
          data-skeleton-text-id={skeletonTextIds.title}
        >
          {title}
        </strong>
        <p
          className={styles.masonryYoutubeBody}
          data-skeleton-text-id={skeletonTextIds.body}
        >
          {body}
        </p>
      </div>
    </article>
  );
}

function MasonryYoutubeFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        source: buildMasonryYoutubeFullscreenSource,
        options: MASONRY_YOUTUBE_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryVideoYoutubeDemo() {
  const media = toMediaItems(ITEMS);

  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <GalleryCore layout="masonry" fullscreenItems={media}>
      <MasonrySkeleton
        cache={demoSkeletonCache("masonry-video-youtube")}
        layout={YOUTUBE_SKELETON}
        ready={masonryReady}
        timing={{ exitMs: 1200 }}
        masonry={{
          count: ITEMS.length,
          columns: { 0: 1, 820: 2, 1280: 4 },
          gap: { 0: 14, 820: 18, 1280: 20 },
          placement: "balanced",
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 820: 2, 1280: 4 }}
          gap={{ 0: 14, 820: 18, 1280: 20 }}
          placement="balanced"
        >
          {ITEMS.map((item, index) => (
          <Masonry.Item key={item.src} span={item.span}>
            <MasonryYoutubeCard
              src={item.src}
              poster={item.poster}
              title={item.title}
              body={item.body}
              ratio={item.ratio}
              skeletonTextIds={
                MASONRY_VIDEO_TEXT_IDS[index] ?? MASONRY_VIDEO_TEXT_IDS[0]!
              }
            />
          </Masonry.Item>
          ))}
        </Masonry>
      </MasonrySkeleton>
      <MasonryYoutubeFullscreenAddon />
    </GalleryCore>
  );
}`;
