'use client';

import {
  GalleryCore,
  Grid,
  ZoomPanImage,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./grid-demo.module.css";

const IMAGES = [
  {
    src: "https://picsum.photos/id/1046/1200/1500",
    alt: "A portrait framed against a sandstone wall",
  },
  {
    src: "https://picsum.photos/id/1047/1200/1500",
    alt: "A bright apartment interior with clean lines",
  },
  {
    src: "https://picsum.photos/id/1048/1200/1500",
    alt: "A harbor scene with layered blue tones",
  },
  {
    src: "https://picsum.photos/id/1049/1200/1500",
    alt: "A dinner table lit by warm sunset light",
  },
  {
    src: "https://picsum.photos/id/1050/1200/1500",
    alt: "A reading nook with linen and soft shadows",
  },
  {
    src: "https://picsum.photos/id/1051/1200/1500",
    alt: "A canvas bag styled with small travel objects",
  },
];

export function ZoomPanGridDemo() {
  return (
    <GalleryCore layout="grid">
      <Grid columns={12} gap={{ 0: 12, 960: 16 }}>
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
