export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import { GalleryCore, Slider, ZoomPanImage } from "react-motion-gallery";

const IMAGES = [
  "https://picsum.photos/id/995/1600/900",
  "https://picsum.photos/id/996/1600/900",
  "https://picsum.photos/id/997/1600/900",
  "https://picsum.photos/id/998/1600/900",
];

export function ZoomPanSliderDemo() {
  return (
    <GalleryCore layout="slider">
      <Slider>
        {IMAGES.map((src, index) => (
          <ZoomPanImage
            key={src}
            src={src}
            alt={\`Zoomable slide \${index + 1}\`}
            className="zoomPanSlide"
          />
        ))}
      </Slider>
    </GalleryCore>
  );
}`;
