export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderCrossfade } from "react-motion-gallery/slider/crossfade";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-crossfade-demo.module.css";

const URLS = [
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1600&h=900&q=80",
];

const FS_URLS = [
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&h=1350&q=80",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=2400&h=1350&q=80",
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={\`Slide \${i + 1}\`} className={styles.slide} />;
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

export function SliderCrossfadeDemo() {
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
            sliderCrossfade({
              controls: true,
              drag: true,
              durationMs: 560,
              easing: "cubic-bezier(.22,1,.36,1)",
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
