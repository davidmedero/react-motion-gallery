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
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-variable-widths-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/142/1200/900",
    fullscreenSrc: "https://picsum.photos/id/142/2400/1800",
    width: 220,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/143/1020/630",
    fullscreenSrc: "https://picsum.photos/id/143/2040/1260",
    width: 420,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/147/780/1340",
    fullscreenSrc: "https://picsum.photos/id/147/1560/2680",
    width: 260,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/152/1280/720",
    fullscreenSrc: "https://picsum.photos/id/152/2560/1440",
    width: 360,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/154/1200/900",
    fullscreenSrc: "https://picsum.photos/id/154/2400/1800",
    width: 200,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/155/900/570",
    fullscreenSrc: "https://picsum.photos/id/155/1800/1140",
    width: 300,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/159/900/570",
    fullscreenSrc: "https://picsum.photos/id/159/1800/1140",
    width: 500,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/161/900/570",
    fullscreenSrc: "https://picsum.photos/id/161/1800/1140",
    width: 250,
    height: 320,
  },
];

function Slide(props: { src: string; width: number; height: number; i: number }) {
  const { src, width, height, i } = props;

  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      className={styles.variableWidthSlide}
      style={{ width, height }}
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

export function SliderVariableWidthsDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: 2,
              mode: "peek",
              centering: "first",
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
                slots: SLIDES.map((slide) => ({
                  itemWrapStyle: {
                    width: slide.width,
                    height: slide.height,
                  },
                })),
              },
            }}
        ready={sliderReady}
      >
      <Slider
        ref={sliderRef}
        align="center"
        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows(),
          sliderDots(),
        ]}
      >
        {media.map((item, i) => {
          const slide = SLIDES[i];

          return (
            <Slide
              key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
              src={item.kind === "image" ? item.src : ""}
              width={slide.width}
              height={slide.height}
              i={i}
            />
          );
  
            })}
      </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
