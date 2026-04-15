export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-cards-demo.module.css";

const PRODUCTS = [
  {
    imageSrc: "https://picsum.photos/id/1060/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/3000",
    title: "Canvas Weekender",
    price: "$148",
  },
  {
    imageSrc: "https://picsum.photos/id/1061/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/3000",
    title: "Meridian Crossbody",
    price: "$96",
  },
  {
    imageSrc: "https://picsum.photos/id/1062/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/3000",
    title: "Harbor Knit Polo",
    price: "$72",
  },
  {
    imageSrc: "https://picsum.photos/id/1063/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1063/2400/3000",
    title: "Alder Trail Cap",
    price: "$38",
  },
  {
    imageSrc: "https://picsum.photos/id/1064/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1064/2400/3000",
    title: "Solstice Sunglasses",
    price: "$84",
  },
  {
    imageSrc: "https://picsum.photos/id/1065/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1065/2400/3000",
    title: "Studio Carryall",
    price: "$128",
  },
  {
    imageSrc: "https://picsum.photos/id/1066/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1066/2400/3000",
    title: "Alpine Field Jacket",
    price: "$184",
  },
  {
    imageSrc: "https://picsum.photos/id/1067/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1067/2400/3000",
    title: "Drift Sneaker",
    price: "$112",
  },
  {
    imageSrc: "https://picsum.photos/id/1068/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1068/2400/3000",
    title: "Ridge Water Bottle",
    price: "$32",
  },
  {
    imageSrc: "https://picsum.photos/id/1069/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1069/2400/3000",
    title: "Everyday Crewneck",
    price: "$68",
  },
  {
    imageSrc: "https://picsum.photos/id/1070/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1070/2400/3000",
    title: "Coastline Tote",
    price: "$74",
  },
  {
    imageSrc: "https://picsum.photos/id/1071/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1071/2400/3000",
    title: "Ember Travel Mug",
    price: "$28",
  },
];

const CELLS_PER_SLIDE = {
  xs: 1,
  md: 2,
  lg: 3,
};

function ProductCard({
  src,
  title,
  price,
}: {
  src: string;
  title: string;
  price: string;
}) {
  return (
    <article className={styles.cardSlide}>
      <img
        src={src}
        alt={title}
        className={styles.cardSlideImage}
      />
      <div className={styles.cardSlideCopy}>
        <h3 className={styles.cardSlideTitle}>{title}</h3>
        <p className={styles.cardSlidePrice}>{price}</p>
      </div>
    </article>
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

export function SliderCardsDemo() {
  const media = toMediaItems(PRODUCTS.map((product) => product.imageSrc));
  const fullscreenMedia = toMediaItems(PRODUCTS.map((product) => product.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true,
          loop: true
        }}
        transitions={{
          loading: {
            skeletonCount: CELLS_PER_SLIDE,
            skeleton: {
              mode: "fit",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "col",
                  style: {
                    gap: 12,
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "100%",
                        aspectRatio: "4 / 5",
                        borderRadius: 16,
                      },
                    },
                    {
                      kind: "text",
                      fontSize: 16,
                      lineHeight: 1.2,
                      style: {
                        width: "92%",
                      },
                    },
                    {
                      kind: "text",
                      fontSize: 14,
                      lineHeight: 1.1,
                      style: {
                        width: "50%",
                      },
                    },
                  ],
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => {
          const product = PRODUCTS[i];

          return (
            <ProductCard
              key={\`product-\${item.kind === "image" ? item.src : ""}-\${i}\`}
              src={item.kind === "image" ? item.src : ""}
              title={product.title}
              price={product.price}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
