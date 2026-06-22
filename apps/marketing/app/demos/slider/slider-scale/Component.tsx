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
import { sliderScale } from "react-motion-gallery/slider/scale";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-scale-demo.module.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2400&h=1350&q=80",
  },
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

export function SliderScaleDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc),
  );

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
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
                width: "100cqw",
                maxWidth: "550px",
                aspectRatio: "16 / 9",
                borderRadius: 12,
                marginTop: 30,
                marginBottom: 30,
                marginLeft: 20,
                marginRight: 20,
              },
            },
            slots: [{}, { itemWrapStyle: { scale: 1.15 } }, {}],
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
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderDots(),
            sliderScale({
              enabled: true,
              amount: 1.15,
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
