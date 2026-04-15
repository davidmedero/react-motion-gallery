export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-default-demo.module.css";

const URLS = [
  "https://picsum.photos/id/995/1600/900",
  "https://picsum.photos/id/996/1600/900",
  "https://picsum.photos/id/997/1600/900",
  "https://picsum.photos/id/998/1600/900",
  "https://picsum.photos/id/999/1600/900",
  "https://picsum.photos/id/1000/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/995/2400/1350",
  "https://picsum.photos/id/996/2400/1350",
  "https://picsum.photos/id/997/2400/1350",
  "https://picsum.photos/id/998/2400/1350",
  "https://picsum.photos/id/999/2400/1350",
  "https://picsum.photos/id/1000/2400/1350",
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

export function SliderDefaultDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        transitions={{
          loading: {
            skeletonCount: 2,
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
                    maxWidth: "550px",
                    aspectRatio: "16 / 9",
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
