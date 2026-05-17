/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-free-scroll-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const URLS = [
  "https://picsum.photos/id/83/1200/1200",
  "https://picsum.photos/id/84/1200/1200",
  "https://picsum.photos/id/85/1200/1200",
  "https://picsum.photos/id/87/1200/1200",
  "https://picsum.photos/id/89/1200/1200",
  "https://picsum.photos/id/92/1200/1200",
  "https://picsum.photos/id/93/1200/1200",
  "https://picsum.photos/id/94/1200/1200",
  "https://picsum.photos/id/95/1200/1200",
  "https://picsum.photos/id/98/1200/1200",
  "https://picsum.photos/id/100/1200/1200",
  "https://picsum.photos/id/106/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/83/2400/2400",
  "https://picsum.photos/id/84/2400/2400",
  "https://picsum.photos/id/85/2400/2400",
  "https://picsum.photos/id/87/2400/2400",
  "https://picsum.photos/id/89/2400/2400",
  "https://picsum.photos/id/92/2400/2400",
  "https://picsum.photos/id/93/2400/2400",
  "https://picsum.photos/id/94/2400/2400",
  "https://picsum.photos/id/95/2400/2400",
  "https://picsum.photos/id/98/2400/2400",
  "https://picsum.photos/id/100/2400/2400",
  "https://picsum.photos/id/106/2400/2400",
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
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderFreeScrollDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-free-scroll")}
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
          freeScroll: true,
          groupCells: true
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
