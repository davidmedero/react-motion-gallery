/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { Entries, flattenEntries } from "../../../packages/react-motion-gallery/src/Gallery/entries";
import { createEntriesMasonryMedia } from "../../../packages/react-motion-gallery/src/Gallery/entries/media/masonry";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";

type Entry = {
  id: string;
  title?: string;
  media: Array<{ kind: "image" | "video"; src: string; alt?: string }>;
};

const ENTRIES: Entry[] = [
  {
    id: "entry-1",
    title: "Entry 1",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/900", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e1-2/1200/1200", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e1-3/1300/1600", alt: "" },
    ],
  },
  {
    id: "entry-2",
    title: "Entry 2",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e2-1/1100/800", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e2-2/1200/1000", alt: "" },
    ],
  },
  {
    id: "entry-3",
    title: "Entry 3",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e3-1/1000/1500", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-3/1100/900", alt: "" },
      { kind: "image", src: "https://picsum.photos/seed/e3-4/1500/1300", alt: "" },
    ],
  },
];

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

  const masonryMedia = createEntriesMasonryMedia({
    masonryObject: { columns: { xs: 2, md: 3 }, gap: 10 }
  });

  return (
    <div style={{ padding: 16, background: "#f6f7f9", minHeight: "100vh" }}>
      <GalleryCore layout="entries" fullscreenItems={fullscreenItems}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 12px" }}>Entries (Masonry media) ↔ Fullscreen overlay</h3>
          <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
            Click any entry media item. Fullscreen should open. Overlay should render.
          </p>

          <Entries
            entries={{
              items: entries,
              mediaLayout: "masonry",
              render: {
                card: renderCard,
                overlay: renderOverlay,
                media: ({ media, entryIndex, mediaIndex }) => (
                  <img
                    src={media.src}
                    alt={media.alt ?? ""}
                    style={{
                      borderRadius: 12,
                    }}
                    data-entry={entryIndex}
                    data-media={mediaIndex}
                  />
                )
              },
            }}
            fullscreen={{ enabled: true }}
            renderMediaContainer={masonryMedia}
          />
        </div>

        <FullscreenAddon sliderObject={sliderObject} cellsStateLength={fullscreenItems.length} />
      </GalleryCore>
    </div>
  );
}

const meta: Meta = {
  title: "RMG/Tests/Entries/Masonry Media + Fullscreen Overlay",
  component: Demo,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj;

export const Entries_MasonryMedia_WithFsOverlay: Story = {
  render: () => <Demo />,
};