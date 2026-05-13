export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-video-html5-demo.module.css";
import { gridVideoHtml5SkeletonText } from "./grid-video-html5.skeleton-text.generated";

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
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://cdn.react-motion-gallery.com/slider-html-loop/7677513-hd_1920_1080_25fps-0.jpg",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const GRID_VIDEO_HTML5_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "gridVideoHtml5Item01Title",
    body: "gridVideoHtml5Item01Body",
  },
  {
    title: "gridVideoHtml5Item02Title",
    body: "gridVideoHtml5Item02Body",
  },
  {
    title: "gridVideoHtml5Item03Title",
    body: "gridVideoHtml5Item03Body",
  },
  {
    title: "gridVideoHtml5Item04Title",
    body: "gridVideoHtml5Item04Body",
  },
];

const GRID_VIDEO_HTML5_SKELETON_TEXT: GeneratedSkeletonTextEntry[] =
  GRID_VIDEO_HTML5_TEXT_IDS.map((textIds) => ({
    title: gridVideoHtml5SkeletonText[textIds.title]!,
    body: gridVideoHtml5SkeletonText[textIds.body]!,
  }));

function createHtml5VideoSkeletonItem(index: number) {
  const skeletonText =
    GRID_VIDEO_HTML5_SKELETON_TEXT[index] ??
    GRID_VIDEO_HTML5_SKELETON_TEXT[0]!;

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
            lineHeight: 1.2,
            style: {
              width: "100%",
            },
            ...skeletonText.title,
          },
          {
            kind: "text" as const,
            barHeight: 14,
            lineHeight: 1.5,
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

const HTML5_VIDEO_SKELETON_SLOTS = ITEMS.map((_, index) => ({
  item: createHtml5VideoSkeletonItem(index),
}));

const HTML5_VIDEO_SKELETON: GridSkeletonSpec = {
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
    item: createHtml5VideoSkeletonItem(0),
    slots: HTML5_VIDEO_SKELETON_SLOTS,
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridVideoHtml5Demo() {
  const media = toMediaItems(
    ITEMS.map((item) => ({
      kind: "video" as const,
      src: item.src,
      poster: item.poster,
    }))
  );
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <GridSkeleton
        layout={HTML5_VIDEO_SKELETON}
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
            const textIds = GRID_VIDEO_HTML5_TEXT_IDS[index]!;

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
                  <Video src={item.src} poster={item.poster} alt={item.title} />
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
