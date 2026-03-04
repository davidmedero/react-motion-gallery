/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import Grid from "../../../packages/react-motion-gallery/src/Gallery/grid";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

// ✅ your Video component
import { Video } from "../../../packages/react-motion-gallery/src/Gallery/video";

// If you already have MediaItem types available, you can import them.
// Otherwise we can just use `any` for the fullscreenItems entries.
// import type { MediaItem } from "../../../packages/react-motion-gallery/src/Gallery/shared/types/media";

const IMG_ITEMS = Array.from({ length: 12 }).map(
  (_, i) => `https://picsum.photos/seed/grid-${i}/1000/1500`
);

// ✅ sample mp4 + poster
const VIDEO_SRC = "https://cdn.plyr.io/static/blank.mp4";
const VIDEO_POSTER = "https://picsum.photos/seed/grid-video-poster/1000/1500";

function GridImageCell({ src, i }: { src: string; i: number }) {
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

function GridVideoCell() {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "2/3",
          borderRadius: 12,
          overflow: "hidden",
          background: "black",
        }}
      >
        <Video
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          alt="Grid video"
          style={{ width: "100%", height: "100%" }}
          options={{
            controls: ["play", "progress", "mute", "volume", "fullscreen"],
          } as any}
        />
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

  // ✅ Build fullscreen items that include BOTH images and video(s)
  const FULLSCREEN_ITEMS = React.useMemo(() => {
    // Choose where the video appears in the global list
    const VIDEO_AT = 3;

    // Convert image urls into MediaItems
    const imgMedia = IMG_ITEMS.map((src, i) => ({
      kind: "image",
      src,
      alt: `Grid ${i + 1}`,
    }));

    // Insert a video item
    imgMedia.splice(VIDEO_AT, 0, {
      kind: "video",
      src: VIDEO_SRC,
      alt: "Grid video",
    });

    return imgMedia as any[]; // or `as MediaItem[]` if you import the type
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Grid ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any grid item (image or video). Fullscreen should open. Close it,
        and it should fully reset.
      </p>

      {/* ✅ fullscreenItems now includes videos too */}
      <GalleryCore layout="grid" fullscreenItems={FULLSCREEN_ITEMS as any}>
        <Grid
          columns={{ 0: 1, 500: 2, 768: 3, 1024: 4, 1280: 5 }}
          gap={12}
          loading={{
            skeleton: {
              layout: {
                kind: "grid",
                item: { kind: "rect", style: { aspectRatio: "2/3" } },
              },
            },
          }}
        >
          {FULLSCREEN_ITEMS.map((m: any, i: number) => {
            if (m.kind === "video") {
              return (
                <div key={`video-${i}`}>
                  <GridImageCell src={VIDEO_POSTER} i={i} />
                </div>
              );
            }

            return (
              <div key={`img-${m.src}-${i}`}>
                <GridImageCell src={m.src} i={i} />
              </div>
            );
          })}
        </Grid>

        {/* ✅ length must match fullscreenItems length */}
        <FullscreenAddon
          sliderObject={sliderObject}
          cellsStateLength={FULLSCREEN_ITEMS.length}
        />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Grid + Fullscreen Connection",
  component: Demo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

export const Connection: Story = {
  render: () => <Demo />,
};
