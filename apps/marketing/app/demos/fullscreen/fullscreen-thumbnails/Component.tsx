/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider, createSliderIndexChannel } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { ThumbnailSlider } from "react-motion-gallery/thumbnails";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import styles from "./fullscreen-thumbnails-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=240&h=360&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=240&h=360&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=240&h=360&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=240&h=360&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=240&h=360&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=900&h=1350&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1600&h=2400&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=240&h=360&q=80",
  },
];

function Slide({ slide, i }: { slide: (typeof SLIDES)[number]; i: number }) {
  return (
    <div className={styles.slideFrame}>
      <img
        src={slide.slideSrc}
        alt={`Slide ${i + 1}`}
        className={styles.slide}
      />
    </div>
  );
}

function Thumb({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Thumbnail ${i + 1}`}
      className={styles.thumbnailImage}
    />
  );
}

function FullscreenThumbnailsAddon() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController(
    {
      plugins: [fullscreenSlider(), fullscreenZoomPan()],
      fullscreen: {
        enabled: true,
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
        position="left"
        thumbnailsCenter
        thumbnailWidth={72}
        thumbnailHeight={108}
        containerStyle={{
          width: 112,
          height: "100dvh",
          padding: "18px 20px",
          overflow: "visible",
          background: "rgba(8, 13, 24, 0.82)",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "18px 0 48px rgba(0, 0, 0, 0.24)",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={10}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

export function FullscreenThumbnailsDemo() {
  const [indexChannel] = useState(() => createSliderIndexChannel());
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc),
  );

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <div className={styles.demoShell}>
        <div className={styles.thumbnailRailSlot}>
          <ThumbnailSlider
            indexChannel={indexChannel}
            options={{
              layout: {
                position: "left",
                gap: 10,
                center: true,
                thumbnail: {
                  width: 72,
                  height: 108,
                },
                container: {
                  width: 72,
                  height: "100%",
                },
              },
              scroll: {
                centerActiveThumb: true,
              },
              controls: {
                enabled: true,
              },
              elements: {
                container: {
                  className: styles.thumbnailRail,
                },
                thumbnail: {
                  className: styles.thumbnailThumb,
                },
              },
              transitions: {
                loading: {
                  skeletonCount: 5,
                  elements: {
                    container: {
                      className: styles.thumbnailSkeletonContainer,
                    },
                    thumbnail: {
                      className: styles.thumbnailSkeletonThumb,
                    },
                  },
                },
              },
            }}
          >
            {SLIDES.map((slide, i) => (
              <Thumb
                key={`thumb-${slide.thumbSrc}`}
                src={slide.thumbSrc}
                i={i}
              />
            ))}
          </ThumbnailSlider>
        </div>

        <div className={styles.sliderColumn}>
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
                    maxWidth: "360px",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            }}
            ready={sliderReady}
          >
            <Slider
              ref={sliderRef}
              indexChannel={indexChannel}
              plugins={[sliderFullscreen()]}
            >
              {SLIDES.map((slide, i) => (
                <Slide key={`img-${slide.slideSrc}-${i}`} slide={slide} i={i} />
              ))}
            </Slider>
          </SliderSkeleton>
        </div>
      </div>

      <FullscreenThumbnailsAddon />
    </GalleryCore>
  );
}
