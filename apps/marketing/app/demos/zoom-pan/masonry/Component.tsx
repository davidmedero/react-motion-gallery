'use client';

import {
  GalleryCore,
  Masonry,
  ZoomPanImage,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./masonry-demo.module.css";

const IMAGES = [
  {
    src: "https://picsum.photos/id/1060/1200/1500",
    alt: "A misty shoreline with dark rocks",
    ratio: "4 / 5",
  },
  {
    src: "https://picsum.photos/id/1061/1200/1680",
    alt: "A narrow street washed in morning light",
    ratio: "5 / 7",
  },
  {
    src: "https://picsum.photos/id/1062/1200/1320",
    alt: "A table setting with layered glassware",
    ratio: "10 / 11",
  },
  {
    src: "https://picsum.photos/id/1063/1200/1800",
    alt: "Tall palms framing a pale sky",
    ratio: "2 / 3",
  },
  {
    src: "https://picsum.photos/id/1064/1200/1440",
    alt: "A striped awning over a bright storefront",
    ratio: "5 / 6",
  },
  {
    src: "https://picsum.photos/id/1065/1200/1560",
    alt: "A sculptural stairwell with deep shadows",
    ratio: "10 / 13",
  },
];

export function ZoomPanMasonryDemo() {
  return (
    <GalleryCore layout="masonry">
      <Masonry columns={{ 0: 1, 700: 2, 1080: 3 }} gap={{ 0: 12, 960: 16 }}>
        {IMAGES.map((image) => (
          <ZoomPanImage
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={styles.frame}
            imageClassName={styles.image}
            style={{ aspectRatio: image.ratio }}
            zoom={{
              clickZoomLevel: 2.1,
              maxZoomLevel: 3.25,
            }}
          />
        ))}
      </Masonry>
    </GalleryCore>
  );
}
