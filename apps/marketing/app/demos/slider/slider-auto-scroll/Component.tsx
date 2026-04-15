/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-auto-scroll-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1055/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1056/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1057/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1058/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1059/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1060/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1061/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1062/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
  },
];

const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
const FULLSCREEN_MEDIA = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

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
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderAutoScrollDemo() {
  return (
    <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_MEDIA}>
      <Slider
        align="center"
        scroll={{
          loop: true,
        }}
        auto={{
          scroll: {
            enabled: true,
          },
        }}
        controls={{
          dots: {
            enabled: false,
          },
          progress: {
            enabled: true,
            root: {
              style: {
                bottom: "0px",
              },
            },
          },
        }}
        elements={{
          viewport: {
            className: styles.slider_viewport
          }
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
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
                  maxWidth: "320px",
                  aspectRatio: "4 / 5",
                },
                children: [
                  {
                    kind: "col",
                    style: {
                      0: {
                        width: "100%",
                        padding: "18px 0 0 0"
                      },
                      768: {
                        width: "100%",
                        padding: "22px 0 0 0"
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
            },
          },
        }}
      >
        {MEDIA.map((item, i) => (
          <Slide
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}
