/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-skip-snaps-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1001/1600/900",
  "https://picsum.photos/id/1002/1600/900",
  "https://picsum.photos/id/1003/1600/900",
  "https://picsum.photos/id/1004/1600/900",
  "https://picsum.photos/id/1005/1600/900",
  "https://picsum.photos/id/1006/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1001/2400/1350",
  "https://picsum.photos/id/1002/2400/1350",
  "https://picsum.photos/id/1003/2400/1350",
  "https://picsum.photos/id/1004/2400/1350",
  "https://picsum.photos/id/1005/2400/1350",
  "https://picsum.photos/id/1006/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
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

export function SliderSkipSnapsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          skipSnaps: true,
        }}
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
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}
