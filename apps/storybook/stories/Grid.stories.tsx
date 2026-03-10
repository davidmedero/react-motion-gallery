/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GalleryCore, useGalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
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
const GRID_CONNECTION_PROBE = "grid-base-visible-connection";
const GRID_LAZY_PROBE = "grid-base-visible-lazy";

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

function BaseVisibleProbe({ testId }: { testId: string }) {
  const core = useGalleryCore();
  const [seen, setSeen] = React.useState<number[]>([]);

  React.useEffect(() => {
    const off = core.baseVisibleSub.subscribe((evt) => {
      const idx = evt?.index;
      if (typeof idx !== "number" || !Number.isFinite(idx)) return;

      setSeen((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    });

    return () => off?.();
  }, [core]);

  return (
    <output data-testid={testId} style={{ display: "none" }}>
      {seen.join(",")}
    </output>
  );
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

function getSeenIndices(canvasElement: HTMLElement, testId: string) {
  const probe = canvasElement.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!probe) return [];

  return (probe.textContent ?? "")
    .split(",")
    .map((part) => parseInt(part, 10))
    .filter((value) => Number.isFinite(value));
}

async function waitForProbeIndex(canvasElement: HTMLElement, testId: string, index: number) {
  await waitFor(() => {
    expect(getSeenIndices(canvasElement, testId)).toContain(index);
  });
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

async function waitForVisibleFullscreenImage(doc: Document, canonicalIndex: number) {
  await waitFor(() => {
    assertFullscreenRootsVisible(doc);

    const slide = getFullscreenSlide(doc, canonicalIndex);
    expect(slide).not.toBeNull();

    const image = slide!.querySelector<HTMLImageElement>('[data-rmg-fs-media="true"] img');
    expect(image).not.toBeNull();

    const style = getComputedStyle(image!);
    expect(style.visibility).not.toBe("hidden");
    expect(style.opacity).not.toBe("0");
  });
}

async function closeFullscreen(doc: Document) {
  await userEvent.click(await within(doc.body).findByRole("button", { name: "Close" }));

  await waitFor(() => {
    const modal = doc.body.querySelector<HTMLElement>(".fs_modal");
    const slider = doc.body.querySelector<HTMLElement>(".fullscreen_slider");

    expect(modal).not.toBeNull();
    expect(slider).not.toBeNull();
    expect(getComputedStyle(modal!).opacity).toBe("0");
    expect(getComputedStyle(modal!).pointerEvents).toBe("none");
    expect(getComputedStyle(slider!).opacity).toBe("0");
  });
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
        images: { enabled: true },
        videos: { enabled: true },
      },
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
        <BaseVisibleProbe testId={GRID_CONNECTION_PROBE} />
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

function LazyLoadDemo() {
  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Grid lazyLoad</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Grid owns image lazy loading and per-item spinners. Mixed text remains visible immediately.
      </p>

      <GalleryCore layout="grid" fullscreenItems={IMG_ITEMS.slice(0, 8) as any}>
        <BaseVisibleProbe testId={GRID_LAZY_PROBE} />
        <Grid
          columns={{ 0: 1, 640: 2, 960: 3, 1280: 4 }}
          gap={12}
          lazyLoad={{
            enabled: true,
          }}
          loading={{
            skeleton: {
              layout: {
                kind: "grid",
                item: { kind: "rect", style: { aspectRatio: "4/5" } },
              },
            },
          }}
          intro={{
            durationMs: 1000,
            staggerMs: 100,
          }}
        >
          {IMG_ITEMS.slice(0, 8).map((src, i) => (
            <article
              key={`lazy-grid-${src}`}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
              }}
            >
              <img
                src={src}
                alt={`Lazy grid ${i + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  display: "block",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#10253d" }}>
                  Card {i + 1}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.4, color: "#526173" }}>
                  Copy stays visible while the image loads.
                </div>
              </div>
            </article>
          ))}
        </Grid>
        <FullscreenAddon
          sliderObject={{ align: "center", direction: { dir: "ltr" } }}
          cellsStateLength={8}
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
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const targetIndex = 11;

    let target: HTMLElement | null = null;
    await waitFor(() => {
      target = canvasElement.querySelector<HTMLElement>(`[data-rmg-idx="${targetIndex}"]`);
      expect(target).not.toBeNull();
    });

    target!.scrollIntoView({ block: "center" });
    await waitForProbeIndex(canvasElement, GRID_CONNECTION_PROBE, targetIndex);

    await userEvent.click(target!);
    await waitForVisibleFullscreenImage(doc, targetIndex);
    await closeFullscreen(doc);
  },
};

export const LazyLoad: Story = {
  render: () => <LazyLoadDemo />,
  play: async ({ canvasElement }) => {
    const targetIndex = 6;

    let target: HTMLElement | null = null;
    await waitFor(() => {
      target = canvasElement.querySelector<HTMLElement>(`[data-rmg-idx="${targetIndex}"]`);
      expect(target).not.toBeNull();
    });

    target!.scrollIntoView({ block: "center" });
    await waitForProbeIndex(canvasElement, GRID_LAZY_PROBE, targetIndex);
    expect(getSeenIndices(canvasElement, GRID_LAZY_PROBE).filter((idx) => idx === targetIndex)).toHaveLength(1);
  },
};
