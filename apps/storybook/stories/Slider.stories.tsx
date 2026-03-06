/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";
import { Video } from "../../../packages/react-motion-gallery/src/Gallery/video";
// ✅ import your real type + normalizer if it's exported
import type { MediaItem } from "../../../packages/react-motion-gallery/src/Gallery/shared/types/media";
// import { normalizeItemsInput } from "../../../packages/react-motion-gallery/src/Gallery/shared/normalizeItems"; // example
// import { toMediaItems } from "../../../packages/react-motion-gallery/src/Gallery/shared/media"; // example

const VIDEO_SRC =
  "https://res.cloudinary.com/dxl2ftf2d/video/upload/v1760238357/13927516_3840_2160_60fps_dvnc3k.mp4";
const VIDEO_POSTER =
  "https://res.cloudinary.com/dxl2ftf2d/image/upload/v1760239118/beach-video-thumb-landscape_saopv3.jpg";

  const VIDEO_SRC_2 =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
  const VIDEO_POSTER_2 =
  "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1600&auto=format&fit=crop";

// ✅ This is the realistic “user input” you want to support
type MediaInput =
  | string
  | {
      src: string;
      poster?: string;
      alt?: string;
    };

const URLS: MediaInput[] = [
  // { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Beach video" },
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1029/1600/900",
  "https://picsum.photos/id/1039/1600/900",
  
  "https://picsum.photos/id/1049/1600/900",
  "https://picsum.photos/id/1079/1600/900",
  "https://picsum.photos/id/1076/1600/900",
];

const FS_URLS: MediaInput[] = [
  // { src: VIDEO_SRC_2, poster: VIDEO_POSTER_2, alt: "Flower video" },
  "https://picsum.photos/id/1021/2600/1900",
  "https://picsum.photos/id/1028/2600/1900",
  "https://picsum.photos/id/1040/2600/1900",
  
  "https://picsum.photos/id/1048/2600/1900",
  "https://picsum.photos/id/1078/2600/1900",
  "https://picsum.photos/id/1075/2600/1900",
];

// ✅ Story-local normalizer (matches the normalizer we discussed)
// If you already export normalizeItemsInput/toMediaItems from your package,
// use that instead of duplicating this in the story.
function inferKindFromSrc(src: string): "image" | "video" {
  return /\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image";
}

function normalizeMediaInput(inputs: MediaInput[]): MediaItem[] {
  return inputs.map((m, i) => {
    if (typeof m === "string") {
      return inferKindFromSrc(m) === "video"
        ? { kind: "video", src: m, alt: `Media ${i + 1}` }
        : { kind: "image", src: m, alt: `Media ${i + 1}` };
    }

    const kind: "image" | "video" = m.poster ? "video" : inferKindFromSrc(m.src);

    return kind === "video"
      ? { kind: "video", src: m.src, poster: m.poster, alt: m.alt ?? `Media ${i + 1}` }
      : { kind: "image", src: m.src, alt: m.alt ?? `Media ${i + 1}` };
  });
}

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "70dvw",
        aspectRatio: '16 / 9',
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

// Auto-height without Slider size props requires intrinsic media height.
function SlideVideoCell({
  src,
  poster,
  i,
}: {
  src: string;
  poster?: string;
  i: number;
}) {
  return (
    <Video
      src={src}
      poster={poster}
      // lazyLoad={{
      //   enabled: false
      // }}
      alt={`Video ${i + 1}`}
      style={{ width: "70dvw", borderRadius: '12px' }}
      // options={{
      //   ratio: '16:9'
      // }}
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
    fullscreen: { 
      enabled: fullscreenEnabled,
      lazyLoad: {
        images: { 
          enabled: true 
        },
        videos: {
          enabled: true
        }
      } 
    },
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

  // ✅ One normalized list drives both base + fullscreen
  const MEDIA = React.useMemo(() => normalizeMediaInput(URLS), []);

  const FS_MEDIA = React.useMemo(() => normalizeMediaInput(FS_URLS), []);

  return (
    <div style={{ padding: 24, maxWidth: '100%' }}>
      <h3 style={{ margin: "0 0 12px" }}>Slider ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any slide. Fullscreen should open. Close it, and it should fully reset.
      </p>

      <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
        <Slider
          lazyLoad={{ enabled: true }}
          scroll={{
            loop: true
          }}
          transitions={{
            loading: {
              // force: true,
              skeletonCount: 2,
              skeleton: {
                mode: "peek",
                layout: {
                  kind: "slider",
                  direction: "row",
                  count: 2,
                  style: {
                    gap: 20,
                  },
                  item: {
                    kind: "rect",
                    style: {
                      width: "70dvw",
                      aspectRatio: "16 / 9",
                      borderRadius: 12,
                    },
                  },
                },
              }
            }
          }}
        >
          {MEDIA.map((m, i) => {
            if (m.kind === "video") {
              return (
                <SlideVideoCell key={`video-${m.src}-${i}`} src={m.src} poster={m.poster} i={i} />
              );
            }

            return (
              <Slide key={`img-${m.kind === 'image' ? m.src : ''}-${i}`} src={m.kind === 'image' ? m.src : ''} i={i} />
            );
          })}
        </Slider>

        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={FS_MEDIA.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Slider + Fullscreen Connection",
  component: Demo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

export const Connection: Story = {
  render: () => <Demo />,
};
