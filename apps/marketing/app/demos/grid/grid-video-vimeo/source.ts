export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { type MediaItem, toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { GridSkeleton } from "react-motion-gallery/skeleton/cache/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/cache/grid";
import styles from "./grid-video-vimeo-demo.module.css";
import { gridVideoVimeoSkeletonText } from "./grid-video-vimeo.skeleton-text.generated";
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
    src: "https://vimeo.com/145140004",
    poster:
      "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/113314928",
    poster:
      "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/172833424",
    poster:
      "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/130632032",
    poster:
      "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const GRID_VIDEO_VIMEO_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "gridVideoVimeoItem01Title",
    body: "gridVideoVimeoItem01Body",
  },
  {
    title: "gridVideoVimeoItem02Title",
    body: "gridVideoVimeoItem02Body",
  },
  {
    title: "gridVideoVimeoItem03Title",
    body: "gridVideoVimeoItem03Body",
  },
  {
    title: "gridVideoVimeoItem04Title",
    body: "gridVideoVimeoItem04Body",
  },
];

const GRID_VIDEO_VIMEO_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  GRID_VIDEO_VIMEO_TEXT_IDS.map((textIds) => ({
    title: gridVideoVimeoSkeletonText[textIds.title]!,
    body: gridVideoVimeoSkeletonText[textIds.body]!,
  }));

function buildVimeoSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ src, provider: "vimeo" as const }],
  };
}

const VIMEO_OPTIONS = {
  ratio: "16:9",
  controls: [],
  vimeo: {
    byline: false,
    portrait: false,
    title: false,
    speed: true,
    transparent: false,
    customControls: false,
  },
};

function buildVimeoFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildVimeoSource("");
  }

  return buildVimeoSource(item.src, item.poster);
}

function createVimeoVideoSkeletonItem(index: number) {
  const skeletonText =
    GRID_VIDEO_VIMEO_SKELETON_TEXT[index] ?? GRID_VIDEO_VIMEO_SKELETON_TEXT[0]!;

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

const VIMEO_VIDEO_SKELETON_SLOTS = ITEMS.map((_, index) => ({
  item: createVimeoVideoSkeletonItem(index),
}));

const VIMEO_VIDEO_SKELETON: GridSkeletonSpec = {
  radius: 12,
  layout: {
    kind: "grid",
    itemWrapStyle: {
      padding: 16,
      borderRadius: 12,
      border: "1px solid rgba(11, 18, 32, 0.12)",
      backgroundColor: "rgba(255, 255, 255, 0.82)",
      boxShadow: "0 3px 6px rgba(15, 23, 42, 0.08)",
    },
    item: createVimeoVideoSkeletonItem(0),
    slots: VIMEO_VIDEO_SKELETON_SLOTS,
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        source: buildVimeoFullscreenSource,
        options: VIMEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridVideoVimeoDemo() {
  const media = toMediaItems(ITEMS);
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <GridSkeleton
        cache={demoSkeletonCache("grid-video-vimeo")}
        layout={VIMEO_VIDEO_SKELETON}
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
          plugins={[gridFullscreen()]}
        >
          {ITEMS.map((item, index) => {
            const textIds = GRID_VIDEO_VIMEO_TEXT_IDS[index]!;

            return (
              <article key={item.src} className={styles.videoSlide}>
                <div className={styles.videoFrame}>
                  <img
                    src="/open-fullscreen.png"
                    alt="Open fullscreen"
                    width="24"
                    height="24"
                    className={styles.open_fullscreen_icon}
                    data-rmg-fullscreen-trigger
                  />
                  <Video
                    src={item.src}
                    poster={item.poster}
                    source={buildVimeoSource(item.src, item.poster)}
                    options={VIMEO_OPTIONS}
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
}
`;
