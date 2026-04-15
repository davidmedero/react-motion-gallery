'use client';

import {
  GalleryCore,
  Slider,
  ZoomPanImage,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-demo.module.css";

const IMAGES = [
  {
    src: "https://picsum.photos/id/995/1600/900",
    alt: "An alpine lake between steep mountain walls",
  },
  {
    src: "https://picsum.photos/id/996/1600/900",
    alt: "A ridge line lit by late afternoon sun",
  },
  {
    src: "https://picsum.photos/id/997/1600/900",
    alt: "Snow patches scattered across a dark mountain face",
  },
  {
    src: "https://picsum.photos/id/998/1600/900",
    alt: "A winding trail through highland grass",
  },
];

export function ZoomPanSliderDemo() {
  return (
    <GalleryCore layout="slider">
      <Slider>
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
    </GalleryCore>
  );
}
