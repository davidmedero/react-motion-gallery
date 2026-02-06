/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import Grid from "../../../packages/react-motion-gallery/src/Gallery/grid";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

const ITEMS = Array.from({ length: 12 }).map(
  (_, i) => `https://picsum.photos/seed/grid-${i}/1000/1500`
);

function GridCell({ src, i }: { src: string; i: number }) {
  return (
    <div style={{ width: "100%" }}>
      <img
        src={src}
        alt={`Grid ${i + 1}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: 12,
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
      <h3 style={{ margin: "0 0 12px" }}>Grid ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any grid image. Fullscreen should open. Close it, and it should fully reset.
      </p>

      <GalleryCore layout="grid" fullscreenItems={ITEMS}>
        <Grid
          columns={{ 0: 1, 500: 2, 768: 3, 1024: 4, 1280: 5 }}
          gap={12}
          loading={{
            // isLoading: true,
            skeleton: {
              layout: {
                kind: "grid",
                item: {
                  kind: "rect",
                  style: { aspectRatio: '2/3' },
                },
              }
            }
          }}
        >
          {ITEMS.map((src, i) => (
              <div key={src}>
              <GridCell src={src} i={i} />
            </div>
          ))}
        </Grid>
        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={ITEMS.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Grid + Fullscreen Connection",
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