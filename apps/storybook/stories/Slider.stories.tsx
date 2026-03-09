/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GalleryCore, useGalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
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

// ✅ This is the realistic “user input” you want to support
type MediaInput =
  | string
  | {
      src: string;
      poster?: string;
      alt?: string;
    };

const URLS: MediaInput[] = [
  
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1029/1600/900",
  "https://picsum.photos/id/1039/1600/900",
  { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Beach video" },
  "https://picsum.photos/id/1049/1600/900",
  "https://picsum.photos/id/1079/1600/900",
  "https://picsum.photos/id/1076/1600/900",
];

const FS_URLS: MediaInput[] = [
  
  "https://picsum.photos/id/1020/3200/1800",
  "https://picsum.photos/id/1029/3200/1800",
  "https://picsum.photos/id/1039/3200/1800",
  { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Beach video" },
  "https://picsum.photos/id/1049/3200/1800",
  "https://picsum.photos/id/1079/3200/1800",
  "https://picsum.photos/id/1076/3200/1800",
];

const CLONE_SYNC_URLS: MediaInput[] = [
  { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Heavy beach video" },
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1029/1600/900",
  "https://picsum.photos/id/1039/1600/900",
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

function pickClosestToViewportCenter<T extends HTMLElement>(elements: T[]): T | null {
  if (!elements.length) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  let best: T | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const distance =
      Math.abs(rect.left + rect.width / 2 - centerX) +
      Math.abs(rect.top + rect.height / 2 - centerY);

    if (distance < bestDistance) {
      best = el;
      bestDistance = distance;
    }
  }

  return best ?? elements[0] ?? null;
}

function getBaseSlide(canvasElement: HTMLElement, index: number): HTMLElement | null {
  return pickClosestToViewportCenter(
    Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        `[data-rmg-slide="true"][data-rmg-idx="${index}"]`
      )
    )
  );
}

function getFullscreenSlide(doc: Document, canonicalIndex: number): HTMLElement | null {
  return pickClosestToViewportCenter(
    Array.from(
      doc.body.querySelectorAll<HTMLElement>(
        `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${canonicalIndex}"]`
      )
    )
  );
}

function assertFullscreenRootsVisible(doc: Document) {
  const modal = doc.body.querySelector<HTMLElement>(".fs_modal");
  const slider = doc.body.querySelector<HTMLElement>(".fullscreen_slider");

  expect(modal).not.toBeNull();
  expect(slider).not.toBeNull();
  expect(getComputedStyle(modal!).opacity).not.toBe("0");
  expect(getComputedStyle(modal!).pointerEvents).not.toBe("none");
  expect(getComputedStyle(slider!).opacity).not.toBe("0");
}

function createCloseRootMutationGuard(doc: Document) {
  const modal = doc.body.querySelector<HTMLElement>(".fs_modal");
  const slider = doc.body.querySelector<HTMLElement>(".fullscreen_slider");

  expect(modal).not.toBeNull();
  expect(slider).not.toBeNull();

  const badMutations: string[] = [];
  const hiddenRoots = new WeakSet<HTMLElement>();
  const watchedRoots = [modal!, slider!];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const el = record.target as HTMLElement;
      if (!watchedRoots.includes(el)) continue;

      const computed = getComputedStyle(el);
      const styleAttr = el.getAttribute("style") ?? "";
      const isHidden =
        computed.opacity === "0" ||
        computed.visibility === "hidden" ||
        computed.pointerEvents === "none";

      if (isHidden) {
        hiddenRoots.add(el);
        continue;
      }

      const rewroteVisibleState =
        /opacity:\s*1(?:;|$)/.test(styleAttr) ||
        /pointer-events:\s*auto(?:;|$)/.test(styleAttr);

      if (hiddenRoots.has(el) && rewroteVisibleState) {
        badMutations.push(`${el.className}: ${styleAttr}`);
      }
    }
  });

  for (const root of watchedRoots) {
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  return {
    badMutations,
    disconnect() {
      observer.disconnect();
    },
  };
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

function ClonePlaybackSyncRegressionDemo() {
  const media = React.useMemo(() => normalizeMediaInput(CLONE_SYNC_URLS), []);

  return (
    <div style={{ padding: 24, maxWidth: "100%" }}>
      <h3 style={{ margin: "0 0 12px" }}>Clone video snapshot regression</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8, maxWidth: 760 }}>
        Scroll to the last slide and inspect the peeking clone of the first heavy video.
        The loop clone should render a non-interactive snapshot of the canonical player instead of a second live Plyr instance.
      </p>

      <GalleryCore layout="slider">
        <Slider
          lazyLoad={{ enabled: true }}
          scroll={{
            loop: true,
          }}
        >
          {media.map((m, i) => {
            if (m.kind === "video") {
              return (
                <SlideVideoCell key={`clone-sync-video-${m.src}-${i}`} src={m.src} poster={m.poster} i={i} />
              );
            }

            return (
              <Slide
                key={`clone-sync-img-${m.kind === "image" ? m.src : ""}-${i}`}
                src={m.kind === "image" ? m.src : ""}
                i={i}
              />
            );
          })}
        </Slider>
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

export const ClonePlaybackSyncRegression: Story = {
  render: () => <ClonePlaybackSyncRegressionDemo />,
};

export const FullscreenReopenRegression: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;

    const openBaseSlide = async (index: number) => {
      let slide: HTMLElement | null = null;

      await waitFor(() => {
        slide = getBaseSlide(canvasElement, index);
        expect(slide).not.toBeNull();
      });

      await userEvent.click(slide!);
    };

    const waitForVisibleImage = async (canonicalIndex: number) => {
      let image: HTMLImageElement | null = null;

      await waitFor(() => {
        assertFullscreenRootsVisible(doc);

        const slide = getFullscreenSlide(doc, canonicalIndex);
        expect(slide).not.toBeNull();

        image = slide!.querySelector<HTMLImageElement>('[data-rmg-fs-media="true"] img');
        expect(image).not.toBeNull();

        const style = getComputedStyle(image!);
        expect(style.visibility).not.toBe("hidden");
        expect(style.opacity).not.toBe("0");
      });

      return image!;
    };

    const waitForVisibleVideo = async (canonicalIndex: number) => {
      let wrapper: HTMLElement | null = null;
      let video: HTMLVideoElement | null = null;

      await waitFor(() => {
        assertFullscreenRootsVisible(doc);

        const slide = getFullscreenSlide(doc, canonicalIndex);
        expect(slide).not.toBeNull();

        wrapper = slide!.querySelector<HTMLElement>(".rmg__player");
        expect(wrapper).not.toBeNull();

        const wrapperStyle = getComputedStyle(wrapper!);
        expect(wrapperStyle.visibility).not.toBe("hidden");
        expect(wrapperStyle.opacity).not.toBe("0");
        expect(wrapper!.style.width).not.toBe("0px");
        expect(wrapper!.style.height).not.toBe("0px");

        const poster = wrapper!.querySelector<HTMLElement>(".plyr__poster");
        if (poster) expect(poster.style.opacity).not.toBe("0");

        const controls = wrapper!.querySelector<HTMLElement>(".plyr__controls");
        if (controls) expect(controls.style.opacity).not.toBe("0");

        video = wrapper!.querySelector<HTMLVideoElement>("video");
        expect(video).not.toBeNull();
      });

      return {
        video: video!,
        wrapper: wrapper!,
      };
    };

    const closeFullscreen = async () => {
      await userEvent.click(
        await within(doc.body).findByRole("button", { name: "Close" })
      );

      await waitFor(() => {
        const modal = doc.body.querySelector<HTMLElement>(".fs_modal");
        const slider = doc.body.querySelector<HTMLElement>(".fullscreen_slider");

        expect(modal).not.toBeNull();
        expect(slider).not.toBeNull();
        expect(getComputedStyle(modal!).opacity).toBe("0");
        expect(getComputedStyle(modal!).pointerEvents).toBe("none");
        expect(getComputedStyle(slider!).opacity).toBe("0");
      });
    };

    await openBaseSlide(1);
    await waitForVisibleImage(1);
    await closeFullscreen();

    await openBaseSlide(1);
    await waitForVisibleImage(1);
    await closeFullscreen();

    await openBaseSlide(1);
    await waitForVisibleImage(1);
    await closeFullscreen();

    await openBaseSlide(0);
    const initialVideoState = await waitForVisibleVideo(0);
    const initialMuted = initialVideoState.video.muted;
    const initialWidth = initialVideoState.wrapper.style.width;
    const initialHeight = initialVideoState.wrapper.style.height;

    const closeGuard = createCloseRootMutationGuard(doc);
    await closeFullscreen();
    closeGuard.disconnect();
    expect(closeGuard.badMutations).toEqual([]);

    await openBaseSlide(0);
    const reopenedVideoState = await waitForVisibleVideo(0);

    expect(reopenedVideoState.wrapper.style.width).toBe(initialWidth);
    expect(reopenedVideoState.wrapper.style.height).toBe(initialHeight);
    expect(reopenedVideoState.video.muted).toBe(initialMuted);
  },
};
