/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from "react";
import {
  Skeleton,
  type SkeletonNode,
} from "../../../../../../packages/react-motion-gallery/src/skeleton-base";
import styles from "./skeleton-flex-cards-demo.module.css";

type ProductCardItem = {
  accent: string;
  cta: string;
  detail: string;
  detailWidth: string;
  imageAlt: string;
  imageRatio: string;
  imageSrc: string;
  kicker: string;
  kickerWidth: number;
  titleNarrow: [string, string];
  titleWide: string;
};

const PRODUCT_CARDS: ProductCardItem[] = [
  {
    accent: "rgba(var(--rmg-logo-cyan-rgb), 0.24)",
    cta: "Ipsum",
    detail: "Dolor sit",
    detailWidth: "52%",
    imageAlt: "Lorem ipsum product detail",
    imageRatio: "4 / 5",
    imageSrc: "https://picsum.photos/id/957/1200/1500",
    kicker: "Lorem",
    kickerWidth: 54,
    titleNarrow: ["Lorem", "ipsum"],
    titleWide: "Lorem ipsum",
  },
  {
    accent: "rgba(var(--rmg-logo-sky-rgb), 0.22)",
    cta: "Dolor",
    detail: "Sit amet",
    detailWidth: "52%",
    imageAlt: "Dolor sit amet product detail",
    imageRatio: "1 / 1",
    imageSrc: "https://picsum.photos/id/960/1200/1200",
    kicker: "Ipsum",
    kickerWidth: 52,
    titleNarrow: ["Dolor sit", "amet"],
    titleWide: "Dolor sit amet",
  },
  {
    accent: "rgba(var(--rmg-logo-magenta-rgb), 0.18)",
    cta: "Amet",
    detail: "Consectetur",
    detailWidth: "52%",
    imageAlt: "Consectetur elit product detail",
    imageRatio: "5 / 4",
    imageSrc: "https://picsum.photos/id/961/1500/1200",
    kicker: "Dolor",
    kickerWidth: 48,
    titleNarrow: ["Consectetur", "elit"],
    titleWide: "Consectetur elit",
  },
  {
    accent: "rgba(var(--rmg-logo-lavender-rgb), 0.22)",
    cta: "Elit",
    detail: "Adipiscing",
    detailWidth: "52%",
    imageAlt: "Adipiscing tempor product detail",
    imageRatio: "4 / 5",
    imageSrc: "https://picsum.photos/id/962/1200/1500",
    kicker: "Amet",
    kickerWidth: 62,
    titleNarrow: ["Adipiscing", "tempor"],
    titleWide: "Adipiscing tempor",
  },
  {
    accent: "rgba(var(--rmg-logo-blue-rgb), 0.2)",
    cta: "Sed",
    detail: "Eiusmod",
    detailWidth: "52%",
    imageAlt: "Sed do eiusmod product detail",
    imageRatio: "1 / 1",
    imageSrc: "https://picsum.photos/id/970/1200/1200",
    kicker: "Elit",
    kickerWidth: 46,
    titleNarrow: ["Sed do", "eiusmod"],
    titleWide: "Sed do eiusmod",
  },
  {
    accent: "rgba(var(--rmg-logo-mauve-rgb), 0.18)",
    cta: "Sit",
    detail: "Tempor",
    detailWidth: "52%",
    imageAlt: "Tempor incididunt product detail",
    imageRatio: "5 / 4",
    imageSrc: "https://picsum.photos/id/973/1500/1200",
    kicker: "Magna",
    kickerWidth: 58,
    titleNarrow: ["Tempor", "incididunt"],
    titleWide: "Tempor incididunt",
  },
  {
    accent: "rgba(var(--rmg-logo-pink-rgb), 0.16)",
    cta: "Nisi",
    detail: "Aliqua",
    detailWidth: "52%",
    imageAlt: "Nisi ut aliquip product detail",
    imageRatio: "1 / 1",
    imageSrc: "https://picsum.photos/id/979/1200/1200",
    kicker: "Nisi",
    kickerWidth: 50,
    titleNarrow: ["Nisi ut", "aliquip"],
    titleWide: "Nisi ut aliquip",
  },
];

function productCard(item: ProductCardItem): SkeletonNode {
  return {
    kind: "col",
    style: {
      flex: "1 1 220px",
      minWidth: 0,
      padding: 14,
      gap: 14,
      justifyContent: "space-between",
      backgroundColor: "#ffffff",
      borderRadius: 18,
      border: "1px solid rgba(15, 23, 42, 0.08)",
      boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
    },
    children: [
      {
        kind: "col",
        style: {
          width: "100%",
          aspectRatio: item.imageRatio,
          borderRadius: 14,
          backgroundColor: item.accent,
          justifyContent: "flex-end",
          padding: 12,
        },
        children: [
          {
            kind: "rect",
            style: {
              width: item.kickerWidth,
              height: 24,
              borderRadius: 999,
              backgroundColor: "rgba(255, 255, 255, 0.66)",
            },
          },
        ],
      },
      {
        kind: "col",
        style: {
          flex: "1 1 auto",
          gap: 9,
          justifyContent: "space-between",
        },
        children: [
          {
            kind: "text",
            barHeight: 15,
            lineHeight: 1.32,
            lines: {
              0: 2,
              280: 1,
            },
            responsiveBy: "container",
            barWidth: {
              0: ["100%", "72%"],
              280: "78%",
            },
            style: {
              width: "100%",
            },
          },
          {
            kind: "row",
            style: {
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              {
                kind: "text",
                barHeight: 13,
                lineHeight: 1.25,
                barWidth: item.detailWidth,
                style: {
                  flex: "1 1 auto",
                },
              },
              {
                kind: "rect",
                style: {
                  width: 58,
                  height: 28,
                  borderRadius: 999,
                  flexShrink: 0,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

const FLEX_CARDS_LAYOUT: SkeletonNode = {
  kind: "row",
  style: {
    flexWrap: "wrap",
    gap: 16,
    alignItems: "stretch",
    alignContent: "stretch",
  },
  children: PRODUCT_CARDS.map(productCard),
};

function decodeImage(image: HTMLImageElement) {
  if (typeof image.decode !== "function") return Promise.resolve();

  return image.decode().catch(() => undefined);
}

function useImageReadiness(count: number) {
  const [settledImages, setSettledImages] = React.useState<boolean[]>(() =>
    Array.from({ length: count }, () => false)
  );

  React.useEffect(() => {
    setSettledImages((current) =>
      current.length === count
        ? current
        : Array.from({ length: count }, () => false)
    );
  }, [count]);

  const markImageSettled = React.useCallback((index: number) => {
    setSettledImages((current) => {
      if (current[index]) return current;

      const next = current.slice();
      next[index] = true;
      return next;
    });
  }, []);

  const markImageDecoded = React.useCallback(
    (index: number, image: HTMLImageElement) => {
      void decodeImage(image).then(() => {
        markImageSettled(index);
      });
    },
    [markImageSettled]
  );

  const registerImage = React.useCallback(
    (index: number) => (node: HTMLImageElement | null) => {
      if (!node) return;
      if (node.complete) markImageDecoded(index, node);
    },
    [markImageDecoded]
  );

  return {
    allImagesSettled:
      settledImages.length === count && settledImages.every(Boolean),
    markImageDecoded,
    markImageSettled,
    registerImage,
  };
}

export function SkeletonFlexCardsDemo() {
  const { allImagesSettled, markImageDecoded, markImageSettled, registerImage } =
    useImageReadiness(PRODUCT_CARDS.length);

  return (
    <div className={styles.shell}>
      <Skeleton
        layout={FLEX_CARDS_LAYOUT}
        ready={allImagesSettled}
        shellClassName={styles.stage}
        className={styles.skeleton}
        backgroundColor="rgba(var(--rmg-logo-blue-rgb), 0.24)"
        radius={12}
        timing={{ exitMs: 520 }}
        shimmer={{
          durationMs: 1350,
          c1: "rgba(255,255,255,0.22)",
          c2: "rgba(255,255,255,0.58)",
          c3: "rgba(255,255,255,0.18)",
        }}
        ariaLabel={allImagesSettled ? undefined : "Loading lorem ipsum cards"}
      >
        <div className={styles.cardGrid}>
          {PRODUCT_CARDS.map((item, index) => (
            <article className={styles.card} key={item.titleWide}>
              <div
                className={styles.productImage}
                style={{
                  aspectRatio: item.imageRatio,
                  backgroundColor: item.accent,
                }}
              >
                <img
                  ref={registerImage(index)}
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  onLoad={(event) => markImageDecoded(index, event.currentTarget)}
                  onError={() => markImageSettled(index)}
                />
                <span style={{ width: item.kickerWidth }}>{item.kicker}</span>
              </div>
              <div className={styles.cardCopy}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.titleLine}>{item.titleNarrow[0]}</span>
                  <span className={styles.titleLine}>{item.titleNarrow[1]}</span>
                  <span className={styles.titleWide}>{item.titleWide}</span>
                </h3>
                <div className={styles.cardMetaRow}>
                  <p
                    className={styles.cardMeta}
                    style={
                      {
                        "--detail-width": item.detailWidth,
                      } as React.CSSProperties
                    }
                  >
                    {item.detail}
                  </p>
                  <button className={styles.cardButton} type="button">
                    {item.cta}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Skeleton>
    </div>
  );
}
