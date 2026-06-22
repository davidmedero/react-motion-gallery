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
import { sliderAutoScroll } from "react-motion-gallery/slider/auto-scroll";
import { sliderProgress } from "react-motion-gallery/slider/progress";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-auto-scroll-demo.module.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
];

const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
const FULLSCREEN_MEDIA = toMediaItems(
  SLIDES.map((slide) => slide.fullscreenSrc),
);

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

export function SliderAutoScrollDemo() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_MEDIA}>
      <SliderSkeleton
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
                width: "100%",
                height: "100%",
                borderRadius: 12,
              },
            },
            itemWrapStyle: {
              width: "100cqw",
              maxWidth: "320px",
              aspectRatio: "4 / 5",
            },
            children: [
              {
                kind: "col",
                style: {
                  0: {
                    width: "100%",
                    padding: "18px 0 0 0",
                  },
                  768: {
                    width: "100%",
                    padding: "22px 0 0 0",
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "60%",
                      height: 4,
                      borderRadius: 999,
                      alignSelf: "center",
                    },
                  },
                ],
              },
            ],
          },
        }}
        ready={sliderReady}
      >
        <Slider
          ref={sliderRef}
          align="center"
          scroll={{
            loop: true,
          }}
          elements={{
            viewport: {
              className: styles.slider_viewport,
            },
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderProgress({
              enabled: true,
              root: {
                style: {
                  bottom: "0px",
                },
              },
            }),
            sliderAutoScroll({
              enabled: true,
            }),
          ]}
        >
          {MEDIA.map((item, i) => (
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
