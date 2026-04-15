/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from "react";
import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./fullscreen-fade-effects-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/1015/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1015/2400/1350",
    thumbSrc: "https://picsum.photos/id/1015/320/200",
    title: "River Bend",
    location: "North Cascades",
  },
  {
    slideSrc: "https://picsum.photos/id/1016/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1016/2400/1350",
    thumbSrc: "https://picsum.photos/id/1016/320/200",
    title: "High Desert Light",
    location: "Owyhee Canyonlands",
  },
  {
    slideSrc: "https://picsum.photos/id/1025/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1025/2400/1350",
    thumbSrc: "https://picsum.photos/id/1025/320/200",
    title: "Granite Face",
    location: "Sierra Nevada",
  },
  {
    slideSrc: "https://picsum.photos/id/1039/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1039/2400/1350",
    thumbSrc: "https://picsum.photos/id/1039/320/200",
    title: "Rain Coast",
    location: "Pacific Rim",
  },
  {
    slideSrc: "https://picsum.photos/id/1040/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1040/2400/1350",
    thumbSrc: "https://picsum.photos/id/1040/320/200",
    title: "Evening Dunes",
    location: "Outer Banks",
  },
  {
    slideSrc: "https://picsum.photos/id/1050/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1050/2400/1350",
    thumbSrc: "https://picsum.photos/id/1050/320/200",
    title: "Blue Ridge Haze",
    location: "Appalachia",
  },
];

function FadeOpenSlide(props: { slide: (typeof SLIDES)[number] }) {
  const { slide } = props;
  return (
    <img
      src={slide.slideSrc}
      alt={slide.title}
      className={styles.slideImage}
    />
  );
}

function FullscreenFadeEffectsAddon() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
      effects: {
        introFade: true,
        controlsFade: true,
        dragFade: true,
        slideFadeDuration: 560,
        slideFadeEasing: "cubic-bezier(.22,1,.36,1)",
      },
      caption: {
        layout: "slide",
        placement: "right",
        breakpoint: 960,
        width: 260,
        render: ({ index }) => {
          const slide = SLIDES[index];
          if (!slide) return null;

          return (
            <div className={styles.fullscreenCaption}>
              <strong className={styles.fullscreenCaptionTitle}>
                {slide.title}
              </strong>
              <span className={styles.fullscreenCaptionMeta}>
                {slide.location}
              </span>
            </div>
          );
        },
      },
    },
  });

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
        thumbnailWidth={104}
        thumbnailHeight={64}
        containerStyle={{
          width: "100dvw",
          padding: "10px 12px 14px",
          overflow: "visible",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

export function FullscreenFadeEffectsDemo() {
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => ({
      src: slide.fullscreenSrc,
      alt: slide.title,
    }))
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
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
                    borderRadius: 18,
                  },
                },
              },
            },
          },
        }}
      >
        {SLIDES.map((slide, i) => (
          <FadeOpenSlide
            key={`fade-slide-${slide.fullscreenSrc}-${i}`}
            slide={slide}
          />
        ))}
      </Slider>
      <FullscreenFadeEffectsAddon />
    </GalleryCore>
  );
}
