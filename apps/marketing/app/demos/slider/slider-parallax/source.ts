export const source = String.raw`/* eslint-disable @next/next/no-img-element */
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
import { sliderParallax } from "../../../../../../packages/react-motion-gallery/src/slider-parallax";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-parallax-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/278/1600/900",
    fullscreenSrc: "https://picsum.photos/id/278/2400/1350",
  },
  {
    src: "https://picsum.photos/id/279/1600/900",
    fullscreenSrc: "https://picsum.photos/id/279/2400/1350",
  },
  {
    src: "https://picsum.photos/id/283/1600/900",
    fullscreenSrc: "https://picsum.photos/id/283/2400/1350",
  },
  {
    src: "https://picsum.photos/id/287/1600/900",
    fullscreenSrc: "https://picsum.photos/id/287/2400/1350",
  },
  {
    src: "https://picsum.photos/id/288/1600/900",
    fullscreenSrc: "https://picsum.photos/id/288/2400/1350",
  },
  {
    src: "https://picsum.photos/id/289/1600/900",
    fullscreenSrc: "https://picsum.photos/id/289/2400/1350",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
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

export function SliderParallaxDemo() {
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
        scroll={{
          loop: true,
          freeScroll: true
        }}

        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows(),
          sliderDots(),
          sliderParallax({
            enabled: true,
            borderRadius: "12px",
          }),
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
