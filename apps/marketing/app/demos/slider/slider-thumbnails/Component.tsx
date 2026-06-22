/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useSyncExternalStore } from "react";
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
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-thumbnails-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=320&h=200&q=80",
  },
  {
    slideSrc: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1600&h=900&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2400&h=1350&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=320&h=200&q=80",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={`Slide ${i + 1}`} className={styles.slide} />;
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

function FullscreenAddon() {
  const viewportWidth = useDocumentClientWidth();
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController(
    {
      plugins: [fullscreenSlider(), fullscreenZoomPan()],
      fullscreen: {
        enabled: true,
        effects: {
          introStickyNavSelector: ".rmg-intro-sticky-nav",
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
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: viewportWidth || undefined,
          padding: "8px 12px",
          overflow: "visible",
          background: "#fff",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

export function SliderThumbnailsDemo() {
  const [indexChannel] = useState(() => createSliderIndexChannel());
  const media = toMediaItems(SLIDES.map((slide) => slide.slideSrc));
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
        <Slider
          ref={sliderRef}
          indexChannel={indexChannel}
          reveal={{
            staggerMs: 200,
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderDots(),
          ]}
        >
          {media.map((item, i) => (
            <Slide
              key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
              src={SLIDES[i]?.slideSrc ?? ""}
              i={i}
            />
          ))}
        </Slider>
      </SliderSkeleton>

      <ThumbnailSlider
        indexChannel={indexChannel}
        options={{
          layout: {
            position: "bottom",
            gap: 12,
            thumbnail: {
              width: 96,
              height: 60,
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
              style: {
                marginTop: 14,
              },
            },
            thumbnail: {
              className: styles.thumbnailThumb,
            },
          },
          reveal: {
            durationMs: 1000,
          },
          transitions: {
            loading: {
              skeletonCount: 9,
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
          <Thumb key={`thumb-${slide.thumbSrc}`} src={slide.thumbSrc} i={i} />
        ))}
      </ThumbnailSlider>

      <FullscreenAddon />
    </GalleryCore>
  );
}
