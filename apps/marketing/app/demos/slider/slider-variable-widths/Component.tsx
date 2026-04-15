/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-variable-widths-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1013/1200/900",
    fullscreenSrc: "https://picsum.photos/id/1013/2400/1800",
    width: 220,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1014/1020/630",
    fullscreenSrc: "https://picsum.photos/id/1014/2040/1260",
    width: 420,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1015/780/1340",
    fullscreenSrc: "https://picsum.photos/id/1015/1560/2680",
    width: 260,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1016/1280/720",
    fullscreenSrc: "https://picsum.photos/id/1016/2560/1440",
    width: 360,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/101/1200/900",
    fullscreenSrc: "https://picsum.photos/id/101/2400/1800",
    width: 200,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1018/900/570",
    fullscreenSrc: "https://picsum.photos/id/1018/1800/1140",
    width: 300,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/18/900/570",
    fullscreenSrc: "https://picsum.photos/id/18/1800/1140",
    width: 500,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/19/900/570",
    fullscreenSrc: "https://picsum.photos/id/19/1800/1140",
    width: 250,
    height: 320,
  },
];

function Slide(props: { src: string; width: number; height: number; i: number }) {
  const { src, width, height, i } = props;

  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      className={styles.variableWidthSlide}
      style={{ width, height }}
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

export function SliderVariableWidthsDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              centering: "first",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                slots: SLIDES.map((slide) => ({
                  itemWrapStyle: {
                    width: slide.width,
                    height: slide.height,
                  },
                })),
              },
            },
          },
        }}
      >
        {media.map((item, i) => {
          const slide = SLIDES[i];

          return (
            <Slide
              key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
              src={item.kind === "image" ? item.src : ""}
              width={slide.width}
              height={slide.height}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}
