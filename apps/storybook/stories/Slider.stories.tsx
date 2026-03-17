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
  { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Beach video" },
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1029/1600/900",
  "https://picsum.photos/id/1039/1600/900",
  
  { src: VIDEO_SRC_2, poster: VIDEO_POSTER_2, alt: "Flower video" },
  "https://picsum.photos/id/1049/1600/900",
  "https://picsum.photos/id/1079/1600/900",
  "https://picsum.photos/id/1076/1600/900",
];

const FS_URLS: MediaInput[] = [
  { src: VIDEO_SRC, poster: VIDEO_POSTER, alt: "Beach video" },
  "https://picsum.photos/id/1020/3200/1800",
  "https://picsum.photos/id/1029/3200/1800",
  "https://picsum.photos/id/1039/3200/1800",
  
  { src: VIDEO_SRC_2, poster: VIDEO_POSTER_2, alt: "Flower video" },
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

const HEIGHT_PARITY_STAGE_WIDTHS = [700, 520] as const;

function createHeightParitySlideSrc(label: string, fill: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="${fill}" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="white"
        font-family="sans-serif"
        font-size="120"
        font-weight="700"
      >
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const HEIGHT_PARITY_SRCS = [
  createHeightParitySlideSrc("One", "#0f766e"),
  createHeightParitySlideSrc("Two", "#1d4ed8"),
  createHeightParitySlideSrc("Three", "#be123c"),
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

function stubMediaPlayback(video: HTMLVideoElement) {
  let paused = true;
  const originalPlay = video.play.bind(video);
  const originalPause = video.pause.bind(video);

  Object.defineProperty(video, "paused", {
    configurable: true,
    get: () => paused,
  });

  video.play = (() => {
    paused = false;
    return Promise.resolve();
  }) as typeof video.play;

  video.pause = (() => {
    paused = true;
  }) as typeof video.pause;

  return {
    restore() {
      video.play = originalPlay;
      video.pause = originalPause;
      delete (video as HTMLVideoElement & { paused?: boolean }).paused;
    },
  };
}

function getFullscreenOverlay(doc: Document): HTMLElement | null {
  return doc.body.querySelector<HTMLElement>('div[class*="fullscreenOverlay"]');
}

function readElementOpacity(el: HTMLElement): number {
  const opacity = Number.parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(opacity) ? opacity : 1;
}

function createOverlayOpacityMutationGuard(overlay: HTMLElement) {
  const samples: number[] = [];
  const badMutations: string[] = [];
  let active = false;
  let lastOpacity = readElementOpacity(overlay);

  const record = (label: string) => {
    const nextOpacity = readElementOpacity(overlay);
    samples.push(nextOpacity);

    if (active && nextOpacity > lastOpacity + 0.02) {
      badMutations.push(
        `${label}: opacity increased from ${lastOpacity.toFixed(3)} to ${nextOpacity.toFixed(3)}`
      );
    }

    if (active && nextOpacity >= 0.98 && lastOpacity < 0.98) {
      badMutations.push(
        `${label}: opacity reset to base from ${lastOpacity.toFixed(3)} to ${nextOpacity.toFixed(3)}`
      );
    }

    lastOpacity = nextOpacity;
    return nextOpacity;
  };

  const observer = new MutationObserver(() => {
    record("mutation");
  });

  observer.observe(overlay, {
    attributes: true,
    attributeFilter: ["style"],
  });

  return {
    samples,
    badMutations,
    start() {
      active = true;
      lastOpacity = readElementOpacity(overlay);
      samples.push(lastOpacity);
    },
    sample(label: string) {
      return record(label);
    },
    disconnect() {
      observer.disconnect();
    },
  };
}

function nextFrame(doc: Document) {
  const win = doc.defaultView;
  if (!win) return Promise.resolve();

  return new Promise<void>((resolve) => {
    win.requestAnimationFrame(() => resolve());
  });
}

async function dragElementVertically(
  doc: Document,
  target: HTMLElement,
  distance: number,
  steps = 6
) {
  const win = doc.defaultView;
  if (!win) throw new Error("Missing owner window for drag simulation");

  const rect = target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  target.dispatchEvent(
    new win.MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    })
  );
  await nextFrame(doc);

  for (let step = 1; step <= steps; step += 1) {
    const clientY = startY + (distance * step) / steps;
    doc.dispatchEvent(
      new win.MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: startX,
        clientY,
        button: 0,
        buttons: 1,
      })
    );
    await nextFrame(doc);
  }

  doc.dispatchEvent(
    new win.MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      clientX: startX,
      clientY: startY + distance,
      button: 0,
      buttons: 0,
    })
  );
  await nextFrame(doc);
}

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100cqw",
          maxWidth: "550px",
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
      style={{ width: "100cqw",
          maxWidth: "550px",
          aspectRatio: '16 / 9', borderRadius: '12px' }}
      // options={{
      //   ratio: '16:9'
      // }}
    />
  );
}

function FullscreenAddon(props: {
  fullscreenEnabled?: boolean;
}) {
  const { fullscreenEnabled = true } = props;

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
  });

  return <>{fullscreenNode}</>;
}

function HeightParitySlide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Parity slide ${i + 1}`}
      style={{
        width: "100cqw",
        maxWidth: "550px",
        aspectRatio: "16 / 9",
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

function SkeletonHeightClampRegressionDemo() {
  const [width, setWidth] = React.useState<number>(HEIGHT_PARITY_STAGE_WIDTHS[0]);

  return (
    <div style={{ padding: 24, maxWidth: "100%" }}>
      <h3 style={{ margin: "0 0 12px" }}>Skeleton cqw clamp parity</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8, maxWidth: 760 }}>
        The forced skeleton shell should stay height-aligned with a matching live slider
        above and below the 550px max-width clamp.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {HEIGHT_PARITY_STAGE_WIDTHS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setWidth(value)}
            style={{
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: width === value ? "#dbeafe" : "#ffffff",
              color: "#0f172a",
              cursor: "pointer",
              fontWeight: 700,
              padding: "8px 12px",
            }}
          >
            {value}px
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        <section>
          <h4 style={{ margin: "0 0 8px" }}>Forced skeleton</h4>
          <div
            data-testid="height-parity-skeleton-stage"
            style={{ width: `${width}px`, maxWidth: "100%" }}
          >
            <Slider
              controls={{
                arrows: { enabled: false },
                dots: { enabled: false },
                progress: { enabled: false },
              }}
              transitions={{
                loading: {
                  force: true,
                  skeletonCount: 2,
                  skeleton: {
                    mode: "peek",
                    layout: {
                      kind: "slider",
                      direction: "row",
                      style: {
                        gap: 20,
                      },
                      item: {
                        kind: "rect",
                        style: {
                          width: "100cqw",
                          maxWidth: "550px",
                          aspectRatio: "16 / 9",
                          borderRadius: 12,
                        },
                      },
                    },
                  },
                },
              }}
            >
              {HEIGHT_PARITY_SRCS.map((src, i) => (
                <HeightParitySlide key={`height-parity-skeleton-${i}`} src={src} i={i} />
              ))}
            </Slider>
          </div>
        </section>

        <section>
          <h4 style={{ margin: "0 0 8px" }}>Live slider</h4>
          <div
            data-testid="height-parity-live-stage"
            style={{ width: `${width}px`, maxWidth: "100%" }}
          >
            <Slider
              controls={{
                arrows: { enabled: false },
                dots: { enabled: false },
                progress: { enabled: false },
              }}
              transitions={{
                loading: {
                  enabled: false,
                },
              }}
              elements={{
                viewport: {
                  className: "height-parity-live-viewport",
                },
              }}
            >
              {HEIGHT_PARITY_SRCS.map((src, i) => (
                <HeightParitySlide key={`height-parity-live-${i}`} src={src} i={i} />
              ))}
            </Slider>
          </div>
        </section>
      </div>
    </div>
  );
}

function Demo() {
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

        <FullscreenAddon />
      </GalleryCore>
      <Video
        src={VIDEO_SRC}
        poster={VIDEO_POSTER}
        // lazyLoad={{
        //   enabled: false
        // }}
        alt={`Video 1`}
        style={{ width: "70dvw", aspectRatio: '16 / 9', borderRadius: '12px' }}
        options={{
          ratio: '16:9'
        }}
      />
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

    const waitForBaseVideo = async (index: number) => {
      let slide: HTMLElement | null = null;
      let video: HTMLVideoElement | null = null;

      await waitFor(() => {
        slide = getBaseSlide(canvasElement, index);
        expect(slide).not.toBeNull();

        video = slide!.querySelector<HTMLVideoElement>("video");
        expect(video).not.toBeNull();
      });

      return {
        slide: slide!,
        video: video!,
      };
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

    const baseVideoState = await waitForBaseVideo(0);
    const baseVideoPlayback = stubMediaPlayback(baseVideoState.video);
    try {
      await baseVideoState.video.play();
      expect(baseVideoState.video.paused).toBe(false);

      await openBaseSlide(0);
      const initialVideoState = await waitForVisibleVideo(0);
      const initialMuted = initialVideoState.video.muted;
      const initialWidth = initialVideoState.wrapper.style.width;
      const initialHeight = initialVideoState.wrapper.style.height;

      await waitFor(() => {
        expect(baseVideoState.video.paused).toBe(true);
      });

      const closeGuard = createCloseRootMutationGuard(doc);
      await closeFullscreen();
      closeGuard.disconnect();
      expect(closeGuard.badMutations).toEqual([]);
      expect(baseVideoState.video.paused).toBe(true);

      await openBaseSlide(0);
      const reopenedVideoState = await waitForVisibleVideo(0);

      expect(reopenedVideoState.wrapper.style.width).toBe(initialWidth);
      expect(reopenedVideoState.wrapper.style.height).toBe(initialHeight);
      expect(reopenedVideoState.video.muted).toBe(initialMuted);
    } finally {
      baseVideoPlayback.restore();
    }
  },
};

export const FullscreenVerticalCloseOverlayRegression: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const win = doc.defaultView;
    if (!win) throw new Error("Missing owner window for fullscreen drag regression");

    let baseSlide: HTMLElement | null = null;
    await waitFor(() => {
      baseSlide = getBaseSlide(canvasElement, 1);
      expect(baseSlide).not.toBeNull();
    });

    await userEvent.click(baseSlide!);

    let overlay: HTMLElement | null = null;
    let fullscreenSlide: HTMLElement | null = null;

    await waitFor(() => {
      assertFullscreenRootsVisible(doc);
      overlay = getFullscreenOverlay(doc);
      fullscreenSlide = getFullscreenSlide(doc, 1);

      expect(overlay).not.toBeNull();
      expect(fullscreenSlide).not.toBeNull();
    });

    const overlayGuard = createOverlayOpacityMutationGuard(overlay!);
    overlayGuard.start();

    const distance = Math.max(240, Math.round(win.innerHeight * 0.42));
    await dragElementVertically(doc, fullscreenSlide!, distance, 7);
    overlayGuard.sample("post-drag");

    await waitFor(() => {
      const modal = doc.body.querySelector<HTMLElement>(".fs_modal");
      const slider = doc.body.querySelector<HTMLElement>(".fullscreen_slider");

      expect(modal).not.toBeNull();
      expect(slider).not.toBeNull();
      expect(getComputedStyle(modal!).opacity).toBe("0");
      expect(getComputedStyle(modal!).pointerEvents).toBe("none");
      expect(getComputedStyle(slider!).opacity).toBe("0");
    });

    if (overlay!.isConnected) {
      overlayGuard.sample("post-close");
    }
    overlayGuard.disconnect();

    expect(overlayGuard.samples.some((value) => value < 0.98)).toBe(true);
    expect(overlayGuard.badMutations).toEqual([]);
  },
};

export const SkeletonHeightClampRegression: Story = {
  render: () => <SkeletonHeightClampRegressionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const expectParity = async () => {
      await waitFor(() => {
        const skeletonStage = canvasElement.querySelector<HTMLElement>(
          '[data-testid="height-parity-skeleton-stage"]'
        );
        const liveStage = canvasElement.querySelector<HTMLElement>(
          '[data-testid="height-parity-live-stage"]'
        );
        expect(skeletonStage).not.toBeNull();
        expect(liveStage).not.toBeNull();

        const skeletonShell = skeletonStage!.querySelector<HTMLElement>(
          '[data-rmg-scope-shell="true"]'
        );
        const skeletonRow = skeletonStage!.querySelector<HTMLElement>('[data-rmg-skel-part="row"]');
        const liveViewport = liveStage!.querySelector<HTMLElement>(".height-parity-live-viewport");

        expect(skeletonShell).not.toBeNull();
        expect(skeletonRow).not.toBeNull();
        expect(liveViewport).not.toBeNull();

        const skeletonShellHeight = skeletonShell!.getBoundingClientRect().height;
        const skeletonRowHeight = skeletonRow!.getBoundingClientRect().height;
        const liveViewportHeight = liveViewport!.getBoundingClientRect().height;

        expect(skeletonShellHeight).toBeGreaterThan(0);
        expect(skeletonRowHeight).toBeGreaterThan(0);
        expect(liveViewportHeight).toBeGreaterThan(0);
        expect(Math.abs(skeletonShellHeight - liveViewportHeight)).toBeLessThanOrEqual(1);
        expect(Math.abs(skeletonRowHeight - liveViewportHeight)).toBeLessThanOrEqual(1);
      });
    };

    await expectParity();

    await userEvent.click(canvas.getByRole("button", { name: "520px" }));
    await expectParity();
  },
};
