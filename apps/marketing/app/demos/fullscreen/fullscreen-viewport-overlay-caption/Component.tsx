/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  useSliderReady,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenCaptions } from "../../../../../../packages/react-motion-gallery/src/fullscreen-captions";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import styles from "./fullscreen-viewport-overlay-caption-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/872/1600/900",
    fullscreenSrc: "https://picsum.photos/id/872/2400/1350",
    title: "Lorem ipsum dolor sit amet",
    location: "Consectetur adipiscing",
  },
  {
    src: "https://picsum.photos/id/873/1600/900",
    fullscreenSrc: "https://picsum.photos/id/873/2400/1350",
    title: "Ut enim ad minim veniam",
    location: "Quis nostrud",
  },
  {
    src: "https://picsum.photos/id/875/1600/900",
    fullscreenSrc: "https://picsum.photos/id/875/2400/1350",
    title: "Duis aute irure dolor",
    location: "In reprehenderit",
  },
  {
    src: "https://picsum.photos/id/879/1600/900",
    fullscreenSrc: "https://picsum.photos/id/879/2400/1350",
    title: "Excepteur sint occaecat",
    location: "Cupidatat non proident",
  },
  {
    src: "https://picsum.photos/id/890/1600/900",
    fullscreenSrc: "https://picsum.photos/id/890/2400/1350",
    title: "Sed ut perspiciatis unde",
    location: "Omnis iste natus",
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
        placement: "bottom",
        style: {
          padding: 0,
        },
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

export function FullscreenViewportOverlayCaptionDemo() {
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
