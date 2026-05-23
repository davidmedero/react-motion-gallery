/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/cache/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-group-cells-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const URLS = [
  "https://picsum.photos/id/57/1200/1200",
  "https://picsum.photos/id/62/1200/1200",
  "https://picsum.photos/id/66/1200/1200",
  "https://picsum.photos/id/69/1200/1200",
  "https://picsum.photos/id/70/1200/1200",
  "https://picsum.photos/id/71/1200/1200",
  "https://picsum.photos/id/74/1200/1200",
  "https://picsum.photos/id/75/1200/1200",
  "https://picsum.photos/id/77/1200/1200",
  "https://picsum.photos/id/78/1200/1200",
  "https://picsum.photos/id/81/1200/1200",
  "https://picsum.photos/id/82/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/57/2400/2400",
  "https://picsum.photos/id/62/2400/2400",
  "https://picsum.photos/id/66/2400/2400",
  "https://picsum.photos/id/69/2400/2400",
  "https://picsum.photos/id/70/2400/2400",
  "https://picsum.photos/id/71/2400/2400",
  "https://picsum.photos/id/74/2400/2400",
  "https://picsum.photos/id/75/2400/2400",
  "https://picsum.photos/id/77/2400/2400",
  "https://picsum.photos/id/78/2400/2400",
  "https://picsum.photos/id/81/2400/2400",
  "https://picsum.photos/id/82/2400/2400",
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={`Slide ${i + 1}`} className={styles.slide} />;
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderGroupCellsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-group-cells")}
        layout={{
          visibleCount: 4,
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
        }}
        ready={sliderReady}
      >
        <Slider
          ref={sliderRef}
          scroll={{
            groupCells: true,
          }}
          reveal={{
            staggerMs: 100,
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderDots(),
          ]}
        >
          {media.map((item, i) => (
            <Slide
              key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
              src={item.kind === "image" ? item.src : ""}
              i={i}
            />
          ))}
        </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
