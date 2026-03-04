/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";

const ITEMS = [
  "https://picsum.photos/id/1018/1400/900",
  "https://picsum.photos/id/1025/1400/900",
  "https://picsum.photos/id/1035/1400/900",
  "https://picsum.photos/id/1043/1400/900",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

function AutoHeightDemo() {
  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <h3 style={{ margin: "0 0 12px" }}>Auto-height slider</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        The block below should stay directly beneath the slider.
      </p>
      <GalleryCore layout="slider" fullscreenItems={ITEMS}>
        <Slider
          layout={{ gap: 12 }}
          scroll={{ loop: true }}
        >
          {ITEMS.map((src, i) => (
            <Slide key={src} src={src} i={i} />
          ))}
        </Slider>
      </GalleryCore>
      <div
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 12,
          border: "1px dashed #94a3b8",
          background: "#f8fafc",
        }}
      >
        Flow content after the slider
      </div>
    </div>
  );
}

function FixedHeightDemo() {
  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <h3 style={{ margin: "0 0 12px" }}>Fixed-height slider</h3>
      <GalleryCore layout="slider" fullscreenItems={ITEMS}>
        <Slider
          size={{ height: "360px" }}
          layout={{ gap: 12 }}
          scroll={{ loop: true }}
        >
          {ITEMS.map((src, i) => (
            <Slide key={src} src={src} i={i} />
          ))}
        </Slider>
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Slider/Auto Height",
  component: AutoHeightDemo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

export const NaturalHeight: Story = {
  render: () => <AutoHeightDemo />,
};

export const FixedHeight: Story = {
  render: () => <FixedHeightDemo />,
};
