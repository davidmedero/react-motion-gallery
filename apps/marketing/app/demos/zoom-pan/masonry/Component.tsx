"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { Masonry } from "react-motion-gallery/masonry";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import type { MasonrySkeletonProps } from "react-motion-gallery/skeleton/masonry";
import styles from "./masonry-demo.module.css";

const IMAGES = [
  {
    src: "https://picsum.photos/id/830/1200/1500",
    alt: "A misty shoreline with dark rocks",
    ratio: "4 / 5",
  },
  {
    src: "https://picsum.photos/id/848/1200/1680",
    alt: "A narrow street washed in morning light",
    ratio: "5 / 7",
  },
  {
    src: "https://picsum.photos/id/849/1200/1320",
    alt: "A table setting with layered glassware",
    ratio: "10 / 11",
  },
  {
    src: "https://picsum.photos/id/851/1200/1800",
    alt: "Tall palms framing a pale sky",
    ratio: "2 / 3",
  },
  {
    src: "https://picsum.photos/id/852/1200/1440",
    alt: "A striped awning over a bright storefront",
    ratio: "5 / 6",
  },
  {
    src: "https://picsum.photos/id/853/1200/1560",
    alt: "A sculptural stairwell with deep shadows",
    ratio: "10 / 13",
  },
];

function dimensionsFromRatio(ratio: string) {
  const [rawWidth, rawHeight] = ratio.split("/").map((part) => Number(part.trim()));
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : width;
  return { width, height };
}

const ZOOM_PAN_MASONRY_SKELETON = {
  radius: 20,
  className: styles.masonryRoot,
  items: IMAGES.map((image) => dimensionsFromRatio(image.ratio)),
} satisfies MasonrySkeletonProps;

export function ZoomPanMasonryDemo() {
  return (
    <GalleryCore layout="masonry">
      <Masonry
        columns={{ 0: 1, 700: 2, 1080: 3 }}
        gap={{ 0: 12, 960: 16 }}
        reveal={{ staggerMs: 60 }}
        loading={{
          count: IMAGES.length,
          skeleton: ZOOM_PAN_MASONRY_SKELETON,
        }}
      >
        {IMAGES.map((image) => {
          const dimensions = dimensionsFromRatio(image.ratio);

          return (
            <Masonry.Item
              key={image.src}
              width={dimensions.width}
              height={dimensions.height}
            >
              <ZoomPanImage
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
            </Masonry.Item>
          );
        })}
      </Masonry>
    </GalleryCore>
  );
}
