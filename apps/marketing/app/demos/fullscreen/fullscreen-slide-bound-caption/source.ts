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
    description:
      "Ribboned ice fields and meltwater channels keep redrawing the same valley floor every summer.",
  },
  {
    src: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    title: "Red Cedar Trail",
    location: "Olympic Peninsula, WA",
    description:
      "The canopy pulls the light down into a low green haze, with every footstep dampened by moss.",
  },
  {
    src: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    title: "Pacific Shelf",
    location: "Big Sur, California",
    description:
      "At low tide the rock shelf opens into long reflective seams before the surf closes back in.",
  },
  {
    src: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    title: "High Meadow",
    location: "Valais, Switzerland",
    description:
      "The meadow line shifts uphill for a few weeks each year, then gives way again to thin air and stone.",
  },
  {
    src: "https://picsum.photos/id/1048/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/1350",
    title: "Erg at Dusk",
    location: "Merzouga, Morocco",
    description:
      "Wind-scored dunes keep their crests only briefly, changing shape between each afternoon pass.",
  },
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      caption: {
        layout: "slide",
        placement: {
          xs: "bottom",
          lg: "right",
        },
        height: {
          xs: 168,
          md: 216,
        },
        width: {
          lg: "34%",
          xl: "30%",
        },
        render: ({ index }) => {
          const slide = SLIDES[index];
          if (!slide) return null;

          return (
            <div className={styles.fullscreenCaption}>
              <span className={styles.fullscreenCaptionEyebrow}>
                {slide.location}
              </span>
              <strong className={styles.fullscreenCaptionTitle}>
                {slide.title}
              </strong>
              <p className={styles.fullscreenCaptionCopy}>
                {slide.description}
              </p>
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
