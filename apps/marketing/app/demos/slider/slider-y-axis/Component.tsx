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
import styles from "./slider-y-axis-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const URLS = [
  "https://picsum.photos/id/162/1600/900",
  "https://picsum.photos/id/164/1600/900",
  "https://picsum.photos/id/165/1600/900",
  "https://picsum.photos/id/166/1600/900",
  "https://picsum.photos/id/167/1600/900",
  "https://picsum.photos/id/168/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/162/2400/1350",
  "https://picsum.photos/id/164/2400/1350",
  "https://picsum.photos/id/165/2400/1350",
  "https://picsum.photos/id/166/2400/1350",
  "https://picsum.photos/id/167/2400/1350",
  "https://picsum.photos/id/168/2400/1350",
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

function SliderYAxisGallery() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-y-axis")}
        layout={{
              visibleCount: 3,
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
            }}
        ready={sliderReady}
      >
      <Slider
        ref={sliderRef}
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

export function SliderYAxisDemo() {
  return (
    <div className={styles.demoCanvasSliderYAxis}>
      <SliderYAxisGallery />
    </div>
  );
}
