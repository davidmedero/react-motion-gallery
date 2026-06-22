export const source = `"use client";

import * as React from "react";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import styles from "./fullscreen-lazy-load-demo.module.css";

const FULLSCREEN_ITEMS = toMediaItems([
  {
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "Forest ridge under soft morning light",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "Rocky coastline with rolling surf",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "Mountain lake reflecting a clear sky",
  },
  {
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "Desert road passing through red stone",
  },
  {
    src: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "City architecture framed by evening light",
  },
  {
    src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2400&h=1350&q=80",
    alt: "Snow field below a quiet peak",
  },
]);

function FullscreenLazyLoadAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenLazyLoad(), fullscreenZoomPan()],
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

  return <>{fullscreenNode}</>;
}

function OpenFullscreenButton() {
  const core = useGalleryCore();

  const openFullscreen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      core.openFullscreenAt({
        index: 0,
        method: "fade",
        event: event.nativeEvent,
      });
    },
    [core],
  );

  return (
    <button type="button" className={styles.button} onClick={openFullscreen}>
      Open Fullscreen
    </button>
  );
}

export function FullscreenLazyLoadDemo() {
  return (
    <GalleryCore fullscreenItems={FULLSCREEN_ITEMS}>
      <section className={styles.shell}>
        <div className={styles.copy}>
          <span className={styles.kicker}>Fullscreen lazy load</span>
          <p className={styles.explainer}>
            Our IO system watches each base image or video from slider, grid,
            masonry, entries, or standalone surfaces. When that media comes into
            view, React Motion Gallery preloads the corresponding fullscreen
            image or video, improving the user experience without loading every
            fullscreen asset up front.
          </p>
        </div>
        <OpenFullscreenButton />
      </section>
      <FullscreenLazyLoadAddon />
    </GalleryCore>
  );
}
`;
