export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import { GalleryCore, Grid, ZoomPanImage } from "react-motion-gallery";

const IMAGES = [
  "https://picsum.photos/id/1046/1200/1500",
  "https://picsum.photos/id/1047/1200/1500",
  "https://picsum.photos/id/1048/1200/1500",
  "https://picsum.photos/id/1049/1200/1500",
  "https://picsum.photos/id/1050/1200/1500",
  "https://picsum.photos/id/1051/1200/1500",
];

export function ZoomPanGridDemo() {
  return (
    <GalleryCore layout="grid">
      <Grid columns={12} gap={{ 0: 12, 960: 16 }}>
        {IMAGES.map((src, index) => (
          <Grid.Item key={src} span={{ 0: "full", 700: 6, 1080: 4 }}>
            <ZoomPanImage
              src={src}
              alt={\`Zoomable grid image \${index + 1}\`}
              className="zoomPanGridFrame"
            />
          </Grid.Item>
        ))}
      </Grid>
    </GalleryCore>
  );
}`;
