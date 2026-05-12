/* eslint-disable @next/next/no-img-element */
'use client';

import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  useSliderReady,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenCrossfade } from "../../../../../../packages/react-motion-gallery/src/fullscreen-crossfade";
import { sliderCrossfade } from "../../../../../../packages/react-motion-gallery/src/slider-crossfade";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import styles from "./fullscreen-fade-effects-demo.module.css";

const CROSSFADE_DURATION_MS = 560;
const CROSSFADE_EASING = "cubic-bezier(.22,1,.36,1)";

const URLS = [
  "https://picsum.photos/id/919/1600/900",
  "https://picsum.photos/id/921/1600/900",
  "https://picsum.photos/id/923/1600/900",
  "https://picsum.photos/id/924/1600/900",
  "https://picsum.photos/id/925/1600/900",
  "https://picsum.photos/id/927/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/919/2400/1350",
  "https://picsum.photos/id/921/2400/1350",
  "https://picsum.photos/id/923/2400/1350",
  "https://picsum.photos/id/924/2400/1350",
  "https://picsum.photos/id/925/2400/1350",
  "https://picsum.photos/id/927/2400/1350",
];

const THUMB_URLS = [
  "https://picsum.photos/id/919/320/200",
  "https://picsum.photos/id/921/320/200",
  "https://picsum.photos/id/923/320/200",
  "https://picsum.photos/id/924/320/200",
  "https://picsum.photos/id/925/320/200",
  "https://picsum.photos/id/927/320/200",
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

function FullscreenFadeEffectsAddon() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenCrossfade(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      effects: {
        introFade: true,
        introDuration: 700,
        introEasing: CROSSFADE_EASING,
        crossfade: {
          controls: true,
          drag: true,
          durationMs: CROSSFADE_DURATION_MS,
          easing: CROSSFADE_EASING,
        },
      },
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={THUMB_URLS.map((thumbSrc, i) => ({
          thumbSrc,
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
          background: "rgba(7, 11, 18, 0.72)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 -18px 48px rgba(0, 0, 0, 0.24)",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
        fadeDurationMs={CROSSFADE_DURATION_MS}
        thumbnailCrossfade={{
          enabled: true,
          durationMs: CROSSFADE_DURATION_MS,
          easing: CROSSFADE_EASING,
        }}
      />
    </>
  );
}

export function FullscreenFadeEffectsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
              visibleCount: 3,
              mode: "peek",
              style: {
                overflow: "hidden",
              },
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                  justify: "center",
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100cqw",
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
        scroll={{
          loop: true,
        }}
        align="center"

        plugins={[
          sliderFullscreen(),
          sliderArrows(),
          sliderDots(),
          sliderCrossfade({
            controls: true,
            drag: true,
            durationMs: CROSSFADE_DURATION_MS,
            easing: CROSSFADE_EASING,
          }),
        ]}
      >
        {media.map((item, i) => (
          <Slide
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
  
            ))}
      </Slider>
      </SliderSkeleton>
      <FullscreenFadeEffectsAddon />
    </GalleryCore>
  );
}
