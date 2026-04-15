export const source = String.raw`"use client";

import { useState, useSyncExternalStore } from "react";
import "react-motion-gallery/styles.css";
import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  ThumbnailSlider,
  createSliderIndexChannel,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-thumbnails-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/1037/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1037/2400/1350",
    thumbSrc: "https://picsum.photos/id/1037/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1038/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1038/2400/1350",
    thumbSrc: "https://picsum.photos/id/1038/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1039/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1039/2400/1350",
    thumbSrc: "https://picsum.photos/id/1039/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1040/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1040/2400/1350",
    thumbSrc: "https://picsum.photos/id/1040/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1041/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1041/2400/1350",
    thumbSrc: "https://picsum.photos/id/1041/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1042/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1042/2400/1350",
    thumbSrc: "https://picsum.photos/id/1042/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1043/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1043/2400/1350",
    thumbSrc: "https://picsum.photos/id/1043/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    thumbSrc: "https://picsum.photos/id/1044/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    thumbSrc: "https://picsum.photos/id/1045/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    thumbSrc: "https://picsum.photos/id/1047/320/200",
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

function Thumb({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Thumbnail \${i + 1}\`}
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
    fullscreen: {
      enabled: true,
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: \`Thumbnail \${i + 1}\`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: viewportWidth || undefined,
          padding: "8px 12px",
          overflow: "visible",
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

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        indexChannel={indexChannel}
        controls={{
          dots: {
            enabled: false,
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
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
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>

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
          },
        }}
      >
        {SLIDES.map((slide, i) => (
          <Thumb
            key={\`thumb-\${slide.thumbSrc}\`}
            src={slide.thumbSrc}
            i={i}
          />
        ))}
      </ThumbnailSlider>

      <FullscreenAddon />
    </GalleryCore>
  );
}`;
