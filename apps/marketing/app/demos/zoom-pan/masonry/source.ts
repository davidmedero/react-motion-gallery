export const source = String.raw`'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { Masonry } from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/masonry";
import type { MasonrySkeletonSpec } from "react-motion-gallery/skeleton/masonry";
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

function createZoomPanMasonrySkeletonItem(ratio: string) {
  return {
    kind: "rect",
    style: {
      width: "100%",
      aspectRatio: ratio,
      borderRadius: 20,
      overflow: "hidden",
    },
  } as const;
}

const ZOOM_PAN_MASONRY_SKELETON = {
  radius: 20,
  className: styles.masonryRoot,
  layout: {
    kind: "masonry",
    item: createZoomPanMasonrySkeletonItem(IMAGES[0]!.ratio),
    slots: IMAGES.map((image) => ({
      item: createZoomPanMasonrySkeletonItem(image.ratio),
    })),
  },
} satisfies MasonrySkeletonSpec;

export function ZoomPanMasonryDemo() {
  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <GalleryCore layout="masonry">
      <MasonrySkeleton
        layout={ZOOM_PAN_MASONRY_SKELETON}
        ready={masonryReady}
        masonry={{
          count: IMAGES.length,
          columns: { 0: 1, 700: 2, 1080: 3 },
          gap: { 0: 12, 960: 16 },
        }}
      >
        <Masonry
          ref={masonryRef}
          columns={{ 0: 1, 700: 2, 1080: 3 }}
          gap={{ 0: 12, 960: 16 }}
          intro={{ staggerMs: 60 }}
        >
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
      </MasonrySkeleton>
    </GalleryCore>
  );
}`;
