export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenCaptions } from "react-motion-gallery/fullscreen/captions";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import styles from "./fullscreen-viewport-overlay-caption-sized-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/896/1600/900",
    fullscreenSrc: "https://picsum.photos/id/896/2400/1350",
    title: "Lorem ipsum dolor sit amet",
    location: "Consectetur adipiscing",
    description:
      "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    src: "https://picsum.photos/id/900/1600/900",
    fullscreenSrc: "https://picsum.photos/id/900/2400/1350",
    title: "Ut enim ad minim veniam",
    location: "Quis nostrud",
    description:
      "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    src: "https://picsum.photos/id/901/1600/900",
    fullscreenSrc: "https://picsum.photos/id/901/2400/1350",
    title: "Duis aute irure dolor",
    location: "In reprehenderit",
    description:
      "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    src: "https://picsum.photos/id/902/1600/900",
    fullscreenSrc: "https://picsum.photos/id/902/2400/1350",
    title: "Excepteur sint occaecat",
    location: "Cupidatat non proident",
    description:
      "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    src: "https://picsum.photos/id/907/1600/900",
    fullscreenSrc: "https://picsum.photos/id/907/2400/1350",
    title: "Sed ut perspiciatis unde",
    location: "Omnis iste natus",
    description:
      "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
  },
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenCaptions(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      caption: {
        layout: "overlay",
        overlayCrossfadeTarget: "content",
        placement: {
          xs: "bottom",
          lg: "right",
        },
        width: {
          lg: "32%",
          xl: "28%",
        },
        style: {
          padding: 0,
        },
        render: ({ index }) => {
          const slide = SLIDES[index];
          if (!slide) return null;

          return (
            <div className={styles.fullscreenCaption}>
              <p className={styles.fullscreenCaptionEyebrow}>
                {slide.location}
              </p>
              <p className={styles.fullscreenCaptionTitle}>
                {slide.title}
              </p>
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

export function FullscreenViewportOverlayCaptionSizedDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: 2,
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100cqw",
                    maxWidth: "550px",
                    aspectRatio: "16 / 9",
                    borderRadius: 12,
                  },
                },
              },
            }}
        ready={sliderReady}
      >
      <Slider
        ref={sliderRef}
        plugins={[
          sliderFullscreen(),
        ]}
      >
        {media.map((slide, index) => (
          <img
            key={slide.kind === "image" ? slide.src : index}
            src={SLIDES[index]?.src ?? ""}
            alt={SLIDES[index]?.title ?? ""}
            className={styles.slide}
          />
  
            ))}
      </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
`;
