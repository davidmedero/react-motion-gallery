"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import styles from "./slider-demo.module.css";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1600&h=900&q=80",
    alt: "An alpine lake between steep mountain walls",
  },
  {
    src: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1600&h=900&q=80",
    alt: "A ridge line lit by late afternoon sun",
  },
  {
    src: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1600&h=900&q=80",
    alt: "Snow patches scattered across a dark mountain face",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&h=900&q=80",
    alt: "A winding trail through highland grass",
  },
];

export function ZoomPanSliderDemo() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider">
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
        <Slider ref={sliderRef}>
          {IMAGES.map((image) => (
            <ZoomPanImage
              key={image.src}
              src={image.src}
              alt={image.alt}
              className={styles.slide}
              imageClassName={styles.image}
              zoom={{
                clickZoomLevel: 2.2,
                maxZoomLevel: 3.4,
              }}
            />
          ))}
        </Slider>
      </SliderSkeleton>
    </GalleryCore>
  );
}
