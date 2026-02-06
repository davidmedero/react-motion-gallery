/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

const ITEMS = [
  "https://picsum.photos/id/1018/1000/1600",
  "https://picsum.photos/id/1025/1000/1600",
  "https://picsum.photos/id/1035/1000/1600",
  "https://picsum.photos/id/1043/1000/1600",
  "https://picsum.photos/id/1069/1000/1600",
  "https://picsum.photos/id/1074/1000/1600",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
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
    <div style={{ padding: 24, maxWidth: 980 }}>
      <h3 style={{ margin: "0 0 12px" }}>
        Slider with Cells Per Slide ↔ Fullscreen connection test
      </h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any slide. Fullscreen should open. Close it, and it should fully reset.
      </p>
      <GalleryCore layout="slider" fullscreenItems={ITEMS}>
        <Slider
          size={{
            aspectRatio: 1000/1600
          }}
          layout={{
            cellsPerSlide: { 0: 2, 600: 3, 900: 4 },
            gap: 12,
          }}
          transitions={{
            loading: {
              // isLoading: true,
              skeletonCount: { 0: 2, 600: 3, 900: 4 },
            }
          }}
        >
          {ITEMS.map((src, i) => (
            <div key={src} style={{ height: "100%" }}>
              <Slide src={src} i={i} />
            </div>
          ))}
        </Slider>
        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={ITEMS.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Slider with Cells Per Slide + Fullscreen Connection",
  component: Demo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

export const Connection: Story = {
  render: () => <Demo />,
};