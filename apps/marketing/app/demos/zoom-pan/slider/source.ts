export const source = String.raw`'use client';

import {
  GalleryCore,
  Slider,
  useSliderReady,
  ZoomPanImage,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import styles from "./slider-demo.module.css";

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
`;
