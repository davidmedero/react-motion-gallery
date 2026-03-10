/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GalleryCore, useGalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { Entries, flattenEntries } from "../../../packages/react-motion-gallery/src/Gallery/entries";
import { createEntriesGridMedia } from "../../../packages/react-motion-gallery/src/Gallery/entries/media/grid";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

type Entry = {
  id: string;
  title?: string;
  media: Array<{ kind: "image" | "video"; src: string; alt?: string }>;
};

const ENTRIES_GRID_PROBE = "entries-grid-base-visible";

const ENTRIES: Entry[] = [
  {
    id: "entry-1",
    title: "Entry 1",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e1-2/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e1-3/1400/1100", alt: "" },
    ],
  },
  {
    id: "entry-2",
    title: "Entry 2",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e2-1/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e2-2/1400/1100", alt: "" },
    ],
  },
  {
    id: "entry-3",
    title: "Entry 3",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e3-1/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-3/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-4/1400/1100", alt: "" },
    ],
  },
];

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
  const entries = React.useMemo(() => ENTRIES as any, []);
  const flat = React.useMemo(() => flattenEntries(entries), [entries]);

  const fullscreenItems = React.useMemo(
    () => flat.flattenedMedia.map((m: any) => m.src),
    [flat]
  );

  const sliderObject = React.useMemo(
    () => ({
      align: "center",
      direction: { dir: "ltr" },
    }),
    []
  );

  const renderCard = React.useCallback(({ entry, media }: any) => {
    return (
      <article
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 700 }}>{entry.title ?? entry.id}</div>
          <div style={{ opacity: 0.6, fontSize: 12 }}>{(entry.media?.length ?? 0)} media</div>
        </div>

        <div style={{ marginTop: 10 }}>{media}</div>
      </article>
    );
  }, []);

  const renderOverlay = React.useCallback(
    ({ entry, entryIndex, mediaIndex, opacity, style }: any) => {
      const title = entry?.title ?? entry?.id ?? `Entry ${entryIndex + 1}`;

      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            ...style,
            opacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 999,
                color: "#fff",
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              <span style={{ fontWeight: 700 }}>{title}</span>
              <span style={{ opacity: 0.8 }}>•</span>
              <span style={{ opacity: 0.95 }}>
                {typeof mediaIndex === "number" ? `Media ${mediaIndex + 1}` : "Media"}
              </span>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                maxWidth: 320,
                fontSize: 13,
                lineHeight: 1.3,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              This is <b>entries.render.overlay</b> in fullscreen.
              <div style={{ marginTop: 6, opacity: 0.9 }}>
                entryIndex={entryIndex}, mediaIndex={String(mediaIndex)}
              </div>
            </div>
          </div>
        </div>
      );
    },
    []
  );

  const gridMedia = createEntriesGridMedia({
    gridObject: { columns: { 0: 1, 500: 2, 768: 3 }, gap: 10 }
  });

  return (
    <div style={{ padding: 16, background: "#f6f7f9", minHeight: "100vh" }}>
      <GalleryCore layout="entries" fullscreenItems={fullscreenItems}>
        <BaseVisibleProbe testId={ENTRIES_GRID_PROBE} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 12px" }}>Entries (Grid media) ↔ Fullscreen overlay</h3>
          <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
            Click any entry media item. Fullscreen should open. Overlay should render.
          </p>

          <Entries
            entries={{
              items: entries,
              mediaLayout: "grid",
              render: {
                card: renderCard,
                overlay: renderOverlay,
                media: ({ media, entryIndex, mediaIndex }) => {
                  const src =
                    media.kind === "image" || media.kind === "video"
                      ? media.src
                      : "";
                  const alt =
                    media.kind === "image" || media.kind === "video"
                      ? media.alt ?? ""
                      : "";

                  return (
                    <img
                      src={src}
                      alt={alt}
                      style={{
                        width: "100%",
                        height: "320px",
                        display: "block",
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                      data-entry={entryIndex}
                      data-media={mediaIndex}
                    />
                  );
                }
              },
            }}
            fullscreen={{ enabled: true }}
            renderMediaContainer={gridMedia}
          />
        </div>

        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={fullscreenItems.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Entries/Grid Media + Fullscreen Overlay",
  component: Demo,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj;

export const Entries_GridMedia_WithFsOverlay: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const targetIndex = 8;

    let target: HTMLImageElement | null = null;
    await waitFor(() => {
      target = canvasElement.querySelector<HTMLImageElement>('[data-entry="2"][data-media="3"]');
      expect(target).not.toBeNull();
    });

    target!.scrollIntoView({ block: "center" });
    await waitForProbeIndex(canvasElement, ENTRIES_GRID_PROBE, targetIndex);

    await userEvent.click(target!);
    await waitForVisibleFullscreenImage(doc, targetIndex);
    await closeFullscreen(doc);
  },
};
