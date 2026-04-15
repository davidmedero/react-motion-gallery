export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-y-axis-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1019/1600/900",
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1021/1600/900",
  "https://picsum.photos/id/1022/1600/900",
  "https://picsum.photos/id/1023/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1019/2400/1350",
  "https://picsum.photos/id/1020/2400/1350",
  "https://picsum.photos/id/1021/2400/1350",
  "https://picsum.photos/id/1022/2400/1350",
  "https://picsum.photos/id/1023/2400/1350",
  "https://picsum.photos/id/1024/2400/1350",
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

function SliderYAxisGallery() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        direction={{
          axis: "y",
        }}
        elements={{
          viewport: {
            style: {
              height: "100cqh",
              maxHeight: "530px",
            },
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "col",
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
                  aspectRatio: "16 / 7",
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
}

export function SliderYAxisDemo() {
  return (
    <div className={styles.demoCanvasSliderYAxis}>
      <SliderYAxisGallery />
    </div>
  );
}`;
