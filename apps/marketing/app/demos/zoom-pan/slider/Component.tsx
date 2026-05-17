'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import styles from "./slider-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const IMAGES = [
  {
    src: "https://picsum.photos/id/787/1600/900",
    alt: "An alpine lake between steep mountain walls",
  },
  {
    src: "https://picsum.photos/id/788/1600/900",
    alt: "A ridge line lit by late afternoon sun",
  },
  {
    src: "https://picsum.photos/id/791/1600/900",
    alt: "Snow patches scattered across a dark mountain face",
  },
  {
    src: "https://picsum.photos/id/806/1600/900",
    alt: "A winding trail through highland grass",
  },
];

export function ZoomPanSliderDemo() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider">
      <SliderSkeleton
        cache={demoSkeletonCache("zoom-pan-slider")}
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

      >
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
