/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider, type SliderHandle } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderAutoPlay } from "react-motion-gallery/slider/auto-play";
import { sliderProgress } from "react-motion-gallery/slider/progress";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-auto-play-demo.module.css";

const AUTO_PLAY_SPEED_MS = 2200;

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=2400&h=2400&q=80",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={`Slide ${i + 1}`} className={styles.slide} />;
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function AutoPlayProgress({
  sliderRef,
}: {
  sliderRef: RefObject<SliderHandle | null>;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      const timer = sliderRef.current?.getAutoPlayTimer();
      const progress = timer?.progress ?? 0;
      const active = timer?.active ?? false;
      const root = rootRef.current;
      const bar = barRef.current;

      if (root) {
        root.dataset.active = active ? "true" : "false";
        root.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      }

      if (bar) {
        bar.style.transform = `scaleX(${progress})`;
      }

      frame = window.requestAnimationFrame(sync);
    };

    frame = window.requestAnimationFrame(sync);

    return () => window.cancelAnimationFrame(frame);
  }, [sliderRef]);

  return (
    <div
      ref={rootRef}
      className={styles.autoplayProgress}
      role="progressbar"
      aria-label="Autoplay progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div ref={barRef} className={styles.autoplayProgressBar} />
    </div>
  );
}

export function SliderAutoPlayDemo() {
  const sliderRef = useRef<SliderHandle | null>(null);
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc),
  );

  const { ref: sliderReadyRef, ready: sliderReady } = useSliderReady();
  const setSliderRef = useCallback((handle: SliderHandle | null) => {
    sliderReadyRef(handle);
    sliderRef.current = handle;
  }, [sliderReadyRef]);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
          visibleCount: 3,
          mode: "peek",
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
                width: "100%",
                height: "100%",
                borderRadius: 12,
              },
            },
            itemWrapStyle: {
              width: "100cqw",
              maxWidth: "550px",
              aspectRatio: "16 / 9",
            },
            children: [
              {
                kind: "col",
                style: {
                  0: {
                    width: "100%",
                    padding: "18px 0 0",
                  },
                  768: {
                    width: "100%",
                    padding: "22px 0 0",
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "min(60%, 28rem)",
                      height: 6,
                      borderRadius: 999,
                      alignSelf: "center",
                      backgroundColor: "rgba(15, 23, 42, 0.18)",
                    },
                  },
                ],
              },
            ],
          },
        }}
        ready={sliderReady}
      >
        <Slider
          ref={setSliderRef}
          align="center"
          scroll={{
            loop: true,
            groupCells: true,
          }}
          elements={{
            viewport: {
              className: styles.sliderViewport,
            },
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderProgress({
              enabled: true,
              render: ({ hidden }) =>
                hidden ? null : <AutoPlayProgress sliderRef={sliderRef} />,
            }),
            sliderAutoPlay({
              enabled: true,
              speedMs: AUTO_PLAY_SPEED_MS,
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
      <FullscreenAddon />
    </GalleryCore>
  );
}
