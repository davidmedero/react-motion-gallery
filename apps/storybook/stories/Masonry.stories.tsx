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

      {/* ✅ Provider wraps Masonry runtime + Fullscreen addon */}
      <GalleryCore layout="masonry" fullscreenItems={ITEMS}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Masonry
            columns={{ xs: 2, md: 3, lg: 4 }}
            gap={10 as any}
            loading={{
              // isLoading: true,
              shimmer: {
                radius: 14,
                c1: "rgba(140,140,140,0.06)",
                c2: "rgba(140,140,140,0.14)",
                c3: "rgba(140,140,140,0.06)",
                duration: "1.35s",
                size: "280% 100%",
                timing: 'linear'
              },
              ratios: [100, 60, 130, 80]
            }}
          >
            {ITEMS.map((src, i) => (
              <div key={src}>
                <MasonryCell src={src} i={i} />
              </div>
            ))}
          </Masonry>
        </div>

        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={ITEMS.length} />
      </GalleryCore>
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