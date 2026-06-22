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
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-variable-widths-demo.module.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&h=1800&q=80",
    width: 220,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1020&h=630&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=2040&h=1260&q=80",
    width: 420,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=780&h=1340&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1560&h=2680&q=80",
    width: 260,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1280&h=720&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=2560&h=1440&q=80",
    width: 360,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1200&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=2400&h=1800&q=80",
    width: 200,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=900&h=570&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1800&h=1140&q=80",
    width: 300,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=900&h=570&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&h=1140&q=80",
    width: 500,
    height: 320,
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&h=570&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&h=1140&q=80",
    width: 250,
    height: 320,
  },
];

function Slide(props: {
  src: string;
  width: number;
  height: number;
  i: number;
}) {
  const { src, width, height, i } = props;

  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
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
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc),
  );

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
          scroll={{ containScroll: true }}
          reveal={{
            staggerMs: 120,
          }}
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
                key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
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
`;
