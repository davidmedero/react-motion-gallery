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
import styles from "./slider-group-cells-demo.module.css";

const URLS = [
  "https://picsum.photos/id/57/1200/1200",
  "https://picsum.photos/id/62/1200/1200",
  "https://picsum.photos/id/66/1200/1200",
  "https://picsum.photos/id/69/1200/1200",
  "https://picsum.photos/id/70/1200/1200",
  "https://picsum.photos/id/71/1200/1200",
  "https://picsum.photos/id/74/1200/1200",
  "https://picsum.photos/id/75/1200/1200",
  "https://picsum.photos/id/77/1200/1200",
  "https://picsum.photos/id/78/1200/1200",
  "https://picsum.photos/id/81/1200/1200",
  "https://picsum.photos/id/82/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/57/2400/2400",
  "https://picsum.photos/id/62/2400/2400",
  "https://picsum.photos/id/66/2400/2400",
  "https://picsum.photos/id/69/2400/2400",
  "https://picsum.photos/id/70/2400/2400",
  "https://picsum.photos/id/71/2400/2400",
  "https://picsum.photos/id/74/2400/2400",
  "https://picsum.photos/id/75/2400/2400",
  "https://picsum.photos/id/77/2400/2400",
  "https://picsum.photos/id/78/2400/2400",
  "https://picsum.photos/id/81/2400/2400",
  "https://picsum.photos/id/82/2400/2400",
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

export function SliderGroupCellsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: 4,
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
                    maxWidth: "280px",
                    aspectRatio: "2 / 3",
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
          groupCells: true,
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
