/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useSearchParams } from "next/navigation";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import type { SkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-cards-demo.module.css";
import {
  cardOnePrice,
  cardOneTitle,
  cardThreePrice,
  cardThreeTitle,
  cardTwoPrice,
  cardTwoTitle,
  sliderCardsRowHeightCompensation,
} from "./slider-cards.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

const PRODUCTS = [
  {
    id: "cardOne",
    imageSrc: "https://picsum.photos/id/448/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/448/2400/3000",
    title: "Nostrud exercitation ullamco laboris nisi ut consequat",
    price: "$148",
  },
  {
    id: "cardTwo",
    imageSrc: "https://picsum.photos/id/450/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/450/2400/3000",
    title: "Ipsum dolor sit amet consectetur adipiscing elit",
    price: "$96",
  },
  {
    id: "cardThree",
    imageSrc: "https://picsum.photos/id/456/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/456/2400/3000",
    title: "Amet consectetur adipiscing elit sed do esse occaecat",
    price: "$72",
  },
  {
    id: "cardFour",
    imageSrc: "https://picsum.photos/id/458/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/458/2400/3000",
    title: "Elit sed do eiusmod tempor incididunt ut labore",
    price: "$38",
  },
  {
    id: "cardFive",
    imageSrc: "https://picsum.photos/id/459/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/459/2400/3000",
    title: "Sed do eiusmod tempor incididunt ut labore et dolore",
    price: "$84",
  },
  {
    id: "cardSix",
    imageSrc: "https://picsum.photos/id/461/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/461/2400/3000",
    title: "Ut labore et dolore magna aliqua enim ad minim",
    price: "$128",
  },
  {
    id: "cardSeven",
    imageSrc: "https://picsum.photos/id/466/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/466/2400/3000",
    title: "Dolore magna aliqua enim ad minim veniam quis",
    price: "$184",
  },
  {
    id: "cardEight",
    imageSrc: "https://picsum.photos/id/468/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/468/2400/3000",
    title: "Voluptate velit esse cillum dolore eu fugiat non numquam",
    price: "$112",
  },
  {
    id: "cardNine",
    imageSrc: "https://picsum.photos/id/471/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/471/2400/3000",
    title: "In reprehenderit in voluptate velit esse cillum",
    price: "$32",
  },
  {
    id: "cardTen",
    imageSrc: "https://picsum.photos/id/472/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/472/2400/3000",
    title: "Aute irure dolor in reprehenderit in voluptate velit",
    price: "$68",
  },
  {
    id: "cardEleven",
    imageSrc: "https://picsum.photos/id/476/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/476/2400/3000",
    title: "Fugiat nulla pariatur excepteur sint occaecat ea commodi",
    price: "$74",
  },
  {
    id: "cardTwelve",
    imageSrc: "https://picsum.photos/id/477/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/477/2400/3000",
    title: "Cillum dolore eu fugiat nulla pariatur excepteur anim id",
    price: "$28",
  },
];

const CELLS_PER_SLIDE = {
  xs: 1,
  500: 2,
  md: 2,
  lg: 3,
};

type SliderCardsSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
};

type SliderCardsSkeletonTextEntry = {
  title: SliderCardsSkeletonTextState;
  price: SliderCardsSkeletonTextState;
};

type SliderCardTextIds = {
  title: string;
  price: string;
};

const SLIDER_CARDS_SKELETON_TEXT: SliderCardsSkeletonTextEntry[] = [
  {
    title: cardOneTitle,
    price: cardOnePrice,
  },
  {
    title: cardTwoTitle,
    price: cardTwoPrice,
  },
  {
    title: cardThreeTitle,
    price: cardThreePrice,
  },
];

const SLIDER_CARDS_TEXT_IDS: SliderCardTextIds[] = [
  {
    title: "cardOneTitle",
    price: "cardOnePrice",
  },
  {
    title: "cardTwoTitle",
    price: "cardTwoPrice",
  },
  {
    title: "cardThreeTitle",
    price: "cardThreePrice",
  },
];

function createProductSkeletonItem(index: number): SkeletonNode {
  const skeletonText =
    SLIDER_CARDS_SKELETON_TEXT[index] ?? SLIDER_CARDS_SKELETON_TEXT[0]!;

  return {
    kind: "col" as const,
    style: {
      padding: "16px",
      gap: 12,
      justify: "space-between",
    },
    children: [
      {
        kind: "col" as const,
        style: {
          gap: 12,
        },
        children: [
          {
            kind: "rect" as const,
            style: {
              width: "100%",
              aspectRatio: "4 / 5",
              borderRadius: 12,
            },
          },
          {
            kind: "text" as const,
            barHeight: 13,
            lineHeight: 1.6,
            ...skeletonText.title,
          },
        ],
      },
      {
        kind: "text" as const,
        barHeight: 13,
        lineHeight: 1.4,
        style: {
          marginTop: "3px",
        },
        ...skeletonText.price,
      },
    ],
  };
}

const SLIDER_CARDS_SKELETON_SLOTS: SliderSkeletonSlot[] =
  SLIDER_CARDS_SKELETON_TEXT.map((_, index) => ({
    item: createProductSkeletonItem(index),
  }));

const SLIDER_CARDS_SKELETON: SliderSkeletonSpec = {
  mode: "fit",
  visibleCount: CELLS_PER_SLIDE,
  layout: {
    kind: "slider",
    direction: "row",
    style: {
      gap: 20,
    },
    item: createProductSkeletonItem(0),
    slots: SLIDER_CARDS_SKELETON_SLOTS,
    children: [
      {
        kind: "col",
        style: {
          width: "100%",
          padding: "20px 0 0",
        },
        children: [
          {
            kind: "rect",
            style: {
              0: {
                width: 306,
                height: 32,
                borderRadius: 999,
                alignSelf: "center",
                marginTop: "-3px",
                marginBottom: "3px",
              },
              500: {
                width: 160,
                marginTop: 0,
                marginBottom: 0,
              },
              1200: {
                width: 111,
              },
            },
          },
        ],
      },
    ],
    itemWrapStyle: {
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 3px 6px rgba(15, 23, 42, 0.08)",
      backgroundColor: "#fff",
      // height: "100%",
    },
    rowHeightCompensation: sliderCardsRowHeightCompensation,
  },
};

function ProductCard({
  productId,
  index,
  src,
  title,
  price,
}: {
  productId: string;
  index: number;
  src: string;
  title: string;
  price: string;
}) {
  const textIds = SLIDER_CARDS_TEXT_IDS[index];

  return (
    <article
      className={styles.cardSlide}
      data-skeleton-item-id={productId}
    >
      <div className={styles.cardFirstColumn}>
        <img
          src={src}
          alt={title}
          className={styles.cardSlideImage}
        />
        <div className={styles.cardSlideCopy}>
          <h3
            className={styles.cardSlideTitle}
            data-skeleton-role="title"
            data-skeleton-text-id={textIds?.title}
          >
            {title}
          </h3>
        </div>
      </div>
      <p
        className={styles.cardSlidePrice}
        data-skeleton-role="price"
        data-skeleton-text-id={textIds?.price}
      >
        {price}
      </p>
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

export function SliderCardsDemo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";
  const media = toMediaItems(PRODUCTS.map((product) => product.imageSrc));
  const fullscreenMedia = toMediaItems(PRODUCTS.map((product) => product.fullscreenSrc));

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        cache={demoSkeletonCache("slider-cards")}
        layout={SLIDER_CARDS_SKELETON}
        ready={sliderReady}
        timing={{
          exitMs: 800
        }}
      >
      <Slider
        ref={sliderRef}
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true,
          loop: true
        }}
        elements={{
          viewport: {
            className: styles.slider_viewport
          }
        }}
        transitions={{
          intro: {
            staggerMs: 120
          }
        }}

        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows({
            arrow: {
              style: {
                top: "43%"
              }
            }
          }),
          sliderDots({
            root: {
              className: styles.slider_dots_root
            }
          }),
        ]}
      >
        {media.map((item, i) => {
          const product = PRODUCTS[i];

          return (
            <ProductCard
              key={`product-${item.kind === "image" ? item.src : ""}-${i}`}
              productId={product.id}
              index={i}
              src={item.kind === "image" ? item.src : ""}
              title={product.title}
              price={product.price}
            />
          );
  
            })}
      </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
