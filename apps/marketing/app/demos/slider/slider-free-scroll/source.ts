export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-free-scroll-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1067/1200/1200",
  "https://picsum.photos/id/1068/1200/1200",
  "https://picsum.photos/id/1069/1200/1200",
  "https://picsum.photos/id/1070/1200/1200",
  "https://picsum.photos/id/1071/1200/1200",
  "https://picsum.photos/id/1072/1200/1200",
  "https://picsum.photos/id/1073/1200/1200",
  "https://picsum.photos/id/1074/1200/1200",
  "https://picsum.photos/id/1075/1200/1200",
  "https://picsum.photos/id/1076/1200/1200",
  "https://picsum.photos/id/1077/1200/1200",
  "https://picsum.photos/id/1078/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1067/2400/2400",
  "https://picsum.photos/id/1068/2400/2400",
  "https://picsum.photos/id/1069/2400/2400",
  "https://picsum.photos/id/1070/2400/2400",
  "https://picsum.photos/id/1071/2400/2400",
  "https://picsum.photos/id/1072/2400/2400",
  "https://picsum.photos/id/1073/2400/2400",
  "https://picsum.photos/id/1074/2400/2400",
  "https://picsum.photos/id/1075/2400/2400",
  "https://picsum.photos/id/1076/2400/2400",
  "https://picsum.photos/id/1077/2400/2400",
  "https://picsum.photos/id/1078/2400/2400",
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

export function SliderFreeScrollDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          freeScroll: true,
          groupCells: true
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
