/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";
import { FullscreenThumbnailSlider } from "../../../packages/react-motion-gallery/src/Gallery/fullscreenThumbnails";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";
import ThumbnailSlider from "../../../packages/react-motion-gallery/src/Gallery/thumbnails";
import { createSliderIndexChannel } from "../../../packages/react-motion-gallery/src/Gallery/slider/sliderSub";

const SLIDES = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
  "https://picsum.photos/id/1035/1600/900",
  "https://picsum.photos/id/1043/1600/900",
  "https://picsum.photos/id/1057/1600/900",
];

const THUMBS = [
  "https://picsum.photos/id/1015/320/200",
  "https://picsum.photos/id/1018/320/200",
  "https://picsum.photos/id/1024/320/200",
  "https://picsum.photos/id/1035/320/200",
  "https://picsum.photos/id/1043/320/200",
  "https://picsum.photos/id/1057/320/200",
];

function SlideCell({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100%",
        height: '400px',
        objectFit: "contain",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

function ThumbCell({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Thumbnail ${i + 1}`}
      style={{
        width: "inherit",
        height: "inherit",
        objectFit: "contain",
        display: "block",
        // borderRadius: 8,
      }}
    />
  );
}

function FullscreenAddon(props: {
  sliderObject: any;
  cellsStateLength: number;
}) {
  const { sliderObject, cellsStateLength } = props;

  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
    slider: undefined,
    sliderObject,
    cellsStateLength,
  });

  const fullscreenThumbItems = React.useMemo(
    () =>
      THUMBS.map((src, i) => ({
        thumbSrc: src,
        alt: `Thumbnail ${i + 1}`,
      })),
    []
  );

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={fullscreenThumbItems}
        position="bottom"
        thumbnailsCenter={true}
        containerStyle={{ width: 'calc(100dvw - 24px)', padding: '6px 12px', overflow: 'visible' }}
        thumbnailWidth='auto'
        thumbnailHeight={60}
        thumbnailItemStyle={{ borderRadius: 8 }}
        gap={10}
        freeScroll
        groupCells={false}
        loop={false}
        skipSnaps={false}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

function Demo() {
  const channel = React.useMemo(() => createSliderIndexChannel(), []);
  const sliderObject = React.useMemo(
    () => ({
      align: "center",
      direction: { dir: "ltr" },
    }),
    []
  );

  return (
    <div style={{ padding: 24, maxWidth: '100%' }}>
      <h3 style={{ margin: "0 0 12px" }}>
        Slider + Standalone Thumbnails + Fullscreen Thumbnails (Synced)
      </h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Slider changes sync into thumbnails. Only thumbnail clicks sync back to slider.
        Thumbnail wheel, drag, and arrows remain local-only. Click any slide to
        open fullscreen and validate fullscreen thumbnails there as well.
      </p>
      <GalleryCore layout="slider" fullscreenItems={SLIDES}>
        <Slider
          indexChannel={channel}
          scroll={{ loop: false }}
        >
          {SLIDES.map((src, i) => (
            <SlideCell key={src} src={src} i={i} />
          ))}
        </Slider>

        <div style={{ marginTop: 14 }}>
          <ThumbnailSlider
            indexChannel={channel}
            options={{
              layout: {
                position: "bottom",
                thumbnail: { width: 96, height: 60 },
                // container: { width: '100dvw', height: 76 },
                gap: 10,
              },
              elements: {
                thumbnail: {
                  style: {
                    borderRadius: 8
                  }
                }
              }
            }}
          >
            {THUMBS.map((src, i) => (
              <ThumbCell key={`thumb-${src}`} src={src} i={i} />
            ))}
          </ThumbnailSlider>
        </div>

        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={SLIDES.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Slider + Standalone Thumbnails (Synced)",
  component: Demo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

export const Synced: Story = {
  render: () => <Demo />,
};
