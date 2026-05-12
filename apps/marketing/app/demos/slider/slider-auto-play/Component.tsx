/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useEffect,
  useRef,
  type RefObject } from "react";
import {
  GalleryCore,
  Slider,
  useSliderReady,
  type SliderHandle,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { sliderAutoPlay } from "../../../../../../packages/react-motion-gallery/src/slider-auto-play";
import { sliderProgress } from "../../../../../../packages/react-motion-gallery/src/slider-progress";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-auto-play-demo.module.css";

const AUTO_PLAY_SPEED_MS = 2200;

const SLIDES = [
  {
    src: "https://picsum.photos/id/256/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/256/2400/2400",
  },
  {
    src: "https://picsum.photos/id/257/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/257/2400/2400",
  },
  {
    src: "https://picsum.photos/id/261/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/261/2400/2400",
  },
  {
    src: "https://picsum.photos/id/264/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/264/2400/2400",
  },
  {
    src: "https://picsum.photos/id/265/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/265/2400/2400",
  },
  {
    src: "https://picsum.photos/id/266/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/266/2400/2400",
  },
  {
    src: "https://picsum.photos/id/271/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/271/2400/2400",
  },
  {
    src: "https://picsum.photos/id/274/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/274/2400/2400",
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
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  const { ref: sliderReadyRef, ready: sliderReady } = useSliderReady();
  const setSliderRef = (handle: SliderHandle | null) => {
    sliderReadyRef(handle);
    sliderRef.current = handle;
  };

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
                  justify: "center"
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
          groupCells: true
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
