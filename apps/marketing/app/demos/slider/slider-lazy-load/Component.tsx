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
import { fullscreenLazyLoad } from "../../../../../../packages/react-motion-gallery/src/fullscreen-lazy-load";
import { sliderLazyLoad } from "../../../../../../packages/react-motion-gallery/src/slider-lazy-load";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-lazy-load-demo.module.css";

const URLS = [
  "https://picsum.photos/id/218/1600/900",
  "https://picsum.photos/id/221/1600/900",
  "https://picsum.photos/id/222/1600/900",
  "https://picsum.photos/id/227/1600/900",
  "https://picsum.photos/id/231/1600/900",
  "https://picsum.photos/id/234/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/218/2400/1350",
  "https://picsum.photos/id/221/2400/1350",
  "https://picsum.photos/id/222/2400/1350",
  "https://picsum.photos/id/227/2400/1350",
  "https://picsum.photos/id/231/2400/1350",
  "https://picsum.photos/id/234/2400/1350",
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
    plugins: [fullscreenSlider(), fullscreenLazyLoad(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      lazyLoad: {
        images: {
          enabled: true
        }
      }
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderLazyLoadDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: 2,
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
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

        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows(),
          sliderDots(),
          sliderLazyLoad({
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
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
