/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  useSliderReady,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { sliderScale } from "../../../../../../packages/react-motion-gallery/src/slider-scale";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-scale-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/299/1600/900",
    fullscreenSrc: "https://picsum.photos/id/299/2400/1350",
  },
  {
    src: "https://picsum.photos/id/301/1600/900",
    fullscreenSrc: "https://picsum.photos/id/301/2400/1350",
  },
  {
    src: "https://picsum.photos/id/305/1600/900",
    fullscreenSrc: "https://picsum.photos/id/305/2400/1350",
  },
  {
    src: "https://picsum.photos/id/306/1600/900",
    fullscreenSrc: "https://picsum.photos/id/306/2400/1350",
  },
  {
    src: "https://picsum.photos/id/315/1600/900",
    fullscreenSrc: "https://picsum.photos/id/315/2400/1350",
  },
  {
    src: "https://picsum.photos/id/316/1600/900",
    fullscreenSrc: "https://picsum.photos/id/316/2400/1350",
  },
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

export function SliderScaleDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

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
                slots: [
                  {},
                  { itemWrapStyle: { scale: 1.15 } },
                  {},
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
