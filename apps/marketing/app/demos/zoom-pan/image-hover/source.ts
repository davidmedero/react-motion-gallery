export const source = `"use client";

import * as React from "react";
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { zoomPanHover } from "react-motion-gallery/zoomPan/hover";
import {
  Skeleton,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/cache/base";
import styles from "./image-hover-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const IMAGE_HOVER_SKELETON: SkeletonNode = {
  kind: "rect",
  style: {
    width: "100%",
    height: "100%",
  },
};

export function ZoomPanImageHoverDemo() {
  const zoomPanRef = React.useRef<HTMLDivElement | null>(null);
  const [imageReady, setImageReady] = React.useState(false);
  const markImageReady = React.useCallback(() => {
    setImageReady(true);
  }, []);

  React.useEffect(() => {
    const image = zoomPanRef.current?.querySelector<HTMLImageElement>(
      'img[data-rmg-zoom-pan-image="true"]',
    );

    if (image?.complete) {
      markImageReady();
    }
  }, [markImageReady]);

  return (
    <div className={styles.shell}>
      <Skeleton
        cache={demoSkeletonCache("zoom-pan-image-hover")}
        layout={IMAGE_HOVER_SKELETON}
        ready={imageReady}
        shellClassName={styles.frame}
        contentClassName={styles.content}
        className={styles.skeletonSurface}
        backgroundColor="#d7e2ec"
        radius={16}
        timing={{ exitMs: 500 }}
        ariaLabel={imageReady ? undefined : "Loading hover zoom image"}
      >
        <ZoomPanImage
          ref={zoomPanRef}
          src="https://picsum.photos/id/889/1920/1160"
          alt="Sunlit cliffs above a winding alpine road"
          className={styles.zoomPan}
          imageClassName={styles.image}
          onLoad={markImageReady}
          onError={markImageReady}
          zoom={{
            clickZoomLevel: 2.35,
            maxZoomLevel: 3.5,
            plugins: [
              zoomPanHover({
                zoomLevel: 2.35,
                zoomOutDurationMs: 260,
              }),
            ],
          }}
        />
      </Skeleton>
    </div>
  );
}
`;
