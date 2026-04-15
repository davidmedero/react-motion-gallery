/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-auto-play-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1055/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1056/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1057/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1058/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1059/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1060/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1061/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1062/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
  },
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

export function SliderAutoPlayDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        scroll={{
          loop: true,
          groupCells: true
        }}
        auto={{
          play: {
            enabled: true,
            speedMs: 2200,
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                  justify: "center"
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
