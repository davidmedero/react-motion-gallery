/* eslint-disable @next/next/no-img-element */
'use client';

import type { CSSProperties } from "react";
import {
  useSearchParams } from "next/navigation";
import {
  GalleryCore,
  Slider,
  useSliderReady,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import type { SkeletonNode, SliderSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { sliderAutoHeight } from "../../../../../../packages/react-motion-gallery/src/slider-auto-height";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-auto-height-demo.module.css";
import {
  autoHeightOneCopy,
  autoHeightOneFooter,
  autoHeightOneKicker,
  autoHeightOneTitle,
  autoHeightThreeCopy,
  autoHeightThreeFooter,
  autoHeightThreeKicker,
  autoHeightThreeTitle,
  autoHeightFourCopy,
  autoHeightFourFooter,
  autoHeightFourKicker,
  autoHeightFourTitle,
  autoHeightFiveCopy,
  autoHeightFiveFooter,
  autoHeightFiveKicker,
  autoHeightFiveTitle,
  autoHeightTwoCopy,
  autoHeightTwoFooter,
  autoHeightTwoKicker,
  autoHeightTwoTitle,
} from "./slider-auto-height.skeleton-text.generated";

const AUTO_HEIGHT_VIEWPORT_BOTTOM_PADDING = 58;
const AUTO_HEIGHT_MOBILE_VIEWPORT_BOTTOM_PADDING_EXTRA = 4;
const AUTO_HEIGHT_DESKTOP_MIN_WIDTH = 641;
const AUTO_HEIGHT_MOBILE_MEDIA_OFFSET = 28;
const AUTO_HEIGHT_FOOTER_VERTICAL_PADDING = 7;
const AUTO_HEIGHT_FOOTER_HORIZONTAL_PADDING = 10;
const AUTO_HEIGHT_FOOTER_LINE_HEIGHT = 16;
const AUTO_HEIGHT_FOOTER_PILL_HEIGHT =
  AUTO_HEIGHT_FOOTER_LINE_HEIGHT + AUTO_HEIGHT_FOOTER_VERTICAL_PADDING * 2;

const SLIDES = [
  {
    id: "autoHeightOne",
    title: "Lorem ipsum dolor",
    kicker: "Lorem ipsum",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    footer: "Lorem ipsum",
    mediaHeight: 198,
    accent: "#3b82f6",
    src: "https://picsum.photos/id/982/1200/900",
    fullscreenSrc: "https://picsum.photos/id/982/2400/1800",
  },
  {
    id: "autoHeightTwo",
    title: "Dolor sit amet consectetur",
    kicker: "Dolor sit",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    footer: "Dolor sit",
    mediaHeight: 238,
    accent: "#f97316",
    src: "https://picsum.photos/id/986/1200/900",
    fullscreenSrc: "https://picsum.photos/id/986/2400/1800",
  },
  {
    id: "autoHeightThree",
    title: "Consectetur adipiscing elit",
    kicker: "Amet elit",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero.",
    footer: "Amet elit",
    mediaHeight: 216,
    accent: "#14b8a6",
    src: "https://picsum.photos/id/987/1200/900",
    fullscreenSrc: "https://picsum.photos/id/987/2400/1800",
  },
  {
    id: "autoHeightFour",
    title: "Sed do eiusmod tempor",
    kicker: "Eiusmod",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.",
    footer: "Eiusmod",
    mediaHeight: 264,
    accent: "#a855f7",
    src: "https://picsum.photos/id/988/1200/900",
    fullscreenSrc: "https://picsum.photos/id/988/2400/1800",
  },
  {
    id: "autoHeightFive",
    title: "Ut labore et dolore",
    kicker: "Labore",
    copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    footer: "Labore",
    mediaHeight: 206,
    accent: "#22c55e",
    src: "https://picsum.photos/id/990/1200/900",
    fullscreenSrc: "https://picsum.photos/id/990/2400/1800",
  },
];

type AutoHeightSlide = (typeof SLIDES)[number];

type AutoHeightSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
};

type AutoHeightSkeletonTextEntry = {
  kicker: AutoHeightSkeletonTextState;
  title: AutoHeightSkeletonTextState;
  copy: AutoHeightSkeletonTextState;
  footer: AutoHeightSkeletonTextState;
};

const AUTO_HEIGHT_TEXT_IDS = SLIDES.map((slide) => ({
  kicker: `${slide.id}Kicker`,
  title: `${slide.id}Title`,
  copy: `${slide.id}Copy`,
  footer: `${slide.id}Footer`,
}));

const AUTO_HEIGHT_SKELETON_TEXT: Record<string, AutoHeightSkeletonTextEntry> = {
  autoHeightOne: {
    kicker: autoHeightOneKicker,
    title: autoHeightOneTitle,
    copy: autoHeightOneCopy,
    footer: autoHeightOneFooter,
  },
  autoHeightTwo: {
    kicker: autoHeightTwoKicker,
    title: autoHeightTwoTitle,
    copy: autoHeightTwoCopy,
    footer: autoHeightTwoFooter,
  },
  autoHeightThree: {
    kicker: autoHeightThreeKicker,
    title: autoHeightThreeTitle,
    copy: autoHeightThreeCopy,
    footer: autoHeightThreeFooter,
  },
  autoHeightFour: {
    kicker: autoHeightFourKicker,
    title: autoHeightFourTitle,
    copy: autoHeightFourCopy,
    footer: autoHeightFourFooter,
  },
  autoHeightFive: {
    kicker: autoHeightFiveKicker,
    title: autoHeightFiveTitle,
    copy: autoHeightFiveCopy,
    footer: autoHeightFiveFooter,
  },
};

function getFooterPillWidth(
  barWidth: AutoHeightSkeletonTextState["barWidth"]
): string {
  const width = Array.isArray(barWidth)
    ? barWidth[0]
    : typeof barWidth === "string"
      ? barWidth
      : undefined;

  return width
    ? `calc(${width} + ${AUTO_HEIGHT_FOOTER_HORIZONTAL_PADDING * 2}px)`
    : "96px";
}

const AUTO_HEIGHT_ITEM_WRAP_STYLE = {
  width: "100cqw",
  maxWidth: "560px",
  marginBottom: AUTO_HEIGHT_VIEWPORT_BOTTOM_PADDING,
  borderRadius: 12,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  boxShadow: "0 6px 12px rgba(15, 23, 42, 0.14)",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

function createAutoHeightSkeletonItem(index: number): SkeletonNode {
  const slide = SLIDES[index] ?? SLIDES[0]!;
  const baseSkeletonText =
    AUTO_HEIGHT_SKELETON_TEXT[slide.id] ?? AUTO_HEIGHT_SKELETON_TEXT.autoHeightOne;
  const skeletonText = baseSkeletonText;

  return {
    kind: "col" as const,
    style: {
      width: "100%",
      gap: 0,
      overflow: "hidden",
    },
    children: [
      {
        kind: "rect" as const,
        style: {
          0: {
            width: "100%",
            height: slide.mediaHeight - AUTO_HEIGHT_MOBILE_MEDIA_OFFSET,
            borderRadius: '12px 12px 0 0'
          },
          [AUTO_HEIGHT_DESKTOP_MIN_WIDTH]: {
            width: "100%",
            height: slide.mediaHeight,
          },
        },
      },
      {
        kind: "col" as const,
        style: {
          0: {
            padding: "16px",
            gap: 13,
          },
          [AUTO_HEIGHT_DESKTOP_MIN_WIDTH]: {
            padding: "20px",
            gap: 15,
          },
        },
        children: [
          {
            kind: "col" as const,
            style: {
              0: {
                gap: 8,
              },
              [AUTO_HEIGHT_DESKTOP_MIN_WIDTH]: {
                gap: 9,
              },
            },
            children: [
              {
                kind: "text" as const,
                barHeight: 12,
                lineHeight: 1.2,
                ...skeletonText.kicker,
              },
              {
                kind: "text" as const,
                barHeight: 32,
                lineHeight: 1.1,
                ...skeletonText.title,
              },
            ],
          },
          {
            kind: "text" as const,
            barHeight: 16,
            lineHeight: 1.45,
            ...skeletonText.copy,
          },
          {
            kind: "rect" as const,
            style: {
              width: getFooterPillWidth(skeletonText.footer.barWidth),
              maxWidth: "100%",
              height: AUTO_HEIGHT_FOOTER_PILL_HEIGHT,
              borderRadius: 999,
              backgroundColor: "rgba(226, 232, 240, 0.72)",
            },
          },
        ],
      },
    ],
  };
}

const AUTO_HEIGHT_DOTS_SKELETON: SkeletonNode = {
  kind: "sliderDots",
  count: SLIDES.length,
  style: {
    position: "absolute",
    left: "50%",
    bottom: 10,
    zIndex: 3,
    width: "max-content",
    padding: "4px 8px",
    borderRadius: 9999,
    backgroundColor: "rgba(148, 163, 184, 0.48)",
    transform: "translateX(-50%)",
  },
  dotStyle: {
    width: 14,
    height: 14,
    margin: 5,
    borderRadius: 999,
  },
  activeStyle: {
    backgroundColor: "rgba(147, 197, 253, 0.95)",
  },
  inactiveStyle: {
    backgroundColor: "rgba(226, 232, 240, 0.9)",
  },
  shimmer: {
    enabled: false,
  },
};

const AUTO_HEIGHT_SKELETON: SliderSkeletonSpec = {
  mode: "peek",
  layout: {
    kind: "slider",
    direction: "row",
    itemStretch: false,
    initialHeightSlot: 1,
    style: {
      gap: 20,
      justify: "center",
    },
    item: createAutoHeightSkeletonItem(0),
    itemWrapStyle: AUTO_HEIGHT_ITEM_WRAP_STYLE,
    slots: SLIDES.map((_, index) => ({
      item: createAutoHeightSkeletonItem(
        (index - 1 + SLIDES.length) % SLIDES.length
      ),
    })),
    rowHeightCompensation: {
      0: AUTO_HEIGHT_MOBILE_VIEWPORT_BOTTOM_PADDING_EXTRA,
      [AUTO_HEIGHT_DESKTOP_MIN_WIDTH]: 0,
    },
    overlays: [AUTO_HEIGHT_DOTS_SKELETON],
  },
};

function Slide({ slide, i }: { slide: AutoHeightSlide; i: number }) {
  const textIds = AUTO_HEIGHT_TEXT_IDS[i];

  return (
    <article
      className={styles.cell}
      data-skeleton-item-id={slide.id}
      style={
        {
          "--media-height": `${slide.mediaHeight}px`,
          "--accent": slide.accent,
        } as CSSProperties & Record<string, string>
      }
    >
      <div className={styles.media}>
        <img src={slide.src} alt={slide.title} />
      </div>
      <div className={styles.body}>
        <div className={styles.headingGroup}>
          <span
            className={styles.kicker}
            data-skeleton-role="kicker"
            data-skeleton-text-id={textIds?.kicker}
          >
            {slide.kicker}
          </span>
          <h3
            className={styles.title}
            data-skeleton-role="title"
            data-skeleton-text-id={textIds?.title}
          >
            {slide.title}
          </h3>
        </div>
        <p
          className={styles.copy}
          data-skeleton-role="copy"
          data-skeleton-text-id={textIds?.copy}
        >
          {slide.copy}
        </p>
        <span
          className={styles.footer}
          data-skeleton-role="footer"
          data-skeleton-text-id={textIds?.footer}
        >
          {slide.footer}
        </span>
      </div>
    </article>
  );
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

export function SliderAutoHeightDemo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";
  const compareSkeleton = searchParams.get("skeletonCompare") === "true";
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  const { ref: sliderRef, ready: sliderReady, handleRef: sliderHandleRef } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={AUTO_HEIGHT_SKELETON}
        ready={sliderReady}
        enabled={!showMeasuredContent}
        force={{
          enabled: compareSkeleton,
          showContent: compareSkeleton,
        }}
        restore={{
          kind: "slider",
          enabled: true,
          key: "slider-auto-height",
          slider: { handleRef: sliderHandleRef },
          itemCount: SLIDES.length,
          visibleCount: 3,
          loop: true,
          activeSlotOffset: 1,
        }}
      >
      <Slider
        ref={sliderRef}
        align="center"
        scroll={{
          loop: true,
        }}

        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows(),
          sliderDots(),
          sliderAutoHeight({
          enabled: true,
          duration: "420ms",
          easing: "cubic-bezier(.22,1,.36,1)",
        }),
        ]}
      >
        {media.map((item, i) => (
          <Slide
            key={`auto-height-${item.kind === "image" ? item.src : ""}-${i}`}
            slide={SLIDES[i]!}
            i={i}
          />
  
            ))}
      </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
