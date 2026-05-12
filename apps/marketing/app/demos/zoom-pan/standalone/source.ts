export const source = String.raw`'use client';

import * as React from "react";
import { ZoomPanImage } from "../../../../../../packages/react-motion-gallery/src";
import {
  Skeleton,
  type SkeletonNode,
} from "../../../../../../packages/react-motion-gallery/src/skeleton-base";
import styles from "./standalone-demo.module.css";

const ZOOM_PAN_SKELETON: SkeletonNode = {
  kind: "rect",
  style: {
    width: "100%",
    height: "100%",
  },
};

export function ZoomPanStandaloneDemo() {
  const zoomPanRef = React.useRef<HTMLDivElement | null>(null);
  const [imageReady, setImageReady] = React.useState(false);
  const markImageReady = React.useCallback(() => {
    setImageReady(true);
  }, []);

  React.useEffect(() => {
    const image = zoomPanRef.current?.querySelector<HTMLImageElement>(
      'img[data-rmg-zoom-pan-image="true"]'
    );

    if (image?.complete) {
      markImageReady();
    }
  }, [markImageReady]);

  return (
    <div className={styles.shell}>
      <Skeleton
        layout={ZOOM_PAN_SKELETON}
        ready={imageReady}
        shellClassName={styles.frame}
        contentClassName={styles.content}
        className={styles.skeletonSurface}
        backgroundColor="#d7e2ec"
        radius={16}
        timing={{ exitMs: 500 }}
        ariaLabel={imageReady ? undefined : "Loading zoomable image"}
      >
        <ZoomPanImage
          ref={zoomPanRef}
          src="https://picsum.photos/id/779/1920/1160"
          alt="A hiker looking over a canyon at dusk"
          className={styles.zoomPan}
          imageClassName={styles.image}
          onLoad={markImageReady}
          onError={markImageReady}
          zoom={{
            clickZoomLevel: 2.35,
            maxZoomLevel: 3.5,
          }}
        />
      </Skeleton>
    </div>
  );
}
`;
