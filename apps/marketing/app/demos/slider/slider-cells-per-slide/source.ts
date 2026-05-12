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
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-cells-per-slide-demo.module.css";

const URLS = [
  "https://picsum.photos/id/174/1200/1200",
  "https://picsum.photos/id/176/1200/1200",
  "https://picsum.photos/id/178/1200/1200",
  "https://picsum.photos/id/179/1200/1200",
  "https://picsum.photos/id/182/1200/1200",
  "https://picsum.photos/id/184/1200/1200",
  "https://picsum.photos/id/185/1200/1200",
  "https://picsum.photos/id/186/1200/1200",
  "https://picsum.photos/id/187/1200/1200",
  "https://picsum.photos/id/188/1200/1200",
  "https://picsum.photos/id/190/1200/1200",
  "https://picsum.photos/id/191/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/174/2400/2400",
  "https://picsum.photos/id/176/2400/2400",
  "https://picsum.photos/id/178/2400/2400",
  "https://picsum.photos/id/179/2400/2400",
  "https://picsum.photos/id/182/2400/2400",
  "https://picsum.photos/id/184/2400/2400",
  "https://picsum.photos/id/185/2400/2400",
  "https://picsum.photos/id/186/2400/2400",
  "https://picsum.photos/id/187/2400/2400",
  "https://picsum.photos/id/188/2400/2400",
  "https://picsum.photos/id/190/2400/2400",
  "https://picsum.photos/id/191/2400/2400",
];

const CELLS_PER_SLIDE = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

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

export function SliderCellsPerSlideDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: CELLS_PER_SLIDE,
              mode: "fit",
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
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
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
