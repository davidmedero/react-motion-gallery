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
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { masonryLazyLoad } from "react-motion-gallery/masonry/lazy-load";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
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
        src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=3000&q=80",
        ratio: "5 / 4",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: HTML5_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&h=1440&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=2400&h=2880&q=80",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=1800&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&h=3600&q=80",
        ratio: "3 / 5",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: UHD_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&h=1560&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2400&h=3120&q=80",
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
        src: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1600&h=1100&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=3200&h=2200&q=80",
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
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&h=3000&q=80",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&h=1200&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=3200&h=2400&q=80",
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
        src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&h=1200&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=2400&q=80",
        ratio: "1 / 1",
        alt: "Nemo enim ipsam voluptatem",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=1800&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&h=3600&q=80",
        ratio: "2 / 3",
        alt: "Neque porro quisquam est",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1600&h=1100&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=3200&h=2200&q=80",
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
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&h=2000&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=3200&h=4000&q=80",
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
        src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&h=1200&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2400&h=2400&q=80",
        ratio: "1 / 1",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1600&h=1000&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=3200&h=2000&q=80",
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
        src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&h=1800&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&h=3600&q=80",
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
        src: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=1440&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=2400&h=2880&q=80",
        ratio: "5 / 4",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: ROUND_ROBIN_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1200&h=1620&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=2400&h=3240&q=80",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1200&h=1320&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&h=2640&q=80",
        ratio: "5 / 4",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: WAVES_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&h=3000&q=80",
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
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=1680&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&h=3360&q=80",
        ratio: "3 / 5",
        alt: "Lorem ipsum dolor sit amet",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&h=3000&q=80",
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1920&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=3840&q=80",
        ratio: "5 / 4",
        alt: "Duis aute irure dolor",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&h=3000&q=80",
        ratio: "3 / 5",
        alt: "Excepteur sint occaecat",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&h=1600&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&h=3200&q=80",
        ratio: "4 / 5",
        alt: "Sed ut perspiciatis unde",
      }),
      imageItem({
        src: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&h=1380&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=2400&h=2760&q=80",
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
  const lazy = variant === "lazyLoad";

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <Masonry
        columns={config.columns}
        gap={config.gap}
        placement={config.placement}
        plugins={lazy ? MASONRY_LAZY_LOAD_PLUGINS : MASONRY_FULLSCREEN_PLUGINS}
        loading={{
          count: items.length,
          skeleton: {
            columns: config.columns,
            gap: config.gap,
            placement: config.placement,
            items: items.map((image) => ({
              width: image.width,
              height: image.height,
              span: image.span,
            })),
            radius: 18,
          },
          timing: { minVisibleMs: 500, exitMs: 1200 },
        }}
      >
        {items.map((image, index) => (
          <Masonry.Item
            key={image.src}
            revealKey={image.src}
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
      <CoreMasonryFullscreenAddon />
    </GalleryCore>
  );
}
