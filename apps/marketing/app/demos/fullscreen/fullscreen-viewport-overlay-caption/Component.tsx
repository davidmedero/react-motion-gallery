/* eslint-disable @next/next/no-img-element */
"use client";

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
import styles from "./fullscreen-viewport-overlay-caption-demo.module.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=2400&h=1350&q=80",
    title: "Lorem ipsum dolor sit amet",
    location: "Consectetur adipiscing",
  },
  {
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&h=1350&q=80",
    title: "Ut enim ad minim veniam",
    location: "Quis nostrud",
  },
  {
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=2400&h=1350&q=80",
    title: "Duis aute irure dolor",
    location: "In reprehenderit",
  },
  {
    src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&h=1350&q=80",
    title: "Excepteur sint occaecat",
    location: "Cupidatat non proident",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&h=1350&q=80",
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
    SLIDES.map((slide) => slide.fullscreenSrc),
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
        <Slider ref={sliderRef} plugins={[sliderFullscreen()]}>
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
