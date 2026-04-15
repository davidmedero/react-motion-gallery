/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-fade-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1079/1600/900",
  "https://picsum.photos/id/1080/1600/900",
  "https://picsum.photos/id/1081/1600/900",
  "https://picsum.photos/id/1082/1600/900",
  "https://picsum.photos/id/1083/1600/900",
  "https://picsum.photos/id/1084/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1079/2400/1350",
  "https://picsum.photos/id/1080/2400/1350",
  "https://picsum.photos/id/1081/2400/1350",
  "https://picsum.photos/id/1082/2400/1350",
  "https://picsum.photos/id/1083/2400/1350",
  "https://picsum.photos/id/1084/2400/1350",
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

export function SliderFadeDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          loop: true,
        }}
        align="center"
        effects={{
          fade: {
            enabled: true,
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden",
              },
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                  justify: "center",
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
