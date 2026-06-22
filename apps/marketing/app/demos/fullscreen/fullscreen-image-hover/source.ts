export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import { zoomPanHover } from "react-motion-gallery/zoomPan/hover";
import styles from "./fullscreen-image-hover-demo.module.css";
import { useSyncExternalStore } from "react";

const SLIDES = [
  {
    previewSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=900&h=580&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&h=1547&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=240&h=154&q=80",
    alt: "A green valley opening toward distant ridges",
  },
  {
    previewSrc: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=900&h=580&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=2400&h=1547&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=240&h=154&q=80",
    alt: "Layered hills under a pale blue sky",
  },
  {
    previewSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=900&h=580&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2400&h=1547&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=240&h=154&q=80",
    alt: "A calm inlet bordered by dark forest",
  },
];

const FULLSCREEN_ITEMS = toMediaItems(
  SLIDES.map((slide) => ({
    src: slide.fullscreenSrc,
    alt: slide.alt,
  })),
);

function useDocumentClientWidth() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      window.visualViewport?.addEventListener("resize", onStoreChange);

      return () => {
        window.removeEventListener("resize", onStoreChange);
        window.visualViewport?.removeEventListener("resize", onStoreChange);
      };
    },
    () => document.documentElement.clientWidth,
    () => 0,
  );
}

function FullscreenImageHoverAddon() {
  const viewportWidth = useDocumentClientWidth();
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    plugins: [
      fullscreenSlider(),
      fullscreenLazyLoad(),
      fullscreenZoomPan({
        plugins: [
          zoomPanHover({
            zoomLevel: 2.4,
            zoomOutDurationMs: 260,
          }),
        ],
      }),
    ],
    fullscreen: {
      enabled: true,
      lazyLoad: {
        images: {
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
        },
      },
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide) => ({
          thumbSrc: slide.thumbSrc,
          alt: slide.alt,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={62}
        containerStyle={{
          width: viewportWidth || undefined,
          height: 104,
          padding: "18px 20px",
          overflow: "visible",
          background: "rgba(8, 13, 24, 0.84)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 -18px 48px rgba(0, 0, 0, 0.24)",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={10}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

function FullscreenImageButton(props: {
  slide: (typeof SLIDES)[number];
  index: number;
}) {
  const { slide, index } = props;
  const core = useGalleryCore();

  const openFullscreen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      core.openFullscreenAt({
        index,
        method: "fade",
        event: event.nativeEvent,
      });
    },
    [core, index],
  );

  return (
    <button
      type="button"
      className={styles.card}
      onClick={openFullscreen}
      aria-label={\`Open image \${index + 1} fullscreen\`}
    >
      <img src={slide.previewSrc} alt={slide.alt} className={styles.image} />
    </button>
  );
}

export function FullscreenImageHoverDemo() {
  return (
    <GalleryCore fullscreenItems={FULLSCREEN_ITEMS}>
      <div className={styles.shell}>
        {SLIDES.map((slide, index) => (
          <FullscreenImageButton
            key={slide.fullscreenSrc}
            slide={slide}
            index={index}
          />
        ))}
      </div>
      <FullscreenImageHoverAddon />
    </GalleryCore>
  );
}
`;
