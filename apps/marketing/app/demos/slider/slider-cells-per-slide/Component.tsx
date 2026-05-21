/* eslint-disable @next/next/no-img-element */
'use client';

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
import styles from "./slider-cells-per-slide-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const URLS = [
  "https://picsum.photos/id/174/1200/1200",
  "https://picsum.photos/id/176/1200/1200",
  "https://picsum.photos/id/178/1200/1200",
  "https://picsum.photos/id/179/1200/1200",
  "https://picsum.photos/id/182/1200/1200",
  "https://picsum.photos/id/184/1200/1200",
  "https://picsum.photos/id/185/1200/1200",
  "https://picsum.photos/id/186/1200/1200",
  "https://picsum.photos/id/187/1200/1200",
  "https://picsum.photos/id/188/1200/1200",
  "https://picsum.photos/id/190/1200/1200",
  "https://picsum.photos/id/191/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/174/2400/2400",
  "https://picsum.photos/id/176/2400/2400",
  "https://picsum.photos/id/178/2400/2400",
  "https://picsum.photos/id/179/2400/2400",
  "https://picsum.photos/id/182/2400/2400",
  "https://picsum.photos/id/184/2400/2400",
  "https://picsum.photos/id/185/2400/2400",
  "https://picsum.photos/id/186/2400/2400",
  "https://picsum.photos/id/187/2400/2400",
  "https://picsum.photos/id/188/2400/2400",
  "https://picsum.photos/id/190/2400/2400",
  "https://picsum.photos/id/191/2400/2400",
];

const CELLS_PER_SLIDE = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

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

export function SliderCellsPerSlideDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-cells-per-slide")}
        layout={{
              visibleCount: CELLS_PER_SLIDE,
              mode: "fit",
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
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true,
        }}
        transitions={{
          intro: {
            staggerMs: 100
          }
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
