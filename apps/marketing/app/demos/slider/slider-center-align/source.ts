export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-center-align-demo.module.css";

const URLS = [
  "https://picsum.photos/id/107/1600/900",
  "https://picsum.photos/id/1008/1600/900",
  "https://picsum.photos/id/1009/1600/900",
  "https://picsum.photos/id/1010/1600/900",
  "https://picsum.photos/id/1011/1600/900",
  "https://picsum.photos/id/1012/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/107/2400/1350",
  "https://picsum.photos/id/1008/2400/1350",
  "https://picsum.photos/id/1009/2400/1350",
  "https://picsum.photos/id/1010/2400/1350",
  "https://picsum.photos/id/1011/2400/1350",
  "https://picsum.photos/id/1012/2400/1350",
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

export function SliderCenterAlignDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              centering: "first",
              style: {
                overflow: "hidden",
              },
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
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
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
