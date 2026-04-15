/* eslint-disable @next/next/no-img-element */
'use client';

import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./fullscreen-thumbnails-demo.module.css";

const SLIDES = [
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
    slideSrc: "https://picsum.photos/id/1046/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1046/2400/1350",
    thumbSrc: "https://picsum.photos/id/1046/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    thumbSrc: "https://picsum.photos/id/1047/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1048/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/1350",
    thumbSrc: "https://picsum.photos/id/1048/320/200",
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

function FullscreenThumbnailsAddon() {
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
          alt: `Thumbnail ${i + 1}`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: "100dvw",
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

export function FullscreenThumbnailsDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.slideSrc));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
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
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenThumbnailsAddon />
    </GalleryCore>
  );
}
