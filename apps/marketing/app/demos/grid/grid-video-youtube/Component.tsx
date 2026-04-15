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
import styles from "./grid-video-youtube-demo.module.css";

const ITEMS = [
  {
    kind: "video" as const,
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg",
    title: "Pattern Study",
    body: "YouTube embeds can sit in the same grid system as image cards.",
  },
  {
    kind: "video" as const,
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg",
    title: "Street Layers",
    body: "Provider-specific Plyr sources stay explicit and reusable.",
  },
  {
    kind: "video" as const,
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg",
    title: "River Light",
    body: "Fullscreen uses the same source builder for a seamless handoff.",
  },
  {
    kind: "video" as const,
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg",
    title: "Cloud Motion",
    body: "Responsive columns keep embedded video walls easy to scan.",
  },
];

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

const YOUTUBE_VIDEO_SKELETON: GridSkeletonSpec = {
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
            width: "68%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.5,
          lines: 2,
          lineWidth: "54%",
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
        source: buildYoutubeFullscreenSource,
        options: YOUTUBE_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridVideoYoutubeDemo() {
  const media = toMediaItems(ITEMS);

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <Grid
        columns={{ 0: 1, 900: 2 }}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        loading={{
          enabled: true,
          skeleton: YOUTUBE_VIDEO_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <article key={item.src} className={styles.videoSlide}>
            <div className={styles.videoFrame}>
              <Video
                src={item.src}
                poster={item.poster}
                source={buildYoutubeSource(item.src, item.poster)}
                options={YOUTUBE_OPTIONS}
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
