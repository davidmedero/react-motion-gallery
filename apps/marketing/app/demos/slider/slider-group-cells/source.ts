export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-group-cells-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1055/1200/1200",
  "https://picsum.photos/id/1056/1200/1200",
  "https://picsum.photos/id/1057/1200/1200",
  "https://picsum.photos/id/1058/1200/1200",
  "https://picsum.photos/id/1059/1200/1200",
  "https://picsum.photos/id/1060/1200/1200",
  "https://picsum.photos/id/1061/1200/1200",
  "https://picsum.photos/id/1062/1200/1200",
  "https://picsum.photos/id/1063/1200/1200",
  "https://picsum.photos/id/1064/1200/1200",
  "https://picsum.photos/id/1065/1200/1200",
  "https://picsum.photos/id/1066/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1055/2400/2400",
  "https://picsum.photos/id/1056/2400/2400",
  "https://picsum.photos/id/1057/2400/2400",
  "https://picsum.photos/id/1058/2400/2400",
  "https://picsum.photos/id/1059/2400/2400",
  "https://picsum.photos/id/1060/2400/2400",
  "https://picsum.photos/id/1061/2400/2400",
  "https://picsum.photos/id/1062/2400/2400",
  "https://picsum.photos/id/1063/2400/2400",
  "https://picsum.photos/id/1064/2400/2400",
  "https://picsum.photos/id/1065/2400/2400",
  "https://picsum.photos/id/1066/2400/2400",
];

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

export function SliderGroupCellsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          groupCells: true,
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100cqw",
                    maxWidth: "280px",
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
