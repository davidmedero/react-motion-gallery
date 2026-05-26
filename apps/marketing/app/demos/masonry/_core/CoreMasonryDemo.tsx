/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import {
  Masonry,
  type MasonryPlacement,
  type ResponsiveMasonrySpan,
} from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { masonryLazyLoad } from "react-motion-gallery/masonry/lazy-load";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/masonry";
import styles from "./CoreMasonryDemo.module.css";

export type CoreMasonryVariant =
  | "balanced"
  | "spans"
  | "horizontalOrder"
  | "roundRobin"
  | "lazyLoad";

type CoreImage = {
  src: string;
  fullscreenSrc: string;
  width: number;
  height: number;
  alt: string;
};

type CoreImageWithSpan = CoreImage & {
  span?: ResponsiveMasonrySpan;
};

type CoreMasonryConfig = {
  items: CoreImageWithSpan[];
  columns: Record<number, number>;
  gap: Record<number, number>;
  placement: MasonryPlacement;
};

const MASONRY_FULLSCREEN_PLUGINS = [masonryFullscreen()];
const MASONRY_LAZY_LOAD_PLUGINS = [
  masonryFullscreen(),
  masonryLazyLoad({ spinner: true }),
];
const FULLSCREEN_PLUGINS = [fullscreenSlider(), fullscreenZoomPan()];

const HTML5_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg";
const UHD_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg";
const WAVES_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/7677513-hd_1920_1080_25fps-0.jpg";
const ROUND_ROBIN_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg";

function dimensionsFromRatio(ratio: string, width = 1200) {
  const [ratioWidth, ratioHeight] = ratio
    .split("/")
    .map((part) => Number(part.trim()));

  if (
    !Number.isFinite(ratioWidth) ||
    !Number.isFinite(ratioHeight) ||
    ratioWidth <= 0 ||
    ratioHeight <= 0
  ) {
    return { width, height: width };
  }

  return {
    width,
    height: Math.round((width * ratioHeight) / ratioWidth),
  };
}

function imageItem(args: {
  src: string;
  fullscreenSrc?: string;
  ratio: string;
  alt: string;
  span?: ResponsiveMasonrySpan;
  width?: number;
}): CoreImageWithSpan {
  return {
    src: args.src,
    fullscreenSrc: args.fullscreenSrc ?? args.src,
    ...dimensionsFromRatio(args.ratio, args.width),
    alt: args.alt,
    span: args.span,
  };
}

const WIDE_SPAN = { 0: 1, 760: 2, 1160: 2 };
const DESKTOP_SPAN = { 0: 1, 1160: 2 };
const WIDE_ORDER_SPAN = { 0: 1, 720: 2, 1140: 2 };

const CORE_MASONRY_CONFIGS: Record<CoreMasonryVariant, CoreMasonryConfig> = {
  balanced: {
    columns: { 0: 1, 720: 2, 1140: 3 },
    gap: { 0: 12, 1140: 18 },
    placement: "balanced",
    items: [
      imageItem({
        src: "https://picsum.photos/id/546/1200/1500",
        fullscreenSrc: "https://picsum.photos/id/546/2400/3000",
        ratio: "5 / 4",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: HTML5_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://picsum.photos/id/547/1200/1440",
        fullscreenSrc: "https://picsum.photos/id/547/2400/2880",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://picsum.photos/id/549/1200/1800",
        fullscreenSrc: "https://picsum.photos/id/549/2400/3600",
        ratio: "3 / 5",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: UHD_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://picsum.photos/id/557/1200/1560",
        fullscreenSrc: "https://picsum.photos/id/557/2400/3120",
        ratio: "5 / 4",
        alt: "Nemo enim ipsam voluptatem",
      }),
    ],
  },
  spans: {
    columns: { 0: 1, 760: 2, 1160: 4 },
    gap: { 0: 12, 1160: 18 },
    placement: "balanced",
    items: [
      imageItem({
        src: "https://picsum.photos/id/558/1600/1100",
        fullscreenSrc: "https://picsum.photos/id/558/3200/2200",
        ratio: "16 / 11",
        width: 1600,
        alt: "Lorem ipsum dolor sit amet",
        span: WIDE_SPAN,
      }),
      imageItem({
        src: HTML5_LOOP_POSTER,
        ratio: "3 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://picsum.photos/id/560/1200/1500",
        fullscreenSrc: "https://picsum.photos/id/560/2400/3000",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://picsum.photos/id/563/1600/1200",
        fullscreenSrc: "https://picsum.photos/id/563/3200/2400",
        ratio: "4 / 3",
        width: 1600,
        alt: "Excepteur sint occaecat",
        span: DESKTOP_SPAN,
      }),
      imageItem({
        src: UHD_LOOP_POSTER,
        ratio: "16 / 12",
        width: 1600,
        alt: "Sed ut perspiciatis unde",
        span: WIDE_SPAN,
      }),
      imageItem({
        src: "https://picsum.photos/id/564/1200/1200",
        fullscreenSrc: "https://picsum.photos/id/564/2400/2400",
        ratio: "1 / 1",
        alt: "Nemo enim ipsam voluptatem",
      }),
      imageItem({
        src: "https://picsum.photos/id/566/1200/1800",
        fullscreenSrc: "https://picsum.photos/id/566/2400/3600",
        ratio: "2 / 3",
        alt: "Neque porro quisquam est",
      }),
      imageItem({
        src: "https://picsum.photos/id/568/1600/1100",
        fullscreenSrc: "https://picsum.photos/id/568/3200/2200",
        ratio: "16 / 11",
        width: 1600,
        alt: "Temporibus autem quibusdam",
        span: DESKTOP_SPAN,
      }),
    ],
  },
  horizontalOrder: {
    columns: { 0: 1, 720: 2, 1140: 4 },
    gap: { 0: 12, 1140: 18 },
    placement: "horizontalOrder",
    items: [
      imageItem({
        src: "https://picsum.photos/id/569/1600/2000",
        fullscreenSrc: "https://picsum.photos/id/569/3200/4000",
        ratio: "4 / 5",
        width: 1600,
        alt: "Lorem ipsum dolor sit amet",
        span: WIDE_ORDER_SPAN,
      }),
      imageItem({
        src: HTML5_LOOP_POSTER,
        ratio: "5 / 4",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://picsum.photos/id/573/1200/1200",
        fullscreenSrc: "https://picsum.photos/id/573/2400/2400",
        ratio: "1 / 1",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://picsum.photos/id/574/1600/1000",
        fullscreenSrc: "https://picsum.photos/id/574/3200/2000",
        ratio: "16 / 10",
        width: 1600,
        alt: "Excepteur sint occaecat",
        span: WIDE_ORDER_SPAN,
      }),
      imageItem({
        src: WAVES_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://picsum.photos/id/575/1200/1800",
        fullscreenSrc: "https://picsum.photos/id/575/2400/3600",
        ratio: "3 / 5",
        alt: "Nemo enim ipsam voluptatem",
      }),
    ],
  },
  roundRobin: {
    columns: { 0: 1, 720: 2, 1140: 3 },
    gap: { 0: 12, 1140: 18 },
    placement: "roundRobin",
    items: [
      imageItem({
        src: "https://picsum.photos/id/583/1200/1440",
        fullscreenSrc: "https://picsum.photos/id/583/2400/2880",
        ratio: "5 / 4",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: ROUND_ROBIN_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://picsum.photos/id/588/1200/1620",
        fullscreenSrc: "https://picsum.photos/id/588/2400/3240",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://picsum.photos/id/591/1200/1320",
        fullscreenSrc: "https://picsum.photos/id/591/2400/2640",
        ratio: "5 / 4",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: WAVES_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://picsum.photos/id/599/1200/1500",
        fullscreenSrc: "https://picsum.photos/id/599/2400/3000",
        ratio: "3 / 5",
        alt: "Nemo enim ipsam voluptatem",
      }),
    ],
  },
  lazyLoad: {
    columns: { 0: 1, 720: 2, 1140: 3 },
    gap: { 0: 12, 1140: 18 },
    placement: "balanced",
    items: [
      imageItem({
        src: "https://picsum.photos/id/603/1200/1680",
        fullscreenSrc: "https://picsum.photos/id/603/2400/3360",
        ratio: "3 / 5",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: "https://picsum.photos/id/621/1200/1500",
        fullscreenSrc: "https://picsum.photos/id/621/2400/3000",
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://picsum.photos/id/626/1200/1920",
        fullscreenSrc: "https://picsum.photos/id/626/2400/3840",
        ratio: "5 / 4",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://picsum.photos/id/629/1200/1500",
        fullscreenSrc: "https://picsum.photos/id/629/2400/3000",
        ratio: "3 / 5",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: "https://picsum.photos/id/630/1200/1600",
        fullscreenSrc: "https://picsum.photos/id/630/2400/3200",
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://picsum.photos/id/638/1200/1380",
        fullscreenSrc: "https://picsum.photos/id/638/2400/2760",
        ratio: "5 / 4",
        alt: "Nemo enim ipsam voluptatem",
      }),
    ],
  },
};

function CoreMasonryFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: { enabled: true },
    plugins: FULLSCREEN_PLUGINS,
  });

  return <>{fullscreenNode}</>;
}

export function CoreMasonryDemo({ variant }: { variant: CoreMasonryVariant }) {
  const config = CORE_MASONRY_CONFIGS[variant];
  const items = config.items;
  const fullscreenMedia = React.useMemo(
    () =>
      toMediaItems(
        items.map((image) => ({
          src: image.fullscreenSrc,
          alt: image.alt,
          width: image.width * 2,
          height: image.height * 2,
        }))
      ),
    [items]
  );
  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();
  const lazy = variant === "lazyLoad";

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <MasonrySkeleton
        columns={config.columns}
        gap={config.gap}
        placement={config.placement}
        items={items.map((image) => ({
          width: image.width,
          height: image.height,
          span: image.span,
        }))}
        ready={masonryReady}
        radius={18}
        timing={{ minVisibleMs: 500, exitMs: 1200 }}
      >
        <Masonry
          ref={masonryRef}
          columns={config.columns}
          gap={config.gap}
          placement={config.placement}
          plugins={lazy ? MASONRY_LAZY_LOAD_PLUGINS : MASONRY_FULLSCREEN_PLUGINS}
        >
          {items.map((image, index) => (
            <Masonry.Item
              key={image.src}
              width={image.width}
              height={image.height}
              span={image.span}
              className={styles.frame}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={styles.image}
                loading={lazy || index > 2 ? "lazy" : "eager"}
                decoding="async"
              />
            </Masonry.Item>
          ))}
        </Masonry>
      </MasonrySkeleton>
      <CoreMasonryFullscreenAddon />
    </GalleryCore>
  );
}
