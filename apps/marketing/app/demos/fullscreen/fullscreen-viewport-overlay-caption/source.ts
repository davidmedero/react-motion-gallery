export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./Demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1043/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1043/2400/1350",
    title: "Glacial Basin",
    location: "Banff, Alberta",
  },
  {
    src: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    title: "Red Cedar Trail",
    location: "Olympic Peninsula, WA",
  },
  {
    src: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    title: "Pacific Shelf",
    location: "Big Sur, California",
  },
  {
    src: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    title: "High Meadow",
    location: "Valais, Switzerland",
  },
  {
    src: "https://picsum.photos/id/1048/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/1350",
    title: "Erg at Dusk",
    location: "Merzouga, Morocco",
  },
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      caption: {
        layout: "overlay",
        placement: "bottom",
        render: ({ index }) => {
          const slide = SLIDES[index];
          if (!slide) return null;

          return (
            <div className={styles.fullscreenCaption}>
              <span className={styles.fullscreenCaptionIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.fullscreenCaptionBody}>
                <strong className={styles.fullscreenCaptionTitle}>
                  {slide.title}
                </strong>
                <span className={styles.fullscreenCaptionMeta}>
                  {slide.location}
                </span>
              </div>
            </div>
          );
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function Demo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider>
        {media.map((slide, index) => (
          <img
            key={slide.kind === "image" ? slide.src : index}
            src={SLIDES[index]?.src ?? ""}
            alt={SLIDES[index]?.title ?? ""}
            className={styles.slide}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
