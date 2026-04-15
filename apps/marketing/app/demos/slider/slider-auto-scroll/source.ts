export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
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

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
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
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
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
            style: {
              paddingBottom: "52px"
            }
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
                    kind: "rect",
                    style: {
                      width: "60%",
                      height: 4,
                      borderRadius: 999,
                      alignSelf: "center",
                      marginTop: 48,
                    },
                  },
                ],
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
