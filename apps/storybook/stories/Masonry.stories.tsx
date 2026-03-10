/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GalleryCore, useGalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import Masonry from "../../../packages/react-motion-gallery/src/Gallery/masonry";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

const COUNT = 18;
const MASONRY_CONNECTION_PROBE = "masonry-base-visible-connection";

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

function MasonryLazyCell({ src, i }: { src: string; i: number }) {
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
        alt={`Lazy masonry ${i + 1}`}
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

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Masonry ↔ Fullscreen connection test</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Click any masonry image. Fullscreen should open. Close it, and it should fully reset.
      </p>
      <GalleryCore layout="masonry" fullscreenItems={ITEMS}>
        <BaseVisibleProbe testId={MASONRY_CONNECTION_PROBE} />
        <Masonry
          columns={{ xs: 2, md: 3, lg: 4 }}
          gap={10}
        >
          {ITEMS.map((src, i) => (
            <div key={src}>
              <MasonryCell src={src} i={i} />
            </div>
          ))}
        </Masonry>
        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={ITEMS.length} />
      </GalleryCore>
    </div>
  );
}

function LazyLoadDemo() {
  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h3 style={{ margin: "0 0 12px" }}>Masonry lazyLoad</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Masonry keeps its current column layout while each image cell manages its own spinner.
      </p>
      <Masonry
        columns={{ xs: 2, md: 3, lg: 4 }}
        gap={10}
        lazyLoad={{
          enabled: true,
          spinner: ({ kind }) => (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#10253d",
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 10px 30px rgba(16,37,61,0.12)",
              }}
            >
              {kind}
            </div>
          ),
        }}
      >
        {ITEMS.map((src, i) => (
          <div key={`lazy-masonry-${src}`}>
            <MasonryLazyCell src={src} i={i} />
          </div>
        ))}
      </Masonry>
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
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const targetIndex = 16;

    let target: HTMLElement | null = null;
    await waitFor(() => {
      target = canvasElement.querySelector<HTMLElement>(
        `.rmg__masonry-item[data-rmg-idx="${targetIndex}"]`
      );
      expect(target).not.toBeNull();
    });

    target!.scrollIntoView({ block: "center" });
    await waitForProbeIndex(canvasElement, MASONRY_CONNECTION_PROBE, targetIndex);

    await userEvent.click(target!);
    await waitForVisibleFullscreenImage(doc, targetIndex);
    await closeFullscreen(doc);
  },
};

export const LazyLoad: Story = {
  render: () => <LazyLoadDemo />,
};
