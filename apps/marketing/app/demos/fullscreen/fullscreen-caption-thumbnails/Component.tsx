/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenCaptions } from "react-motion-gallery/fullscreen/captions";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import styles from "./fullscreen-caption-thumbnails-demo.module.css";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Lorem ipsum dolor sit amet",
    location: "Consectetur adipiscing",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Ut enim ad minim veniam",
    location: "Quis nostrud",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    src: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Duis aute irure dolor",
    location: "In reprehenderit",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Excepteur sint occaecat",
    location: "Cupidatat non proident",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Sed ut perspiciatis unde",
    location: "Omnis iste natus",
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  },
  {
    src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=240&h=135&q=80",
    title: "Nemo enim ipsam voluptatem",
    location: "Quia voluptas",
    description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
  },
];

function FullscreenCaptionThumbnailsAddon() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController(
    {
      plugins: [fullscreenSlider(), fullscreenCaptions(), fullscreenZoomPan()],
      fullscreen: {
        enabled: true,
        caption: {
          layout: "overlay",
          overlayCrossfadeTarget: "content",
          className: styles.fullscreenCaptionRoot,
          placement: {
            xs: "bottom",
            lg: "right",
          },
          width: {
            lg: "32%",
            xl: "28%",
          },
          height: {
            xs: 176,
            md: 188,
          },
          style: {
            padding: 0,
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
    },
  );

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: `Thumbnail ${i + 1}`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={112}
        thumbnailHeight={63}
        containerStyle={{
          boxSizing: "border-box",
          width: "100dvw",
          height: 104,
          padding: "18px 24px 20px",
          overflow: "visible",
          background: "rgba(8, 13, 24, 0.82)",
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

export function FullscreenCaptionThumbnailsDemo() {
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
      <FullscreenCaptionThumbnailsAddon />
    </GalleryCore>
  );
}
