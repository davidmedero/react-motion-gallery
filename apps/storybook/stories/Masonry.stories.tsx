/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import Masonry from "../../../packages/react-motion-gallery/src/Gallery/masonry";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

const COUNT = 18;

const ITEMS = Array.from({ length: COUNT }).map((_, i) => {
  const heights = [900, 1600, 600, 1300, 800, 1200];
  const widths = [1600, 900, 1300, 600, 1200, 800];
  const h = heights[i % heights.length];
  const w = widths[i % widths.length];
  return `https://picsum.photos/seed/rmg-${i + 1}/${w}/${h}`;
});

function MasonryCell({ src, i }: { src: string; i: number }) {
  const heights = [280, 320, 240, 440, 310, 500];
  const h = heights[i % heights.length];

  return (
    <div
      style={{
        width: "100%",
        height: h,
        overflow: "hidden",
        borderRadius: 14,
        background: "rgba(0,0,0,0.06)",
      }}
    >
      <img
        src={src}
        alt={`Masonry ${i + 1}`}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

function MasonryLazyCell({ src, i }: { src: string; i: number }) {
  const heights = [280, 320, 240, 440, 310, 500];
  const h = heights[i % heights.length];

  return (
    <div
      style={{
        width: "100%",
        height: h,
        overflow: "hidden",
        borderRadius: 14,
        background: "rgba(0,0,0,0.06)",
      }}
    >
      <img
        src={src}
        alt={`Lazy masonry ${i + 1}`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
        }}
      />
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
    fullscreen: {
      enabled: fullscreenEnabled,
    } as any,
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
      <h3 style={{ margin: "0 0 12px" }}>Masonry ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any masonry image. Fullscreen should open. Close it, and it should fully reset.
      </p>
      <GalleryCore layout="masonry" fullscreenItems={ITEMS}>
        <Masonry
          columns={{ xs: 2, md: 3, lg: 4 }}
          gap={10}
        >
          {ITEMS.map((src, i) => (
            <div key={src}>
              <MasonryCell src={src} i={i} />
            </div>
          ))}
        </Masonry>
        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={ITEMS.length} />
      </GalleryCore>
    </div>
  );
}

function LazyLoadDemo() {
  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Masonry lazyLoad</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Masonry keeps its current column layout while each image cell manages its own spinner.
      </p>
      <Masonry
        columns={{ xs: 2, md: 3, lg: 4 }}
        gap={10}
        lazyLoad={{
          enabled: true,
          spinner: ({ kind }) => (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#10253d",
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 10px 30px rgba(16,37,61,0.12)",
              }}
            >
              {kind}
            </div>
          ),
        }}
      >
        {ITEMS.map((src, i) => (
          <div key={`lazy-masonry-${src}`}>
            <MasonryLazyCell src={src} i={i} />
          </div>
        ))}
      </Masonry>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Masonry + Fullscreen Connection",
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

export const LazyLoad: Story = {
  render: () => <LazyLoadDemo />,
};
