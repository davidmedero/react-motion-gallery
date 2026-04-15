export const source = String.raw`"use client";

import { GalleryCore, useFullscreenController } from "react-motion-gallery";
import {
  Entries,
  createEntriesGridMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import styles from "./entries-grid-demo.module.css";

type DemoEntry = {
  id: string;
  section: string;
  title: string;
  body: string;
  media: Array<{
    kind: "image";
    src: string;
    alt: string;
  }>;
};

const ENTRIES: DemoEntry[] = [
  {
    id: "entry-1",
    section: "Campaign",
    title: "Roofline Session",
    body: "Three stills arranged as a compact contact sheet inside the entry card.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/1100", alt: "Editorial rooftop portrait" },
      { kind: "image", src: "https://picsum.photos/seed/e1-2/1400/1100", alt: "City skyline detail" },
      { kind: "image", src: "https://picsum.photos/seed/e1-3/1400/1100", alt: "Rooftop jacket detail" },
    ],
  },
  {
    id: "entry-2",
    section: "Interiors",
    title: "Kitchen Pass",
    body: "A tighter pair of frames keeps the middle card from reading too heavy.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e2-1/1400/1100", alt: "Kitchen counter and shelving" },
      { kind: "image", src: "https://picsum.photos/seed/e2-2/1400/1100", alt: "Ceramics on a kitchen shelf" },
    ],
  },
  {
    id: "entry-3",
    section: "Travel",
    title: "Station Study",
    body: "The largest entry uses four frames so the grid variant shows off denser media.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e3-1/1400/1100", alt: "Train platform signage" },
      { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "Window reflections at a station" },
      { kind: "image", src: "https://picsum.photos/seed/e3-3/1400/1100", alt: "Passengers crossing a platform" },
      { kind: "image", src: "https://picsum.photos/seed/e3-4/1400/1100", alt: "Station architecture detail" },
    ],
  },
];

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_GRID_MEDIA = createEntriesGridMedia({
  gridObject: {
    columns: { 0: 1, 640: 2, 960: 3 },
    gap: 12,
  },
});

function renderEntryCard({ entry, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <article className={styles.entryCard}>
      <div className={styles.entryMeta}>
        <div>
          <span className={styles.entryKicker}>{item.section}</span>
          <h3 className={styles.entryTitle}>{item.title}</h3>
        </div>
        <span className={styles.entryCount}>{item.media.length} tiles</span>
      </div>
      <p className={styles.entryBody}>{item.body}</p>
      <div className={styles.entryMedia}>{media}</div>
    </article>
  );
}

function renderEntryMedia({ media }: EntryMediaRenderArgs) {
  if (media.kind !== "image") return null;

  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      className={styles.entryGridImage}
    />
  );
}

function renderEntryOverlay({ entry, mediaIndex }: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <span className={styles.entryOverlayMeta}>Tile {String((mediaIndex ?? 0) + 1)}</span>
    </div>
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function EntriesGridDemo() {
  return (
    <div className={styles.shell}>
      <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
        <Entries
          entries={{
            items: ENTRIES,
            mediaLayout: "grid",
            render: {
              card: renderEntryCard,
              media: renderEntryMedia,
              overlay: renderEntryOverlay,
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={ENTRY_GRID_MEDIA}
        />
        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}`;
