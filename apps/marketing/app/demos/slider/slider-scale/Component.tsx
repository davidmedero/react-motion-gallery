/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-scale-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1010/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1010/2400/1350",
  },
  {
    src: "https://picsum.photos/id/1011/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1011/2400/1350",
  },
  {
    src: "https://picsum.photos/id/1012/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1012/2400/1350",
  },
  {
    src: "https://picsum.photos/id/1013/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1013/2400/1350",
  },
  {
    src: "https://picsum.photos/id/1015/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1015/2400/1350",
  },
  {
    src: "https://picsum.photos/id/1016/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1016/2400/1350",
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

export function SliderScaleDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        scroll={{
          loop: true,
        }}
        effects={{
          scale: {
            enabled: true,
            amount: 1.15,
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
                  justify: "center",
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100cqw",
                    maxWidth: "550px",
                    aspectRatio: "16 / 9",
                    borderRadius: 12,
                    marginTop: 30,
                    marginBottom: 30,
                    marginLeft: 20,
                    marginRight: 20,
                  },
                },
                slots: [
                  {},
                  { itemWrapStyle: { scale: 1.15 } },
                  {},
                ],
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
