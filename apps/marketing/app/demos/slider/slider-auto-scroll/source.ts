export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderAutoScroll } from "react-motion-gallery/slider/auto-scroll";
import { sliderProgress } from "react-motion-gallery/slider/progress";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-auto-scroll-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/235/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/235/2400/2400",
  },
  {
    src: "https://picsum.photos/id/243/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/243/2400/2400",
  },
  {
    src: "https://picsum.photos/id/244/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/244/2400/2400",
  },
  {
    src: "https://picsum.photos/id/247/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/247/2400/2400",
  },
  {
    src: "https://picsum.photos/id/249/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/249/2400/2400",
  },
  {
    src: "https://picsum.photos/id/251/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/251/2400/2400",
  },
  {
    src: "https://picsum.photos/id/254/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/254/2400/2400",
  },
  {
    src: "https://picsum.photos/id/255/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/255/2400/2400",
  },
];

const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
const FULLSCREEN_MEDIA = toMediaItems(
  SLIDES.map((slide) => slide.fullscreenSrc),
);

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={\`Slide \${i + 1}\`} className={styles.slide} />;
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

export function SliderAutoScrollDemo() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_MEDIA}>
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
              maxWidth: "320px",
              aspectRatio: "4 / 5",
            },
            children: [
              {
                kind: "col",
                style: {
                  0: {
                    width: "100%",
                    padding: "18px 0 0 0",
                  },
                  768: {
                    width: "100%",
                    padding: "22px 0 0 0",
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "60%",
                      height: 4,
                      borderRadius: 999,
                      alignSelf: "center",
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
          ref={sliderRef}
          align="center"
          scroll={{
            loop: true,
          }}
          elements={{
            viewport: {
              className: styles.slider_viewport,
            },
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderProgress({
              enabled: true,
              root: {
                style: {
                  bottom: "0px",
                },
              },
            }),
            sliderAutoScroll({
              enabled: true,
            }),
          ]}
        >
          {MEDIA.map((item, i) => (
            <Slide
              key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
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
`;
