/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import Grid from "../../../packages/react-motion-gallery/src/Gallery/grid";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

type Product = {
  id: string;
  title: string;
  price: string;
  image: string;
};

const PRODUCTS: Product[] = Array.from({ length: 12 }).map((_, i) => {
  const n = i + 1;

  // simple fake price pattern
  const dollars = 24 + i * 3;
  const cents = (i * 7) % 100;
  const price = `$${dollars}.${String(cents).padStart(2, "0")}`;

  return {
    id: `p-${n}`,
    title: `Product ${n}`,
    price,
    image: `https://picsum.photos/seed/grid-product-${i}/1600/1600`,
  };
});

const FULLSCREEN_ITEMS = PRODUCTS.map((p) => p.image);

function ProductCard({ product }: { product: Product }) {
  const IMAGE_HEIGHT = 360;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.02)",
        overflow: "visible",
      }}
    >
      <div
        style={{
          width: "100%",
          height: IMAGE_HEIGHT,
          overflow: "hidden",
          borderRadius: 16,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>
          {product.title}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
          {product.price}
        </div>
      </div>
    </div>
  );
}

function FullscreenAddon(props: {
  fullscreenEnabled?: boolean;
  sliderObject: any;
  cellsStateLength: number;
}) {
  const { fullscreenEnabled = true, sliderObject, cellsStateLength } = props;

  const { fullscreenNode } = useFullscreenController({
    fullscreen: { enabled: fullscreenEnabled } as any,
    slider: undefined,
    sliderObject,
    cellsStateLength,
  });

  return <>{fullscreenNode}</>;
}

function Demo() {
  const sliderObject = React.useMemo(
    () => ({
      align: "center",
      direction: { dir: "ltr" },
    }),
    []
  );

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Grid Products ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any product image. Fullscreen should open. Close it, and it should fully reset.
      </p>
      <GalleryCore layout="grid" fullscreenItems={FULLSCREEN_ITEMS}>
        <Grid
          columns={{ 0: 1, 500: 2, 768: 3, 1024: 4, 1280: 5 }}
          gap={12}
          loading={{
            // isLoading: true,
            skeleton: {
              layout: {
                kind: "grid",
                itemWrapStyle: undefined,
                count: 12,
                item: {
                  kind: "stack",
                  style: {
                    width: "100%",
                    padding: 0,
                    gap: 0,
                  },
                  children: [
                    // CARD SHELL (border + bg + radius)
                    {
                      kind: "rect",
                      style: {
                        width: "100%",
                        borderRadius: 16,
                      },
                    },

                    // CONTENT LAYER: image + text
                    {
                      kind: "col",
                      style: {
                        width: "100%",
                        gap: 0,
                      },
                      children: [
                        // IMAGE AREA (fixed 360px, radius 16, clipped)
                        {
                          kind: "rect",
                          style: {
                            width: "100%",
                            height: 360,
                            borderRadius: 16,
                            backgroundColor: "#eaeaea",
                          },
                        },

                        // TEXT AREA (padding 12)
                        {
                          kind: "col",
                          style: {
                            width: "100%",
                            padding: 12,
                            gap: 8,
                          },
                          children: [
                            // title line
                            {
                              kind: "rect",
                              style: {
                                width: "72%",
                                height: 14,
                                borderRadius: 6,
                                backgroundColor: "#eaeaea",
                              },
                            },

                            // price line
                            {
                              kind: "rect",
                              style: {
                                width: "44%",
                                height: 13,
                                borderRadius: 6,
                                backgroundColor: "#eaeaea",
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            }
          }}
        >
          {PRODUCTS.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </Grid>
        <FullscreenAddon
          sliderObject={sliderObject}
          cellsStateLength={FULLSCREEN_ITEMS.length}
        />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Grid Products + Fullscreen Connection",
  component: Demo,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj;

export const Connection: Story = {
  render: () => <Demo />,
};