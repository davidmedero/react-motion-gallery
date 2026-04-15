/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Grid,
  Video,
  type MediaItem,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import type { GridSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/Gallery/grid/GridSkeleton";
import styles from "./grid-video-vimeo-demo.module.css";

const ITEMS = [
  {
    kind: "video" as const,
    src: "https://vimeo.com/145140004",
    poster: "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
    title: "Atlas Walkthrough",
    body: "Vimeo embeds inherit the same layout, fullscreen, and loading system.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/113314928",
    poster: "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
    title: "Signal Grade",
    body: "Plyr options stay customizable while cards keep their editorial framing.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/172833424",
    poster: "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
    title: "Night Transit",
    body: "Grid cards can mix motion, metadata, and fullscreen without custom wiring.",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/130632032",
    poster: "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
    title: "Quiet Surface",
    body: "Responsive columns make video galleries feel deliberate instead of cramped.",
  },
];

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

const VIMEO_VIDEO_SKELETON: GridSkeletonSpec = {
  radius: 12,
  layout: {
    kind: "grid",
    item: {
      kind: "col",
      style: {
        gap: 12,
      },
      children: [
        {
          kind: "rect",
          style: {
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 12,
          },
        },
        {
          kind: "text",
          fontSize: 18,
          lineHeight: 1.2,
          style: {
            width: "66%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.5,
          lines: 2,
          lineWidth: "52%",
          style: {
            width: "100%",
          },
        },
      ],
    },
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
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

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <Grid
        columns={{ 0: 1, 900: 2 }}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        loading={{
          enabled: true,
          skeleton: VIMEO_VIDEO_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <article key={item.src} className={styles.videoSlide}>
            <div className={styles.videoFrame}>
              <Video
                src={item.src}
                poster={item.poster}
                source={buildVimeoSource(item.src, item.poster)}
                options={VIMEO_OPTIONS}
                alt={item.title}
              />
            </div>
            <div className={styles.videoMeta}>
              <strong className={styles.videoMetaTitle}>{item.title}</strong>
              <p className={styles.videoMetaBody}>{item.body}</p>
            </div>
          </article>
        ))}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
}
