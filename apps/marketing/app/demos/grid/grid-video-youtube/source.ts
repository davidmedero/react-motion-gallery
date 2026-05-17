export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { type MediaItem, toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-video-youtube-demo.module.css";
import { gridVideoYoutubeSkeletonText } from "./grid-video-youtube.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type SkeletonTextIds = {
  title: string;
  body: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
};

type GeneratedSkeletonTextEntry = {
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

const ITEMS = [
  {
    kind: "video" as const,
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    kind: "video" as const,
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    kind: "video" as const,
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    kind: "video" as const,
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const GRID_VIDEO_YOUTUBE_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "gridVideoYoutubeItem01Title",
    body: "gridVideoYoutubeItem01Body",
  },
  {
    title: "gridVideoYoutubeItem02Title",
    body: "gridVideoYoutubeItem02Body",
  },
  {
    title: "gridVideoYoutubeItem03Title",
    body: "gridVideoYoutubeItem03Body",
  },
  {
    title: "gridVideoYoutubeItem04Title",
    body: "gridVideoYoutubeItem04Body",
  },
];

const GRID_VIDEO_YOUTUBE_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  GRID_VIDEO_YOUTUBE_TEXT_IDS.map((textIds) => ({
    title: gridVideoYoutubeSkeletonText[textIds.title]!,
    body: gridVideoYoutubeSkeletonText[textIds.body]!,
  }));

function buildYoutubeSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ src, provider: "youtube" as const }],
  };
}

const YOUTUBE_OPTIONS = {
  ratio: "16:9",
  controls: [],
  youtube: {
    customControls: false,
  },
};

function buildYoutubeFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildYoutubeSource("");
  }

  return buildYoutubeSource(item.src, item.poster);
}

function createYoutubeVideoSkeletonItem(index: number) {
  const skeletonText =
    GRID_VIDEO_YOUTUBE_SKELETON_TEXT[index] ??
    GRID_VIDEO_YOUTUBE_SKELETON_TEXT[0]!;

  return {
    kind: "col" as const,
    style: {
      gap: 14,
    },
    children: [
      {
        kind: "rect" as const,
        style: {
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 12,
        },
      },
      {
        kind: "col" as const,
        style: {
          gap: 6,
        },
        children: [
          {
            kind: "text" as const,
            barHeight: 18,
            lineHeight: 1.63,
            style: {
              width: "100%",
            },
            ...skeletonText.title,
          },
          {
            kind: "text" as const,
            barHeight: 15,
            lineHeight: 1.65,
            style: {
              width: "100%",
            },
            ...skeletonText.body,
          },
        ],
      },
    ],
  };
}

const YOUTUBE_VIDEO_SKELETON_SLOTS = ITEMS.map((_, index) => ({
  item: createYoutubeVideoSkeletonItem(index),
}));

const YOUTUBE_VIDEO_SKELETON: GridSkeletonSpec = {
  radius: 12,
  layout: {
    kind: "grid",
    itemWrapStyle: {
      padding: 16,
      borderRadius: 12,
      border: "1px solid rgba(11, 18, 32, 0.12)",
      backgroundColor: "rgba(255, 255, 255, 0.82)",
      boxShadow: "0 3px 6px rgba(15, 23, 42, 0.08)",
      height: "100%"
    },
    item: createYoutubeVideoSkeletonItem(0),
    slots: YOUTUBE_VIDEO_SKELETON_SLOTS,
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        source: buildYoutubeFullscreenSource,
        options: YOUTUBE_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridVideoYoutubeDemo() {
  const media = toMediaItems(ITEMS);
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <GridSkeleton
        cache={demoSkeletonCache("grid-video-youtube")}
        layout={YOUTUBE_VIDEO_SKELETON}
        ready={gridReady}
        grid={{
          count: ITEMS.length,
          columns: { 0: 1, 900: 2 },
          gap: { 0: 12, 900: 18 },
        }}
      >
        <Grid
          ref={gridRef}
          columns={{ 0: 1, 900: 2 }}
          gap={{ 0: 12, 900: 18 }}
          fullscreenTrigger="item"
        >
          {ITEMS.map((item, index) => {
            const textIds = GRID_VIDEO_YOUTUBE_TEXT_IDS[index]!;

            return (
              <article key={item.src} className={styles.videoSlide}>
                <div className={styles.videoFrame}>
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
                    source={buildYoutubeSource(item.src, item.poster)}
                    options={YOUTUBE_OPTIONS}
                    alt={item.title}
                  />
                </div>
                <div className={styles.videoMeta}>
                  <strong
                    className={styles.videoMetaTitle}
                    data-skeleton-text-id={textIds.title}
                  >
                    {item.title}
                  </strong>
                  <p
                    className={styles.videoMetaBody}
                    data-skeleton-text-id={textIds.body}
                  >
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </Grid>
      </GridSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
