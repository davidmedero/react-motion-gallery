'use client';

import { ZoomPanImage } from "../../../../../../packages/react-motion-gallery/src";
import styles from "./standalone-demo.module.css";

export function ZoomPanStandaloneDemo() {
  return (
    <div className={styles.shell}>
      <ZoomPanImage
        src="https://picsum.photos/id/1035/1600/2000"
        alt="A hiker looking over a canyon at dusk"
        className={styles.frame}
        imageClassName={styles.image}
        zoom={{
          clickZoomLevel: 2.35,
          maxZoomLevel: 3.5,
        }}
      />
    </div>
  );
}
