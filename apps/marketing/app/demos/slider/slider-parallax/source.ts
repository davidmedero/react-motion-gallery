export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-parallax-demo.module.css";

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

export function SliderParallaxDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        scroll={{
          loop: true,
          freeScroll: true
        }}
        effects={{
          parallax: {
            enabled: true,
            borderRadius: "12px",
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
