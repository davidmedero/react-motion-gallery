export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import {
  SliderSkeleton,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import { sliderLazyLoad } from "react-motion-gallery/slider/lazy-load";
import { sliderCrossfade } from "react-motion-gallery/slider/crossfade";
import { sliderScrollbar } from "react-motion-gallery/slider/scrollbar";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-virtualization-demo.module.css";

const SLIDE_COUNT = 500;

const UNSPLASH_PHOTO_IDS = [
  "1469474968028-56623f02e42e",
  "1493246507139-91e8fad9978e",
  "1500534314209-a25ddb2bd429",
  "1447752875215-b2761acb3c5d",
  "1472214103451-9374bd1c798e",
  "1498855926480-d98e83099315",
  "1497436072909-60f360e1d4b1",
  "1519904981063-b0cf448d479e",
  "1470071459604-3b5ec3a7fe05",
  "1475924156734-496f6cac6ec1",
  "1502082553048-f009c37129b9",
  "1482192505345-5655af888cc4",
  "1448375240586-882707db888b",
  "1470770841072-f978cf4d019e",
  "1523712999610-f77fbcfc3843",
  "1495344517868-8ebaf0a2044a",
  "1532274402911-5a369e4c4bb5",
  "1520962922320-2038eebab146",
  "1500534623283-312aade485b7",
  "1506744038136-46273834b3fb",
  "1519681393784-d120267933ba",
  "1500530855697-b586d89ba3ee",
  "1501785888041-af3ef285b470",
  "1507525428034-b723cf961d3e",
];

const VIRTUALIZATION = {
  enabled: true,
  overscan: 3,
  threshold: 40,
};

const CELLS_PER_SLIDE = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

function sliderArrowSkeleton(direction: "prev" | "next"): SkeletonNode {
  const sideStyle = direction === "prev" ? { left: 10 } : { right: 10 };
  const upperBarTransform =
    direction === "prev" ? "rotate(-45deg)" : "rotate(45deg)";
  const lowerBarTransform =
    direction === "prev" ? "rotate(45deg)" : "rotate(-45deg)";

  return {
    kind: "stack",
    style: {
      position: "absolute",
      ...sideStyle,
      top: "43%",
      transform: "translateY(-50%)",
      zIndex: 3,
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
      overflow: "hidden",
    },
    children: [
      {
        kind: "row",
        style: {
          position: "absolute",
          left: 12,
          top: 13,
          width: 12,
          height: 3,
          borderRadius: 999,
          backgroundColor: "#000",
          transform: upperBarTransform,
        },
        children: [],
      },
      {
        kind: "row",
        style: {
          position: "absolute",
          left: 12,
          top: 20,
          width: 12,
          height: 3,
          borderRadius: 999,
          backgroundColor: "#000",
          transform: lowerBarTransform,
        },
        children: [],
      },
    ],
  };
}

function buildUnsplashUrls(width: number, height: number) {
  return Array.from({ length: SLIDE_COUNT }, (_, index) => {
    const photoId = UNSPLASH_PHOTO_IDS[index % UNSPLASH_PHOTO_IDS.length];
    const slideId = String(index + 1).padStart(3, "0");

    return (
      "https://images.unsplash.com/photo-" +
      photoId +
      "?auto=format&fit=crop&crop=entropy&cs=tinysrgb&w=" +
      width +
      "&h=" +
      height +
      "&q=80&rmgSlide=" +
      slideId
    );
  });
}

const URLS = buildUnsplashUrls(1200, 1200);
const FS_URLS = buildUnsplashUrls(2400, 2400);
const MEDIA = toMediaItems(URLS);
const FULLSCREEN_MEDIA = toMediaItems(FS_URLS);

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={"Slide " + (i + 1)} className={styles.slide} />;
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenLazyLoad(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      slider: {
        virtualization: VIRTUALIZATION,
      },
      lazyLoad: {
        images: {
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderVirtualizationDemo() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_MEDIA}>
      <SliderSkeleton
        layout={{
          visibleCount: CELLS_PER_SLIDE,
          mode: "fit",
          layout: {
            kind: "slider",
            direction: "row",
            style: {
              gap: 20,
            },
            itemStretch: false,
            item: {
              kind: "rect",
              style: {
                width: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 12,
                backgroundColor: "rgba(125, 211, 252, 0.14)",
                overflow: "hidden",
              },
            },
            rowHeightCompensation: {
              0: 44,
              768: 52,
            },
            overlays: [
              sliderArrowSkeleton("prev"),
              sliderArrowSkeleton("next"),
              {
                kind: "stack",
                style: {
                  position: "absolute",
                  left: "50%",
                  bottom: 0,
                  transform: "translateX(-50%)",
                  width: "min(60%, 28rem)",
                  height: 16,
                  zIndex: 3,
                },
                children: [
                  {
                    kind: "row",
                    style: {
                      position: "absolute",
                      left: 0,
                      top: 5,
                      width: "100%",
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: "rgba(15, 23, 42, 0.16)",
                    },
                    children: [],
                  },
                  {
                    kind: "row",
                    style: {
                      position: "absolute",
                      left: 0,
                      top: 5,
                      width: 0,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: "rgba(80, 163, 255, 0.28)",
                    },
                    children: [],
                  },
                  {
                    kind: "row",
                    style: {
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      backgroundColor: "rgb(80, 163, 255)",
                      boxShadow: "0 4px 14px rgba(80, 163, 255, 0.28)",
                    },
                    children: [],
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
          layout={{
            gap: 20,
            cellsPerSlide: CELLS_PER_SLIDE,
          }}
          scroll={{
            freeScroll: true,
            groupCells: true,
            loop: true,
          }}
          reveal={{
            staggerMs: 60,
          }}
          elements={{
            viewport: {
              className: styles.sliderViewport,
            },
          }}
          virtualization={VIRTUALIZATION}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows({
              arrow: {
                style: {
                  top: "43%",
                },
              },
            }),
            sliderLazyLoad({
              enabled: true,
              spinner: true,
              spinnerClassName: styles.spinner,
            }),
            sliderCrossfade({
              controls: true,
              easing: "cubic-bezier(.22,1,.36,1)",
            }),
            sliderScrollbar({
              enabled: true,
              root: {
                className: styles.scrollbar,
                style: {
                  bottom: "0px",
                },
              },
            }),
          ]}
        >
          {MEDIA.map((item, i) => (
            <Slide
              key={"img-" + (item.kind === "image" ? item.src : "") + "-" + i}
              src={item.kind === "image" ? item.src : ""}
              i={i}
            />
          ))}
        </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
