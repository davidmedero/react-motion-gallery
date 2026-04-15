/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Grid,
  Video,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import type { GridSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/Gallery/grid/GridSkeleton";
import styles from "./grid-video-html5-demo.module.css";

const ITEMS = [
  {
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    title: "Forest Run",
    body: "Native MP4 playback inside a responsive grid card.",
  },
  {
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    title: "Tide Study",
    body: "Poster-first loading keeps the layout calm before playback.",
  },
  {
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps-0.jpg",
    title: "Studio Glass",
    body: "Grid items can mix rich media with supporting editorial copy.",
  },
  {
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps-0.jpg",
    title: "Desert Road",
    body: "Fullscreen still hooks up through GalleryCore when the card opens.",
  },
];

const HTML5_VIDEO_SKELETON: GridSkeletonSpec = {
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
            width: "70%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.5,
          lines: 2,
          lineWidth: "56%",
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

  return (
    <GalleryCore layout="grid" fullscreenItems={media}>
      <Grid
        columns={{ 0: 1, 900: 2 }}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        loading={{
          enabled: true,
          skeleton: HTML5_VIDEO_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <article key={item.src} className={styles.videoSlide}>
            <div className={styles.videoFrame}>
              <Video
                src={item.src}
                poster={item.poster}
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
