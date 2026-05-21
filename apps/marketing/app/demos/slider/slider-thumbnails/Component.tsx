/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useState,
  useSyncExternalStore } from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider, createSliderIndexChannel } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { ThumbnailSlider } from "react-motion-gallery/thumbnails";
import { SliderSkeleton } from "react-motion-gallery/skeleton/cache/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-thumbnails-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

const SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/193/1600/900",
    fullscreenSrc: "https://picsum.photos/id/193/2400/1350",
    thumbSrc: "https://picsum.photos/id/193/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/196/1600/900",
    fullscreenSrc: "https://picsum.photos/id/196/2400/1350",
    thumbSrc: "https://picsum.photos/id/196/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/197/1600/900",
    fullscreenSrc: "https://picsum.photos/id/197/2400/1350",
    thumbSrc: "https://picsum.photos/id/197/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/198/1600/900",
    fullscreenSrc: "https://picsum.photos/id/198/2400/1350",
    thumbSrc: "https://picsum.photos/id/198/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/202/1600/900",
    fullscreenSrc: "https://picsum.photos/id/202/2400/1350",
    thumbSrc: "https://picsum.photos/id/202/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/204/1600/900",
    fullscreenSrc: "https://picsum.photos/id/204/2400/1350",
    thumbSrc: "https://picsum.photos/id/204/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/206/1600/900",
    fullscreenSrc: "https://picsum.photos/id/206/2400/1350",
    thumbSrc: "https://picsum.photos/id/206/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/213/1600/900",
    fullscreenSrc: "https://picsum.photos/id/213/2400/1350",
    thumbSrc: "https://picsum.photos/id/213/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/215/1600/900",
    fullscreenSrc: "https://picsum.photos/id/215/2400/1350",
    thumbSrc: "https://picsum.photos/id/215/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/217/1600/900",
    fullscreenSrc: "https://picsum.photos/id/217/2400/1350",
    thumbSrc: "https://picsum.photos/id/217/320/200",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      className={styles.slide}
    />
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
    () => 0
  );
}

function FullscreenAddon() {
  const viewportWidth = useDocumentClientWidth();
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      effects: {
        introStickyNavSelector: ".rmg-intro-sticky-nav",
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
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: viewportWidth || undefined,
          padding: "8px 12px",
          overflow: "visible",
          background: "#fff"
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
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-thumbnails")}
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
        transitions={{
          intro: {
            staggerMs: 200
          }
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
            intro: {
              durationMs: 1000
            }
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

      <FullscreenAddon />
    </GalleryCore>
  );
}
