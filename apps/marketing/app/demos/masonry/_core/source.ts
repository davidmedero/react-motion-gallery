type SourceImageItem = {
  src: string;
  fullscreenSrc?: string;
  ratio: string;
  alt: string;
  span?: Record<number, number | "full">;
  width?: number;
};

const HTML5_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg";
const UHD_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg";
const WAVES_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/7677513-hd_1920_1080_25fps-0.jpg";
const ROUND_ROBIN_LOOP_POSTER =
  "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg";

const WIDE_SPAN = { 0: 1, 760: 2, 1160: 2 };
const DESKTOP_SPAN = { 0: 1, 1160: 2 };
const WIDE_ORDER_SPAN = { 0: 1, 720: 2, 1140: 2 };

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

function formatSpan(span: SourceImageItem["span"]) {
  if (!span) return "";
  const body = Object.entries(span)
    .map(([breakpoint, value]) => `${breakpoint}: ${JSON.stringify(value)}`)
    .join(", ");

  return `\n    span: { ${body} },`;
}

function formatImageEntry(image: SourceImageItem) {
  const dimensions = dimensionsFromRatio(image.ratio, image.width);

  return `  {
    src: ${JSON.stringify(image.src)},
    fullscreenSrc: ${JSON.stringify(image.fullscreenSrc ?? image.src)},
    width: ${dimensions.width},
    height: ${dimensions.height},
    alt: ${JSON.stringify(image.alt)},${formatSpan(image.span)}
  }`;
}

function getSourceImages(variant: string): SourceImageItem[] {
  if (variant === "spans") {
    return [
      {
        src: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1600&h=1100&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=3200&h=2200&q=80",
        ratio: "16 / 11",
        width: 1600,
        alt: "Lorem ipsum dolor sit amet",
        span: WIDE_SPAN,
      },
      {
        src: HTML5_LOOP_POSTER,
        ratio: "3 / 5",
        alt: "Ut enim ad minim veniam",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&h=1200&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=3200&h=2400&q=80",
        ratio: "4 / 3",
        width: 1600,
        alt: "Excepteur sint occaecat",
        span: DESKTOP_SPAN,
      },
    ];
  }

  if (variant === "horizontalOrder") {
    return [
      {
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&h=2000&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=3200&h=4000&q=80",
        ratio: "4 / 5",
        width: 1600,
        alt: "Lorem ipsum dolor sit amet",
        span: WIDE_ORDER_SPAN,
      },
      {
        src: HTML5_LOOP_POSTER,
        ratio: "5 / 4",
        alt: "Ut enim ad minim veniam",
      },
      {
        src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1600&h=1000&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=3200&h=2000&q=80",
        ratio: "16 / 10",
        width: 1600,
        alt: "Excepteur sint occaecat",
        span: WIDE_ORDER_SPAN,
      },
    ];
  }

  if (variant === "roundRobin") {
    return [
      {
        src: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=1440&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=2400&h=2880&q=80",
        ratio: "5 / 4",
        alt: "Lorem ipsum dolor sit amet",
      },
      {
        src: ROUND_ROBIN_LOOP_POSTER,
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      },
      {
        src: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1200&h=1620&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=2400&h=3240&q=80",
        ratio: "3 / 5",
        alt: "Duis aute irure dolor",
      },
    ];
  }

  if (variant === "lazyLoad") {
    return [
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=1680&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&h=3360&q=80",
        ratio: "3 / 5",
        alt: "Lorem ipsum dolor sit amet",
      },
      {
        src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&h=1500&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&h=3000&q=80",
        ratio: "4 / 5",
        alt: "Ut enim ad minim veniam",
      },
      {
        src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1920&q=80",
        fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=3840&q=80",
        ratio: "5 / 4",
        alt: "Duis aute irure dolor",
      },
    ];
  }

  return [
    {
      src: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&h=1500&q=80",
      fullscreenSrc: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2400&h=3000&q=80",
      ratio: "5 / 4",
      alt: "Lorem ipsum dolor sit amet",
    },
    {
      src: HTML5_LOOP_POSTER,
      ratio: "4 / 5",
      alt: "Ut enim ad minim veniam",
    },
    {
      src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&h=1440&q=80",
      fullscreenSrc: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=2400&h=2880&q=80",
      ratio: "3 / 5",
      alt: "Duis aute irure dolor",
    },
  ];
}

function getColumns(variant: string) {
  if (variant === "spans") return "{ 0: 1, 760: 2, 1160: 4 }";
  if (variant === "horizontalOrder") return "{ 0: 1, 720: 2, 1140: 4 }";
  return "{ 0: 1, 720: 2, 1140: 3 }";
}

function getGap(variant: string) {
  if (variant === "spans") return "{ 0: 12, 1160: 18 }";
  return "{ 0: 12, 1140: 18 }";
}

export function createCoreMasonrySource(args: {
  componentName: string;
  cssModuleName: string;
  placement: "balanced" | "roundRobin" | "horizontalOrder";
  variant: string;
}) {
  const images = getSourceImages(args.variant);
  const lazy = args.variant === "lazyLoad";

  return `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Masonry, type ResponsiveMasonrySpan } from "react-motion-gallery/masonry";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { masonryLazyLoad } from "react-motion-gallery/masonry/lazy-load";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import styles from "./${args.cssModuleName}";

type ImageItem = {
  src: string;
  fullscreenSrc: string;
  width: number;
  height: number;
  alt: string;
  span?: ResponsiveMasonrySpan;
};

const IMAGES: ImageItem[] = [
${images.map(formatImageEntry).join(",\n")}
];

const fullscreenPlugins = [fullscreenSlider(), fullscreenZoomPan()];
const columns = ${getColumns(args.variant)};
const gap = ${getGap(args.variant)};
const placement = ${JSON.stringify(args.placement)} as const;
const lazy = ${String(lazy)};
const masonryPlugins = lazy
  ? [masonryFullscreen(), masonryLazyLoad({ spinner: true })]
  : [masonryFullscreen()];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: { enabled: true },
    plugins: fullscreenPlugins,
  });

  return <>{fullscreenNode}</>;
}

export function ${args.componentName}() {
  const fullscreenMedia = toMediaItems(
    IMAGES.map((image) => ({
      src: image.fullscreenSrc,
      alt: image.alt,
      width: image.width * 2,
      height: image.height * 2,
    }))
  );

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <Masonry
        columns={columns}
        gap={gap}
        placement={placement}
        plugins={masonryPlugins}
        loading={{
          count: IMAGES.length,
          skeleton: {
            columns,
            gap,
            placement,
            items: IMAGES.map((image) => ({
              width: image.width,
              height: image.height,
              span: image.span,
            })),
            radius: 18,
          },
          timing: { minVisibleMs: 500, exitMs: 1200 },
        }}
      >
        {IMAGES.map((image, index) => (
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
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
}
