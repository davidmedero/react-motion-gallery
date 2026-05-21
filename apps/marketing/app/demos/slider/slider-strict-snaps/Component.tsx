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
import styles from "./slider-strict-snaps-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const URLS = [
  "https://picsum.photos/id/121/1600/900",
  "https://picsum.photos/id/122/1600/900",
  "https://picsum.photos/id/123/1600/900",
  "https://picsum.photos/id/124/1600/900",
  "https://picsum.photos/id/125/1600/900",
  "https://picsum.photos/id/126/1600/900",
  "https://picsum.photos/id/127/1600/900",
  "https://picsum.photos/id/128/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/121/2400/1350",
  "https://picsum.photos/id/122/2400/1350",
  "https://picsum.photos/id/123/2400/1350",
  "https://picsum.photos/id/124/2400/1350",
  "https://picsum.photos/id/125/2400/1350",
  "https://picsum.photos/id/126/2400/1350",
  "https://picsum.photos/id/127/2400/1350",
  "https://picsum.photos/id/128/2400/1350",
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
    plugins: [
      fullscreenSlider({ strictSnaps: true }),
      fullscreenZoomPan(),
    ],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderStrictSnapsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-strict-snaps")}
        layout={{
          visibleCount: 3,
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
              },
            },
          },
        }}
        ready={sliderReady}
      >
      <Slider
        ref={sliderRef}
        align="center"
        scroll={{
          loop: true,
          strictSnaps: true,
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
