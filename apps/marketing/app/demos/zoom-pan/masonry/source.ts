export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import { GalleryCore, Masonry, ZoomPanImage } from "react-motion-gallery";

const IMAGES = [
  { src: "https://picsum.photos/id/1060/1200/1500", ratio: "4 / 5" },
  { src: "https://picsum.photos/id/1061/1200/1680", ratio: "5 / 7" },
  { src: "https://picsum.photos/id/1062/1200/1320", ratio: "10 / 11" },
  { src: "https://picsum.photos/id/1063/1200/1800", ratio: "2 / 3" },
  { src: "https://picsum.photos/id/1064/1200/1440", ratio: "5 / 6" },
  { src: "https://picsum.photos/id/1065/1200/1560", ratio: "10 / 13" },
];

export function ZoomPanMasonryDemo() {
  return (
    <GalleryCore layout="masonry">
      <Masonry columns={{ 0: 1, 700: 2, 1080: 3 }} gap={{ 0: 12, 960: 16 }}>
        {IMAGES.map((image, index) => (
          <ZoomPanImage
            key={image.src}
            src={image.src}
            alt={\`Zoomable masonry image \${index + 1}\`}
            className="zoomPanMasonryFrame"
            style={{ aspectRatio: image.ratio }}
          />
        ))}
      </Masonry>
    </GalleryCore>
  );
}`;
