export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-cells-per-slide-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1025/1200/1200",
  "https://picsum.photos/id/1026/1200/1200",
  "https://picsum.photos/id/1027/1200/1200",
  "https://picsum.photos/id/1028/1200/1200",
  "https://picsum.photos/id/1029/1200/1200",
  "https://picsum.photos/id/103/1200/1200",
  "https://picsum.photos/id/1031/1200/1200",
  "https://picsum.photos/id/1032/1200/1200",
  "https://picsum.photos/id/1033/1200/1200",
  "https://picsum.photos/id/104/1200/1200",
  "https://picsum.photos/id/1035/1200/1200",
  "https://picsum.photos/id/1036/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1025/2400/2400",
  "https://picsum.photos/id/1026/2400/2400",
  "https://picsum.photos/id/1027/2400/2400",
  "https://picsum.photos/id/1028/2400/2400",
  "https://picsum.photos/id/1029/2400/2400",
  "https://picsum.photos/id/103/2400/2400",
  "https://picsum.photos/id/1031/2400/2400",
  "https://picsum.photos/id/1032/2400/2400",
  "https://picsum.photos/id/1033/2400/2400",
  "https://picsum.photos/id/104/2400/2400",
  "https://picsum.photos/id/1035/2400/2400",
  "https://picsum.photos/id/1036/2400/2400",
];

const CELLS_PER_SLIDE = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderCellsPerSlideDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true,
        }}
        transitions={{
          loading: {
            timing: {
              exitMs: 600,
            },
            skeletonCount: CELLS_PER_SLIDE,
            skeleton: {
              mode: "fit",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
