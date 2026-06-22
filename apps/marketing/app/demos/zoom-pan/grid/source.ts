export const source = `"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { Grid } from "react-motion-gallery/grid";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-demo.module.css";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A portrait framed against a sandstone wall",
  },
  {
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A bright apartment interior with clean lines",
  },
  {
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A harbor scene with layered blue tones",
  },
  {
    src: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A dinner table lit by warm sunset light",
  },
  {
    src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A reading nook with linen and soft shadows",
  },
  {
    src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=1500&q=80",
    alt: "A canvas bag styled with small travel objects",
  },
];

const ZOOM_PAN_GRID_SKELETON = {
  radius: 20,
  layout: {
    kind: "grid",
    item: {
      kind: "rect",
      style: {
        width: "100%",
        aspectRatio: "4 / 5",
        borderRadius: 20,
        overflow: "hidden",
      },
    },
    slots: IMAGES.map(() => ({
      span: { 0: "full", 700: 6, 1080: 4 },
    })),
  },
} satisfies GridSkeletonSpec;

export function ZoomPanGridDemo() {
  return (
    <GalleryCore layout="grid">
      <Grid
        columns={12}
        gap={{ 0: 12, 960: 16 }}
        loading={{
          skeleton: ZOOM_PAN_GRID_SKELETON,
        }}
        reveal={{
          staggerMs: 60,
        }}
      >
        {IMAGES.map((image) => (
          <Grid.Item key={image.src} span={{ 0: "full", 700: 6, 1080: 4 }}>
            <ZoomPanImage
              src={image.src}
              alt={image.alt}
              className={styles.frame}
              imageClassName={styles.image}
              zoom={{
                clickZoomLevel: 2.1,
                maxZoomLevel: 3.25,
              }}
            />
          </Grid.Item>
        ))}
      </Grid>
    </GalleryCore>
  );
}
`;
