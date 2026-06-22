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
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-group-cells-demo.module.css";

const URLS = [
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&h=1200&q=80",
];

const FS_URLS = [
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&h=2400&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&h=2400&q=80",
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
          reveal={{
            staggerMs: 100,
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
