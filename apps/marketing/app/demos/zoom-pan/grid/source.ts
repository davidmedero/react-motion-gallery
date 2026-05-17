export const source = `'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { Grid } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const IMAGES = [
  {
    src: "https://picsum.photos/id/807/1200/1500",
    alt: "A portrait framed against a sandstone wall",
  },
  {
    src: "https://picsum.photos/id/808/1200/1500",
    alt: "A bright apartment interior with clean lines",
  },
  {
    src: "https://picsum.photos/id/824/1200/1500",
    alt: "A harbor scene with layered blue tones",
  },
  {
    src: "https://picsum.photos/id/825/1200/1500",
    alt: "A dinner table lit by warm sunset light",
  },
  {
    src: "https://picsum.photos/id/827/1200/1500",
    alt: "A reading nook with linen and soft shadows",
  },
  {
    src: "https://picsum.photos/id/829/1200/1500",
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
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid">
      <GridSkeleton
        cache={demoSkeletonCache("zoom-pan-grid")}
        layout={ZOOM_PAN_GRID_SKELETON}
        ready={gridReady}
        grid={{
          count: IMAGES.length,
          columns: 12,
          gap: { 0: 12, 960: 16 },
          allowItemSpans: true,
        }}
      >
        <Grid
          ref={gridRef}
          columns={12}
          gap={{ 0: 12, 960: 16 }}
          intro={{
            staggerMs: 60
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
      </GridSkeleton>
    </GalleryCore>
  );
}`;
