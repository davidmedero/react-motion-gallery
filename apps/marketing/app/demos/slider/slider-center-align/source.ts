export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

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
import styles from "./slider-center-align-demo.module.css";

const URLS = [
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&h=900&q=80",
];

const FS_URLS = [
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&h=1350&q=80",
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={\`Slide \${i + 1}\`} className={styles.slide} />;
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

export function SliderCenterAlignDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
          visibleCount: 3,
          mode: "peek",
          centering: "first",
          style: {
            overflow: "hidden",
          },
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
        }}
        ready={sliderReady}
      >
        <Slider
          ref={sliderRef}
          align="center"
          reveal={{
            staggerMs: 120,
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
              key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
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
`;
