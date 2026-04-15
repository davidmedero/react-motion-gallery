export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import { ZoomPanImage } from "react-motion-gallery";

export function ZoomPanStandaloneDemo() {
  return (
    <ZoomPanImage
      src="https://picsum.photos/id/1035/1600/2000"
      alt="A hiker looking over a canyon at dusk"
      className="zoomPanStandalone"
      zoom={{
        clickZoomLevel: 2.35,
        maxZoomLevel: 3.5,
      }}
    />
  );
}`;
