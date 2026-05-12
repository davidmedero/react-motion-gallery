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
import { sliderFade } from "../../../../../../packages/react-motion-gallery/src/slider-fade";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-fade-demo.module.css";

const URLS = [
  "https://picsum.photos/id/317/1600/900",
  "https://picsum.photos/id/320/1600/900",
  "https://picsum.photos/id/322/1600/900",
  "https://picsum.photos/id/323/1600/900",
  "https://picsum.photos/id/324/1600/900",
  "https://picsum.photos/id/327/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/317/2400/1350",
  "https://picsum.photos/id/320/2400/1350",
  "https://picsum.photos/id/322/2400/1350",
  "https://picsum.photos/id/323/2400/1350",
  "https://picsum.photos/id/324/2400/1350",
  "https://picsum.photos/id/327/2400/1350",
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
