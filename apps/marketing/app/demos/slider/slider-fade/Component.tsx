/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFade } from "react-motion-gallery/slider/fade";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-fade-demo.module.css";

const URLS = [
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&h=900&q=80",
];

const FS_URLS = [
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&h=1350&q=80",
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

export function SliderFadeDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
          visibleCount: 3,
          mode: "peek",
          style: {
            overflow: "hidden",
          },
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
          scroll={{
            loop: true,
          }}
          align="center"
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderDots(),
            sliderFade({
              enabled: true,
            }),
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
